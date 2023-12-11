import { Component, OnInit, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { XcashDelegatesService } from 'src/app/services/xcash-delegates.service';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { Delegate } from 'src/app/models/delegates';
import { faRefresh, faBroom, faPaste, faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import { XcashCurrencyPipe } from 'src/app/pipes/xcash-currency.pipe';
import { rpcReturn } from 'src/app/models/rpc-return';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
declare var $: any;

@Component({
	selector: 'app-wallet-staking',
	templateUrl: './wallet-staking.component.html',
	styleUrls: ['./wallet-staking.component.sass']
})
export class WalletStakingComponent implements OnInit {
	@ViewChild('delegatestable') table!: ElementRef;
	faRefresh = faRefresh;
	faBroom = faBroom;
	faPaste = faPaste;
	faSquareCheck = faSquareCheck;
	walletaddress: string = '';
	delegates: Delegate[] = [];
	message: string = '';
	showspinner: boolean = true;
	showspinnerdel: boolean = true;
	displayMessage: boolean = true;
	showVoteModal: boolean = false;
	showRevoteModal: boolean = false;
	showSweepModal: boolean = false;
	currentDelegate: string = '';
	delegateVote: string = '';
	delegated: boolean = false;
	walletname: string = '';
	hidedelegates: boolean = true;
	delegateName: string = '';
	nameCk: string = '';
	initMessage: string = 'Connecting to Delegates API...';
	displayDelegates = [{ id: 0, name: "", fee: 0, vote_count: 0, online_percentage: 0, vtotal_rounds: 0, total_rounds: 0 }];

	@Input() xcashbalance: number = 0;
	@Output() onClose = new EventEmitter();

	constructor(
		private route: ActivatedRoute,
		private xcashdelegatesservice: XcashDelegatesService,
		private rpcCallsService: RpcCallsService,
		private xcashCurrencyPipe: XcashCurrencyPipe,
		private validatorsRegexService: ValidatorsRegexService,
	) { };

	ngOnInit(): void {
		this.walletname = this.route.snapshot.paramMap.get('wname') ?? '';
		this.walletaddress = this.route.snapshot.paramMap.get('waddress') ?? '';
		this.nameCk = this.validatorsRegexService.delegate_name;
		this.displayDelegates = [];
		this.getVoteStatus();
		this.getDelegates();
	}

	async getVoteStatus(): Promise<void> {
		const response: rpcReturn = await this.rpcCallsService.check_vote_status();
		if (response.status) {
			this.delegated = true;
			let splitData = response.data.split(', ');
			let delegateName = splitData[0];
			let totalValue = splitData[1].split(': ')[1];
			let transformedTotalValue = this.xcashCurrencyPipe.transform(totalValue, '1.0-2');
			this.currentDelegate = delegateName + ' amount staked: ' + transformedTotalValue
		} else {
			if (response.data == 'novote') {
				this.currentDelegate = 'This wallet has not staked to a delegate.';
			} else {
				this.showMessage(response.message);
			}
		}
		this.showspinner = false;
	}

	async getDelegates(): Promise<void> {
		let data: any = "";
		try {
			data = await this.xcashdelegatesservice.getDelegates();
		} catch (error) { }
		if (Array.isArray(data)) {
			this.displayMessage = false;
			this.delegates = data;
			let indx = 1;
			for (const delegate of this.delegates) {
				if (delegate.sharedDelegate && delegate.online) {
					this.displayDelegates.push({
						id: indx,
						name: delegate.delegateName,
						fee: delegate.fee,
						vote_count: Math.round(delegate.votes / 1000000),
						vtotal_rounds: delegate.totalRounds,
						online_percentage: delegate.onlinePercentage,
						total_rounds: delegate.totalBlockProducerRounds
					});
					indx++;
				}
			}
			await new Promise(resolve => setTimeout(resolve, 1000));
			$(this.table.nativeElement).DataTable({
				lengthMenu: [5, 25, 50, 100],
				pageLength: 5
			});
			this.hidedelegates = false;
		} else {
			this.showspinner = false;
			this.initMessage = 'The xCash API is not responding. You will need to enter the Delegate name manually.';
			await new Promise(resolve => setTimeout(resolve, 5000));
			this.displayMessage = false;
		}
		this.showspinnerdel = false;
	}

	async sweepTrans() {
		this.showSweepModal = true;
	}

	reVote(): void {
		if (this.delegated) {
			this.showRevoteModal = true;
		} else {
			this.showMessage('You need to vote for a delegate before using the revote option.');
		}
	}

	castVote(delegate: string): void {
		this.delegateVote = delegate;
		this.showVoteModal = true;
	}

	exitVoteModal(): void {
		this.showVoteModal = false;
	}

	exitReVoteModal(): void {
		this.showRevoteModal = false;
	}

	exitSweepModal(): void {
		this.showSweepModal = false;
	}

	showMessage(message: string): void {
		this.message = message;
	}

	async onPaste(event: Event, infield: string): Promise<void> {
		event.preventDefault(); // prevent default paste behavior
		try {
			const clipboardText = await navigator.clipboard.readText();
			if (infield === 'name') {
				this.delegateName = clipboardText;
			} else {
				this.delegateName = clipboardText;
			}
		} catch (err) {
			console.error('Failed to read clipboard contents: ', err);
		}
	}

}
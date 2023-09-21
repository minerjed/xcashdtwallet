import { AfterViewInit, Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { XcashDelegatesService } from 'src/app/services/xcash-delegates.service';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { Delegate } from 'src/app/models/delegates';
import { faRefresh, faBroom } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { XcashCurrencyPipe } from 'src/app/pipes/xcash-currency.pipe';
import { DataTableDirective } from 'angular-datatables';
declare var $: any;

@Component({
	selector: 'app-wallet-staking',
	templateUrl: './wallet-staking.component.html',
	styleUrls: ['./wallet-staking.component.sass']
})
export class WalletStakingComponent implements OnInit, AfterViewInit {
	@ViewChild(DataTableDirective, { static: false })
	dtElement!: DataTableDirective;
	@ViewChild('stakingForm', { static: false }) stakingForm!: NgForm;
	faRefresh = faRefresh;
	faBroom = faBroom;
	dtOptions: DataTables.Settings = { "deferRender": true };
	dtTrigger: Subject<any> = new Subject<any>();
	walletaddress: string = '';
	delegates: Delegate[] = [];
	message: string = ''; 
	showspinner: boolean = true;
	showspinnerGetDel: boolean = true;
	notrans: boolean = true;
	showVoteModal: boolean = false;
	showRevoteModal: boolean = false;
	showSweepModal: boolean = false;
	currentDelegate: string = '';
	delegateVote: string = '';
	delegated: boolean = false;
	walletname: string = '';
	initMessage: string = 'Connecting to Delegates Explorer...';
	displayDelegates = [{ id: 0, name: "", fee: "", vote_count: 0, online_percentage: "", vtotal_rounds: "", total_rounds: "" }];

	@Input() xcashbalance: number = 0;
	@Output() onClose = new EventEmitter();

	constructor(
		private route: ActivatedRoute,
		private xcashdelegatesservice: XcashDelegatesService,
		private rpcCallsService: RpcCallsService,
		private xcashCurrencyPipe: XcashCurrencyPipe
	) { };

	ngOnInit(): void {
		this.walletname = this.route.snapshot.paramMap.get('wname') ?? '';
		this.walletaddress = this.route.snapshot.paramMap.get('waddress') ?? '';
		this.displayDelegates = [];
		this.getVoteStatus();
		this.getDelegates();
	}

	async getVoteStatus(): Promise<void> {
		const data = await this.rpcCallsService.check_vote_status();
		if (Array.isArray(data)) {
			const ckerror: any = data;
			this.showMessage(ckerror.error.message);
		} else if (data === 'novote') {
			this.currentDelegate = 'This wallet has not staked to a delegate.';
		} else if (data === 'error') {
			this.currentDelegate = 'Error occured checking delegate status.';
		} else {
			this.delegated = true;
			let splitData = data.split(', ');
			let delegateName = splitData[0];
			let totalValue = splitData[1].split(': ')[1];
			let transformedTotalValue = this.xcashCurrencyPipe.transform(totalValue, '1.0-2');
			this.currentDelegate = delegateName + ' amount staked: ' + transformedTotalValue;
		}
		this.showspinnerGetDel = false;
	}


	async getDelegates(): Promise<void> {
		const data = await this.xcashdelegatesservice.getDelegates();
		if (Array.isArray(data)) {
			this.notrans = false;
			this.delegates = data;
			let indx = 1;
			for (const delegate of this.delegates) {
				if (delegate.shared_delegate_status === 'shared' && delegate.online_status === 'true') {
					this.displayDelegates.push({
						id: indx,
						name: delegate.delegate_name,
						fee: delegate.delegate_fee,
						vote_count: Math.round(parseFloat(delegate.total_vote_count) / 1000000),
						vtotal_rounds: delegate.block_verifier_total_rounds,
						online_percentage: delegate.block_verifier_online_percentage,
						total_rounds: delegate.block_producer_total_rounds
					});
					indx++;
				}
			}
			this.dtTrigger.next(this.displayDelegates);
			await new Promise(resolve => setTimeout(resolve, 500));
			this.changePageLength(3);
		} else {
			this.displayDelegates = [{ id: 0, name: "", fee: "", vote_count: 0, online_percentage: "", vtotal_rounds: "", total_rounds: ""}];
		}
	}

	async waitForArray() {
		while (this.displayDelegates.length < 1) {
			// Wait for a short time before checking again
			await new Promise(resolve => setTimeout(resolve, 1000));
		}
		if (this.notrans) {
			this.showspinner = false;
			this.initMessage = 'The Delegates Exporer site is not responding. Please check back in a few minutes.';
			await new Promise(resolve => setTimeout(resolve, 3700));
			this.onClose.emit();
		}
		this.showspinner = false;
	}

	ngAfterViewInit(): void {
		this.waitForArray();
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

	castVote(delegate: string): void {;
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

	ngOnDestroy(): void {
		this.dtTrigger.unsubscribe();
	}

	changePageLength(newLength: number): void {
		// I think a bug in angular-datatable is preventing the setting of dtoptions so created this workaround for now
		const dtInstance = this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
		  dtInstance.page.len(newLength).draw();
		});
		$('div.dataTables_length').find('select, label').remove();
		var newDropdown = $('<select></select>');
		newDropdown.append('<option value="3">3</option>');
		newDropdown.append('<option value="10">10</option>');
		newDropdown.append('<option value="25">25</option>');
		newDropdown.append('<option value="50">50</option>');
		newDropdown.append('<option value="100">100</option>');
		$('div.dataTables_length').append(newDropdown);
		var table = $('#myTable').DataTable();
		$('div.dataTables_length').append('<label>Show </label>').append(newDropdown).append(' entries');
		newDropdown.on('change', () => {
		  this.dtElement?.dtInstance.then((dtInstance: DataTables.Api) => {
			const val = newDropdown.val();
			if (typeof val === 'number' || (typeof val === 'string' && !isNaN(+val))) {
			  dtInstance.page.len(+val).draw();
			}
		  });
		});
	  }

}
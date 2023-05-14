import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { Subject } from 'rxjs';
import { Transaction } from 'src/app/models/transaction';

@Component({
	selector: 'app-wallet-trans',
	templateUrl: './wallet-trans.component.html',
	styleUrls: ['./wallet-trans.component.sass']
})
export class WalletTransComponent implements OnInit, AfterViewInit {
	dtOptions: DataTables.Settings = { "deferRender": true };
	dtTrigger: Subject<any> = new Subject<any>();
	walletname: string = '';
	walletpw: string = '';
	transactions: Transaction[] = [];
	message: string = '';
	showLoginModal: boolean = true;
	hidetrans: boolean = true;
	walletopen: boolean = false;
	notrans: boolean = false;
	showTransModal: boolean = false;
	txid: string = '';

	constructor(
		private route: ActivatedRoute,
		private rpcCallsService: RpcCallsService,
	) { };

	async getTransactions(): Promise<void> {
		try {
			this.transactions = await this.rpcCallsService.getTransactions();
		} catch (error) {
			console.log(error);
			throw error;
		}
	}

	ngOnInit(): void {
		this.walletname = this.route.snapshot.paramMap.get('wname') ?? '';
		this.getTransactions();
	}

	async waitForArray() {
		while (this.transactions.length < 1) {
			// Wait for a short time before checking again
			await new Promise(resolve => setTimeout(resolve, 100));
		}
		// Hide the transactions until ready to display
		if (this.transactions[0].id === 0) {
			this.transactions = [];
			this.notrans = true;
			this.hidetrans = false;
		} else if (this.transactions.length >= 1 && this.transactions[0].id !== 0) {
			this.dtTrigger.next(this.transactions);
			await new Promise(resolve => setTimeout(resolve, 1000));
			this.hidetrans = false;
		}
	}

	ngAfterViewInit(): void {
		this.waitForArray();
	}

	showdetails(id: number): void {
		let trans: any = '';
		trans = this.transactions.find(transaction => transaction.id === id);
		this.txid = trans.txid;
		this.showTransModal = true;
	}

	closeDetModal(): void {
		this.showTransModal = false;
	}

	ngOnDestroy(): void {
		this.dtTrigger.unsubscribe();
	}
}
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { Transaction } from 'src/app/models/transaction';
import { rpcReturn } from 'src/app/models/rpc-return';
declare var $: any;

@Component({
	selector: 'app-wallet-trans',
	templateUrl: './wallet-trans.component.html',
	styleUrls: ['./wallet-trans.component.sass']
})
export class WalletTransComponent implements OnInit {
	@ViewChild('transtable') table!: ElementRef;
	walletname: string = '';
	walletpw: string = '';
	transactions: Transaction[] = [];
	message: string = '';
	showLoginModal: boolean = true;
	hidetrans: boolean = true;
	notrans: boolean = false;
	showTransModal: boolean = false;
	txid: string = '';
	wscount: number = 0;
	showSpinner = true;

	constructor(
		private route: ActivatedRoute,
		private rpcCallsService: RpcCallsService,
	) { };

	async ngOnInit() {
		this.walletname = this.route.snapshot.paramMap.get('wname') ?? '';
		const response: rpcReturn = await this.rpcCallsService.getTransactions();
		if (response.status) {
			this.transactions = response.data;
			if (this.transactions[0].id === 0) {
				this.transactions = [];
				this.notrans = true;
				this.hidetrans = false;
			} else if (this.transactions.length >= 1 && this.transactions[0].id !== 0) {
				await new Promise(resolve => setTimeout(resolve, 1000));
				if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
					$(this.table.nativeElement).DataTable().destroy();
				}
				$(this.table.nativeElement).DataTable({
					lengthMenu: [7, 25, 50, 100],
					pageLength: 7,
					"drawCallback": () => {
						this.onLoaded();
					}
  				});
			}
		} else {
			this.message = response.message;
		}
		this.showSpinner = false;
	}

	onLoaded() {
		this.hidetrans = false;
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

	showMessage(message: string): void {
		this.message = message;
	}

}
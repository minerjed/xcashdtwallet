import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { Transaction } from 'src/app/models/transaction';
import { rpcReturn } from 'src/app/models/rpc-return';
import { XcashGetblockhightService } from 'src/app/services/xcash-getblockhight.service';
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
	showSpinner: boolean = true;
	showBH: number = 0;
	blockheight: any = 0;
	displayB: string = 'Checking wallet block height.';

	constructor(
		private route: ActivatedRoute,
		private rpcCallsService: RpcCallsService,
		private xcashgetblockhightService: XcashGetblockhightService
	) { };

	async ngOnInit() {
		this.walletname = this.route.snapshot.paramMap.get('wname') ?? '';
		try {
			const data = await this.xcashgetblockhightService.getDelegates();
			if ('height' in data) {
				this.blockheight = data.height;
			}
		} catch (error) { }
		const wsdata: rpcReturn = await this.rpcCallsService.getCurrentBlockHeight();
		if (wsdata.status) {
			this.showBH = wsdata.data;
			if (this.blockheight !== 0) {
				while (this.showBH < this.blockheight) {
					await new Promise(resolve => setTimeout(resolve, 1000));
					const wsdataL: rpcReturn = await this.rpcCallsService.getCurrentBlockHeight();
					if (wsdataL.status) {
						this.showBH = wsdataL.data;
						const blocksbehind = this.blockheight - this.showBH;
						if (blocksbehind === 1) {
							this.displayB = '1 block';
						} else {
							this.displayB = blocksbehind + ' blocks';
						}
					} else {
						this.message = wsdata.message;
						this.showSpinner = false;
						break;
					}
				}
				this.displayB = '0 blocks'
			}
		}
		const response: rpcReturn = await this.rpcCallsService.getTransactions();
		if (response.status) {
			this.transactions = response.data;
			if (this.transactions[0].id === 0) {
				this.transactions = [];
				this.notrans = true;
				this.hidetrans = false;
				this.showSpinner = false;
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
			this.showSpinner = false;
		}
	}

	async onLoaded() {
		this.hidetrans = false;
		this.showSpinner = false;
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
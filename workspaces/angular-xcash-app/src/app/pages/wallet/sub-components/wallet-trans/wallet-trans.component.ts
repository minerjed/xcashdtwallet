import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { Subject } from 'rxjs';
import { Transaction } from 'src/app/models/transaction';
import { DataTableDirective } from 'angular-datatables';
import { rpcReturn } from 'src/app/models/rpc-return';
declare var $: any;

@Component({
	selector: 'app-wallet-trans',
	templateUrl: './wallet-trans.component.html',
	styleUrls: ['./wallet-trans.component.sass']
})
export class WalletTransComponent implements OnInit, AfterViewInit {
	@ViewChild(DataTableDirective, { static: false })
	dtElement!: DataTableDirective;
	dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	walletname: string = '';
	walletpw: string = '';
	transactions: Transaction[] = [];
	message: string = '';
	showLoginModal: boolean = true;
	hidetrans: boolean = true;
	notrans: boolean = false;
	showTransModal: boolean = false;
	txid: string = '';
	showSpinner = true;

	constructor(
		private route: ActivatedRoute,
		private rpcCallsService: RpcCallsService,
	) { };

	async getTransactions(): Promise<void> {
		const response: rpcReturn = await this.rpcCallsService.getTransactions();
		if (response.status) {
			this.transactions = response.data;
		} else {
			this.message = response.message;
		}
		this.showSpinner = false;
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
			await new Promise(resolve => setTimeout(resolve, 1000));
			this.dtTrigger.next(this.transactions);
			await new Promise(resolve => setTimeout(resolve, 500));
			this.changePageLength(7);
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

	changePageLength(newLength: number): void {
		// I think a bug in angular-datatable is preventing the setting of dtoptions so created this workaround for now
		const dtInstance = this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
			dtInstance.page.len(newLength).draw();
		});
		$('div.dataTables_length').find('select, label').remove();
		var newDropdown = $('<select></select>');
		newDropdown.append('<option value="7">7</option>');
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

	showMessage(message: string): void {
		this.message = message;
	}
}
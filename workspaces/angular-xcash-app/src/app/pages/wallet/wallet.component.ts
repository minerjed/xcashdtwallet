import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { faCopy, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { XcashPriceIndexService } from 'src/app/services/xcash-price-index.service';
import { Observable, Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WindowApiConst } from 'shared-lib';
import { CurrencyService } from 'src/app/services/currency.service';

interface XCashPriceData {
	[key: string]: {
		[currency: string]: number;
	};
}
const fs: any = window['electronFs'];
const APIs: any = window['electronAPIs'];

@Component({
	selector: 'app-wallet',
	templateUrl: './wallet.component.html',
	styleUrls: ['./wallet.component.sass']
})
export class WalletComponent implements OnInit {
	wdir = APIs.platform !== "win32" ? `${APIs.homeDir}${WindowApiConst.XCASHOFFICAL}` : (`${APIs.userProfile}\\${WindowApiConst.XCASHOFFICAL}\\`).replace(/\\/g, "\\\\");
	dbfile: string = `${this.wdir}database.txt`;
	faCopy = faCopy;
	faRefresh = faRefresh;
	walletaddress: string = '';
	walletname: string = '';
	walletpw: string = '';
	message: string = '';
	modalmessage: string = '';
	showLoginModal: boolean = true;
	walletopen: boolean = false;
	showtab: number = 0;
	xcashbalance: number = 0;
	toXCASH: number = 0;
	data$: Observable<any> | undefined;
	xcashsubscription: Subscription | undefined;
	private destroy$ = new Subject<void>();
	currencySymbol: string = '';
	displayValue: any = '';

	constructor(
		private route: ActivatedRoute,
		private rpcCallsService: RpcCallsService,
		private xcashPriceIndexService: XcashPriceIndexService,
		public currencyService: CurrencyService
	) { };

	selectedLoginWallet(walletpw: string): void {
		// check for wallet and try and log in
		this.walletpw = walletpw;
		this.openwallet();
		this.getbalance();
	}

	async openwallet(): Promise<void> {
		this.modalmessage = await this.rpcCallsService.openWallet(this.walletname, this.walletpw);
		if (this.modalmessage) {
			this.walletpw = '';
		} else {
			this.walletopen = true;
			this.showLoginModal = false;
		}
	}

	async getbalance(): Promise<void> {
		while (this.walletopen === false) {
			await new Promise(resolve => setTimeout(resolve, 500));
		}
		this.xcashbalance = await this.rpcCallsService.getBalance();
	}

	onTabClick(tab: number): void {
		this.showtab = tab;
	}

	showMessage(message: string): void {
		this.message = message;
	}

	ngOnInit(): void {
		this.currencySymbol = this.currencyService.tocurrency;
		this.walletname = this.route.snapshot.paramMap.get('wname') ?? '';
		this.walletaddress = this.route.snapshot.paramMap.get('waddress') ?? '';
		this.data$ = this.xcashPriceIndexService.getPrice();
		this.xcashsubscription = this.data$.subscribe(data => {
			this.toXCASH = data['x-cash'][`${this.currencyService.tocurrency.toLowerCase()}`];
		});
		this.currencyService.tocurrencyChanged
			.pipe(takeUntil(this.destroy$))
			.subscribe(newCurrency => {
				this.handleCurrencyChange(newCurrency);
			});
	}

	handleCurrencyChange(newCurrency: string): void {
		this.xcashPriceIndexService.getPrice().subscribe((data: any) => {
			const typedData = data as XCashPriceData;
			this.toXCASH = typedData['x-cash'][`${newCurrency.toLowerCase()}`];
			this.currencySymbol = newCurrency;
		});
	}

	copyToClipboard(value: string) {
		navigator.clipboard.writeText(value)
			.then(() => {})
			.catch(err => {
				console.error('Failed to copy text: ', err);
			});
	}

	async waitForLogin() {
		while (this.walletopen === false) {
			await new Promise(resolve => setTimeout(resolve, 500));
		}
		this.showtab = 1;
	}

	ngAfterViewInit(): void {
		this.waitForLogin();
	}

	async ngOnDestroy(): Promise<void> {
		if (this.walletopen) {
			this.refreshBalance();
			await new Promise(resolve => setTimeout(resolve, 500));
			this.rpcCallsService.closeWallet();
		}
		if (this.xcashsubscription) {
			this.xcashsubscription.unsubscribe();
		}
		this.destroy$.next();
		this.destroy$.complete();
	}

	async refreshBalance(): Promise<void> {
		this.xcashbalance = await this.rpcCallsService.getBalance();
		this.updateWalletBalance(this.xcashbalance);
	}

	async updateWalletBalance(balance: number): Promise<void> {
		try {
			const dbFile = fs.readFileSync(this.dbfile, "utf8");
			const walletCount = JSON.parse(dbFile).wallet_data.findIndex((wallet: { wallet_name: string; }) => wallet.wallet_name === this.walletname);
			if (walletCount === -1) {
				this.showMessage('Wallet was not found for update.')
				return;
			}
			const databaseData = JSON.parse(dbFile);
			databaseData.wallet_data[walletCount].balance = balance;
			fs.writeFileSync(this.dbfile, JSON.stringify(databaseData));
		} catch (error: any) {
			this.showMessage(`Error updating wallet balance: ${error.message}`)
			return;
		}
	}
}
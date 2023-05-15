import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { XcashPriceIndexService } from 'src/app/services/xcash-price-index.service';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import { ChangeDetectorRef } from '@angular/core';
import { CurrencyService } from 'src/app/services/currency.service';

@Component({
	selector: 'app-wallet-send',
	templateUrl: './wallet-send.component.html',
	styleUrls: ['./wallet-send.component.sass']
})
export class WalletSendComponent implements OnInit {

	@Input() toXCASH: number = 0;
	@Input() xcashbalance: number = 0;
	@Input() currencySymbol: string = '';

	constructor(
		private route: ActivatedRoute,
		private rpcCallsService: RpcCallsService,
		private xcashPriceIndexService: XcashPriceIndexService,
		private validatorsRegexService: ValidatorsRegexService,
		private constantsService: ConstantsService,
		private changeDetectorRef: ChangeDetectorRef,
		public currencyService: CurrencyService
	) { };

	faClipboard = faClipboard;
	xcashaddressCk: string = '';
	paymentidCk: string = '';
	paymentidlen1: number = 0;
	paymentidlen2: number = 0;
	amountCk: string = '';
	toAddress: string = '';
	toPaymentId: string = '';
	toAmount: any = '';
	toPrivacy: string = 'private';
	toMax: boolean = false;
	walletname: string = '';
	message: string = '';
	showspinner: boolean = false;
	showmain: boolean = true;
	showconfirm: boolean = false;
	txFee: number = 0;
	txAmount: number = 0;
	txPrivacy: string = '';
	infoMessage: string = '';
	sendPaymentData: object | unknown;

	// XCA1XPTG3pCNoNQvx3qSmRh9uif4fNBBMgLDBUtYkWW687R9NrqVKinLVdJTqQkGnUNkxoiPbeUAjKNGpUjzGxWB4Ba7BBNSm1

	ngOnInit(): void {
		this.walletname = this.route.snapshot.paramMap.get('wname') ?? '';
		this.xcashaddressCk = this.validatorsRegexService.xcash_address;
		this.paymentidCk = this.validatorsRegexService.payment_id;
		this.amountCk = this.validatorsRegexService.xcash_amount;
		this.paymentidlen1 = this.constantsService.encrypted_payment_id_length;
		this.paymentidlen2 = this.constantsService.unencrypted_payment_id_length;
	}

	async submitSend() {
		this.showspinner = true;
		let data: any = await this.rpcCallsService.sendPayment(this.toAddress, this.toPaymentId,
			this.toAmount, this.toPrivacy, true);
		this.showspinner = false;
		if (data.status === 'success') {
			this.showmain = false;
			this.showconfirm = true;
			this.txFee = data.fee;
			this.txAmount = data.total;
			if (this.toPrivacy === 'private') {
				this.txPrivacy = 'Private';
			} else {
				this.txPrivacy = 'Public';	
			}
		} else {
			this.message = data.message;
		}
	}

	async onPaste(event: Event): Promise<void> {
		event.preventDefault(); // prevent default paste behavior
		try {
			const clipboardText = await navigator.clipboard.readText();
			this.toAddress = clipboardText;
			this.changeDetectorRef.detectChanges()
		} catch (err) {
			console.error('Failed to read clipboard contents: ', err);
		}
	}

	onCheckboxChange(): void {
		if (this.toMax) {
			this.toAmount = this.xcashbalance - (this.xcashbalance * this.constantsService.xcash_calc_fee);
		} else {
			this.toAmount = '';
		}
	}

	async confirmSend() {
		this.showspinner = true;
		let data: any = await this.rpcCallsService.sendPayment(this.toAddress, this.toPaymentId,
			this.toAmount, this.toPrivacy, false);
		this.showspinner = false;
		if (data.status === 'success') {
			this.showInfoMessage();
			this.toAddress = '';
			this.toPaymentId = '';
			this.toAmount = '';
			this.toPrivacy = 'private';
			this.toMax = false;
			this.showmain = true;
			this.showconfirm = false;
		} else {
			this.message = data.message;
		}
	}

	modifySend(): void{
		this.showmain = true;
		this.showconfirm = false;	
	}

	cancelSend(): void{
		this.toAddress = '';
		this.toPaymentId = '';
		this.toAmount = '';
		this.toPrivacy = 'private';
		this.toMax = false;
		this.showmain = true;
		this.showconfirm = false;
	}

	showMessage(message: string): void {
		console.log('in showMessage');
		this.message = message;
	}

	async showInfoMessage() {
		this.infoMessage = 'Transaction Sent Successfully.';
		await new Promise(resolve => setTimeout(resolve, 4000)); // Set the timer to expire after 4 seconds
		this.infoMessage = '';
	  }
	
}
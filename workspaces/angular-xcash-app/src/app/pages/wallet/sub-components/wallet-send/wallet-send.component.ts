import { Component, OnInit, Input } from '@angular/core';
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
//	walletaddress: string = '';
	sendPaymentData: object | unknown;

	
	
	
	// XCA1XPTG3pCNoNQvx3qSmRh9uif4fNBBMgLDBUtYkWW687R9NrqVKinLVdJTqQkGnUNkxoiPbeUAjKNGpUjzGxWB4Ba7BBNSm1

	ngOnInit(): void {
		this.walletname = this.route.snapshot.paramMap.get('wname') ?? '';
//		this.walletaddress = this.route.snapshot.paramMap.get('waddress') ?? '';
		this.xcashaddressCk = this.validatorsRegexService.xcash_address;
		this.paymentidCk = this.validatorsRegexService.payment_id;
		this.amountCk = this.validatorsRegexService.xcash_amount;
		this.paymentidlen1 = this.constantsService.encrypted_payment_id_length;
		this.paymentidlen2 = this.constantsService.unencrypted_payment_id_length;
	}

	async submitSend() {
		let data2:any = await this.rpcCallsService.sendPayment(this.toAddress, this.toPaymentId, 
			this.toAmount, this.toPrivacy, this.toMax, true);

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
			this.toAmount = this.xcashbalance; 
		  } else {
			this.toAmount = '';
		  }
	}

	ngOnDestroy(): void {

	}

}
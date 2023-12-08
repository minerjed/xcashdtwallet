import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { faPaste, faContactCard } from '@fortawesome/free-solid-svg-icons';
import { ChangeDetectorRef } from '@angular/core';
import { CurrencyService } from 'src/app/services/currency.service';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { Contact } from 'src/app/models/contact.model';
import { rpcReturn } from 'src/app/models/rpc-return';

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
		private validatorsRegexService: ValidatorsRegexService,
		private constantsService: ConstantsService,
		private changeDetectorRef: ChangeDetectorRef,
		public currencyService: CurrencyService,
		private router: Router,
		private databaseService: DatabaseService
	) { };

	faPaste = faPaste;
	faContactCard = faContactCard;
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
	contactModal: boolean = false;
	txFee: number = 0;
	txAmount: number = 0;
	txPrivacy: string = '';
	infoMessage: string = '';
	@ViewChild('toAddressInput', { static: false }) toAddressInput: any;
	@ViewChild('toPaymentIdInput', { static: false }) toPaymentIdInput: any;
	@ViewChild('toAmountInput', { static: false }) toAmountInput: any;
	sendPaymentData: object | unknown;
	modelData = { name: "", address: "" };
	contacts: Contact[] = [];
	contactName: any = "";
	noContacts: boolean = true;

	async ngOnInit() {
		this.contacts = await this.databaseService.getContacts();
		if (this.contacts.length >= 1) {
			this.noContacts = false;
		}
		this.walletname = this.route.snapshot.paramMap.get('wname') ?? '';
		this.xcashaddressCk = this.validatorsRegexService.xcash_address;
		this.paymentidCk = this.validatorsRegexService.payment_id;
		this.amountCk = this.validatorsRegexService.xcash_amount;
		this.paymentidlen1 = this.constantsService.encrypted_payment_id_length;
		this.paymentidlen2 = this.constantsService.unencrypted_payment_id_length;
	}

	async submitSend(isInvalid: any) {
		if (!isInvalid) {
			this.showspinner = true;
			const retdata: any = await this.rpcCallsService.sendPayment(this.toAddress, this.toPaymentId,
				this.toAmount, this.toPrivacy, true);
			if (retdata.status) {
				this.showmain = false;
				this.showconfirm = true;
				this.txFee = retdata.data.fee;
				this.txAmount = retdata.data.total;
				if (this.toPrivacy === 'private') {
					this.txPrivacy = 'Private';
				} else {
					this.txPrivacy = 'Public';
				}
			} else {
				this.message = retdata.message;
			}
			this.showspinner = false;
		} else {
			this.toAddressInput.control.markAsTouched();
			this.toPaymentIdInput.control.markAsTouched();
			this.toAmountInput.control.markAsTouched();
		}
	}

	async onPaste(event: Event): Promise<void> {
		event.preventDefault(); // prevent default paste behavior
		try {
			const clipboardText = await navigator.clipboard.readText();
			this.toAddress = clipboardText;
			this.changeDetectorRef.detectChanges()
			this.searchAddress();
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
		const response: rpcReturn = await this.rpcCallsService.sendPayment(this.toAddress, this.toPaymentId,
			this.toAmount, this.toPrivacy, false);
		this.showspinner = false;
		if (response.status) {
			this.showconfirm = false;
			this.infoMessage = 'Transaction Sent Successfully.';
			await new Promise(resolve => setTimeout(resolve, 4000));
			this.infoMessage = '';
			this.toAddress = '';
			this.toPaymentId = '';
			this.toAmount = '';
			this.toPrivacy = 'private';
			this.toMax = false;
			this.showmain = true;
		} else {
			this.message = response.message;
		}
	}

	modifySend(): void {
		this.showmain = true;
		this.showconfirm = false;
	}

	cancelSend(): void {
		this.toAddress = '';
		this.toPaymentId = '';
		this.toAmount = '';
		this.toPrivacy = 'private';
		this.toMax = false;
		this.showmain = true;
		this.showconfirm = false;
	}

	showMessage(message: string): void {
		this.message = message;
	}

	useContacts() {
		this.contactModal = true;
	}

	setsendAddress(data: any) {
		this.modelData = data;
		if (this.modelData.address != "") {
			this.toAddress = this.modelData.address;
			this.searchAddress();
		}
		this.contactModal = false;
	}

	searchAddress() {
		const foundContact = this.contacts.find(contact => contact.address === this.toAddress);
		if (foundContact?.address) {
			this.contactName = foundContact?.name;
		} else {
			this.contactName = "";
		}
	}

}
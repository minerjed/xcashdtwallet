import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { faPaste } from '@fortawesome/free-solid-svg-icons';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { rpcReturn } from 'src/app/models/rpc-return';
import { XcashCurrencyPipe } from 'src/app/pipes/xcash-currency.pipe';

@Component({
  selector: 'app-wallet-reserve-proof-verify',
  templateUrl: './wallet-reserve-proof-verify.component.html',
  styleUrls: ['./wallet-reserve-proof-verify.component.sass']
})
export class WalletReserveProofVerifyComponent implements OnInit {

  @Output() onClose = new EventEmitter<{}>();
  constructor(private validatorsRegexService: ValidatorsRegexService,
    private rpcCallsService: RpcCallsService,
    private constantsService: ConstantsService,
    private xcashcurrencyPipe: XcashCurrencyPipe
  ) { }

  faPaste = faPaste;
  rpMessage: string = '';
  rpAddress: string = '';
  rpSignature: string = '';
  dataCk: string = '';
  addressCk: string = '';
  rpCk: string = '';
  messageLength: number = 0;
  message: string = '';
  messageType: string = 'is-danger'
  showSpinner: boolean = false;
  spentAmt: string = '';
  totalAmt: string = '';
  hideAmounts: boolean = true;

  ngOnInit() {
    this.dataCk = this.validatorsRegexService.message_settings;
    this.addressCk = this.validatorsRegexService.xcash_address;
    this.rpCk = this.validatorsRegexService.reserve_proof;
    this.messageLength = this.constantsService.message_settings_length;
  }

  cancelVerify() {
    this.onClose.emit({});
  }

  async selectVerify(event: Event) {
    event.preventDefault();
    this.showSpinner = true;
    const passData = { message: this.rpMessage, public_address: this.rpAddress, reserveproof: this.rpSignature }
    const response: rpcReturn = await this.rpcCallsService.verifyReserveproof(passData);
    if (response.status) {
      if (response.data.good) {
        this.spentAmt = this.xcashcurrencyPipe.transform(response.data.spent /
          this.constantsService.xcash_decimal_places, '1.0-2');
        this.totalAmt = this.xcashcurrencyPipe.transform(response.data.total /
          this.constantsService.xcash_decimal_places, '1.0-2');
        this.hideAmounts = false;
        this.message = 'Signed Data Verifed Successfully'
        this.messageType = 'is-success';
      } else {
        this.message = 'Signed Data Verification Failed'
        this.messageType = 'is-danger';
      }
    } else {
      this.message = response.message;
      this.messageType = 'is-danger';
    }
    this.showSpinner = false;
  }

  showMessage(message: string): void {
    this.rpMessage = "";
    this.rpAddress = "";
    this.rpSignature = "";
    this.hideAmounts = true;
    this.message = message;
  }

  async onPaste(event: Event, infield: string): Promise<void> {
    event.preventDefault(); // prevent default paste behavior
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (infield === 'data') {
        this.rpMessage = clipboardText;
      } else {
        if (infield === 'addr') {
          this.rpAddress = clipboardText;
        } else {
          this.rpSignature = clipboardText;
        }
      }
    }
    catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  }

}
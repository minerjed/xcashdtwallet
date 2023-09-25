import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { faPaste } from '@fortawesome/free-solid-svg-icons';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';

@Component({
  selector: 'app-wallet-verify-sign-data',
  templateUrl: './wallet-verify-sign-data.component.html',
  styleUrls: ['./wallet-verify-sign-data.component.sass']
})
export class WalletVerifySignDataComponent implements OnInit {

  @Output() onClose = new EventEmitter<{}>();
  constructor(private validatorsRegexService: ValidatorsRegexService,
    private rpcCallsService: RpcCallsService,
    private constantsService: ConstantsService
  ) { }

  faPaste = faPaste;
  signData: string = '';
  signAddress: string = '';
  signature: string = '';
  dataCk: string = '';
  addressCk: string = '';
  signatureCk: string = '';
  messageLength: number = 0;
  message: string = '';
  messageType: string = 'is-danger'
  showSpinner: boolean = false;

  ngOnInit() {
    this.dataCk = this.validatorsRegexService.message_settings;
    this.addressCk = this.validatorsRegexService.xcash_address;
    this.signatureCk = this.validatorsRegexService.signature;
    this.messageLength = this.constantsService.message_settings_length;
  }

  cancelVerify() { this.onClose.emit({}); }

  async selectVerify() {
    this.showSpinner = true;
    const passData = { data: this.signData, public_address: this.signAddress, signature: this.signature }
    if (await this.rpcCallsService.verifySignedData(passData)) {
      this.message = 'Signed Data Verifed Successfully'
      this.messageType = 'is-success';
    } else {
      this.message = 'Signed Data Verification Failed'
      this.messageType = 'is-danger';
    }
    this.showSpinner = false;
  }

  showMessage(message: string): void {
    this.signData = "";
    this.signAddress = "";
    this.signature = "";
    this.message = message;
  }

  async onPaste(event: Event, infield: string): Promise<void> {
    event.preventDefault(); // prevent default paste behavior
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (infield === 'data') {
        this.signData = clipboardText;
      } else {
        if (infield === 'addr') {
          this.signAddress = clipboardText;
        } else {
          this.signature = clipboardText;
        }
      }
    }
    catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  }

}
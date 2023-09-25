import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { faPaste } from '@fortawesome/free-solid-svg-icons';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';

@Component({
  selector: 'app-wallet-reserve-proof-verify',
  templateUrl: './wallet-reserve-proof-verify.component.html',
  styleUrls: ['./wallet-reserve-proof-verify.component.sass']
})
export class WalletReserveProofVerifyComponent implements OnInit {

  @Output() onClose = new EventEmitter<{}>();
  constructor(private validatorsRegexService: ValidatorsRegexService,
    private rpcCallsService: RpcCallsService,
    private constantsService: ConstantsService
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


  ngOnInit() {
    this.dataCk = this.validatorsRegexService.message_settings;
    this.addressCk = this.validatorsRegexService.xcash_address;
    this.rpCk = this.validatorsRegexService.reserve_proof;
    this.messageLength = this.constantsService.message_settings_length;
  }

  cancelVerify() { this.onClose.emit({}); }


  // ReserveProofV11BZ23sBt9sZJeGccf84mzyAmNCP3KzYbE1111112VKmH111118Noxeg5z4cMoVnWtxjCd6jkr9r8iXE3fUqnfFPAQ6kPSpp1xHM113UVqmxYb55YTEqAU1wFCQ37YMphv9TaDVREZZFSUqVWz6XkGRTMg1S9F5HkBYyYvii5MZ3Kf5JoW66NAJcRZRuhPre5wQ7BzF113kRveumcxdeM9R517eGe3xgJ8GcxyfQJLSgoR53dMdPiB2FMc1KJMghSH9xgheV384A2LRD1WwxYCq3ddBYmawXcdos4Vfg8oWFfEQYxry93VHzBg1P7Pc7JjdHs1pmoHh78WnXGD4dTBeCbT4wtB2eb8bP2nc4514tJ7a9meuHeiKhuMvZE4C9V21Ak9SrEJYAc1J1pTp1na8feiKZvnimN9HBit53dF593p9miFXBamKV7ebtiLohKLnY6taJH4qgUMUY2ZQFvxJTvDH7wgfcPSSSSaPc3G22BKH54zhTT1QtvnsAFHMktmyh3ZVmhEQtw
  async selectVerify() {
    this.showSpinner = true;
    const passData = { message: this.rpMessage, public_address: this.rpAddress, reserveproof: this.rpSignature }
    const rpstatus = await this.rpcCallsService.verifyReserveproof(passData);
    if (rpstatus !== 'error') {
      if (rpstatus) {
        this.message = 'Signed Data Verifed Successfully'
        this.messageType = 'is-success';
      } else {
        this.message = 'Signed Data Verification Failed'
        this.messageType = 'is-danger';
      }
    } else {
      this.message = 'Failed to communicate with the RPC Wallet process.'
      this.messageType = 'is-information';
    }
    this.showSpinner = false;
  }

  showMessage(message: string): void {
    this.rpMessage = "";
    this.rpAddress = "";
    this.rpSignature = "";
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
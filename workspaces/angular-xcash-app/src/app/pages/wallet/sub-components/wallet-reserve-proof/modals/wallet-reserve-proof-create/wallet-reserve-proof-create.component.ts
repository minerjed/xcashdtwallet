import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { faPaste } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-wallet-reserve-proof-create',
  templateUrl: './wallet-reserve-proof-create.component.html',
  styleUrls: ['./wallet-reserve-proof-create.component.sass']
})
export class WalletReserveProofCreateComponent implements OnInit {
  faPaste = faPaste;
  amount: any = '';
  rpmessage: string = '';
  @Output() onClose = new EventEmitter<{ amount:  number, message: string}>();
  constructor(private validatorsRegexService: ValidatorsRegexService,
    private constantsService: ConstantsService) { }

  amountCk: string = '';
  proofCk: string = '';
  rpmessageCk: string = '';
  messageLength: number = 0;  

  ngOnInit() {
    this.amountCk = this.validatorsRegexService.xcash_reserve_proof_amount;
    this.proofCk = this.validatorsRegexService.reserve_proof;
    this.rpmessageCk = this.validatorsRegexService.message_settings;
    this.messageLength = this.constantsService.message_settings_length;
  }

  cancelAdd() { this.onClose.emit({ amount: 0, message: '' }); }
  selectAdd() { this.onClose.emit({ amount: this.amount, message: this.rpmessage }); }

  async onPaste(event: Event): Promise<void> {
    event.preventDefault(); // prevent default paste behavior
    try {
      const clipboardText = await navigator.clipboard.readText();
      this.rpmessage = clipboardText;
    }
    catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  }

  submit(e: any){
    e.preventDefault();
   }

}
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { faContactCard, faWallet, faPaste } from '@fortawesome/free-solid-svg-icons';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-wallet-integrated-address-add',
  templateUrl: './wallet-integrated-address-add.component.html',
  styleUrls: ['./wallet-integrated-address-add.component.sass']
})
export class WalletIntegratedAddressAddComponent implements OnInit {
  faPaste = faPaste;
  intlabel: string = '';
  intpaymentId: string = '';
  @Output() onClose = new EventEmitter<{ outlabel: string, outencryptedId: string }>();

  constructor(private validatorsRegexService: ValidatorsRegexService,
    private constantsService: ConstantsService) { }

  nameCk: string = '';
  minlen: number = 0;
  maxlen: number = 0;
  lenEncry : number = 0;
  addressCk: string = '';
  idCk: string = '';

  ngOnInit() {
    this.nameCk = this.validatorsRegexService.text_settings;
    this.minlen = this.constantsService.text_settings_minlength;
    this.maxlen = this.constantsService.text_settings_length;
    this.addressCk = this.validatorsRegexService.xcash_address;
    this.idCk = this.validatorsRegexService.encrypted_payment_id;
    this.lenEncry = this.constantsService.encrypted_payment_id_length;
  }

  cancelAdd() { this.onClose.emit({ outlabel: 'skip', outencryptedId: ''}); }
  selectAdd() { this.onClose.emit({ outlabel: this.intlabel, outencryptedId: this.intpaymentId}); }

  async onPaste(event: Event, infield: string): Promise<void> {
    event.preventDefault(); // prevent default paste behavior
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (infield === 'label') {
        this.intlabel = clipboardText;
      } else {
          this.intpaymentId = clipboardText;
        } 
    }
    catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  }

}

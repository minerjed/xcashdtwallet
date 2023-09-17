import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { faContactCard, faWallet, faPaste } from '@fortawesome/free-solid-svg-icons';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-wallet-subaddress-add',
  templateUrl: './wallet-subaddress-add.component.html',
  styleUrls: ['./wallet-subaddress-add.component.sass']
})
export class WalletSubaddressAddComponent implements OnInit {
  faContact = faContactCard;
  faWallet = faWallet;
  faPaste = faPaste;
  sublabel: string = '';
  @Output() onClose = new EventEmitter<{ outlabel: string }>();
  constructor(private validatorsRegexService: ValidatorsRegexService,
    private constantsService: ConstantsService) { }

  nameCk: string = '';
  minlen: number = 0;
  maxlen: number = 0;
  addressCk: string = '';

  ngOnInit() {
    this.nameCk = this.validatorsRegexService.text_settings;
    this.minlen = this.constantsService.text_settings_minlength;
    this.maxlen = this.constantsService.text_settings_length;
    this.addressCk = this.validatorsRegexService.xcash_address;
  }

  cancelAdd() { this.onClose.emit({ outlabel: 'skip'}); }
  selectAdd() { this.onClose.emit({ outlabel: this.sublabel}); }

}

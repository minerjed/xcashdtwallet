import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { faPaste } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-wallet-subaddress-add',
  templateUrl: './wallet-subaddress-add.component.html',
  styleUrls: ['./wallet-subaddress-add.component.sass']
})
export class WalletSubaddressAddComponent implements OnInit {

  @Output() onClose = new EventEmitter<{ outlabel: string }>();
  constructor(private validatorsRegexService: ValidatorsRegexService,
    private constantsService: ConstantsService) { }

  sublabel: string = '';
  faPaste = faPaste;
  nameCk: string = '';
  minlen: number = 0;
  maxlen: number = 0;

  ngOnInit() {
    this.nameCk = this.validatorsRegexService.text_settings;
    this.minlen = this.constantsService.text_settings_minlength;
    this.maxlen = this.constantsService.text_settings_length;
  }

  async onPaste(event: Event): Promise<void> {
    event.preventDefault(); // prevent default paste behavior
    try {
      const clipboardText = await navigator.clipboard.readText();
      this.sublabel = clipboardText;
    }
    catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  }

  cancelAdd() { this.onClose.emit({ outlabel: 'skip'}); }
  selectAdd() { this.onClose.emit({ outlabel: this.sublabel}); }

}
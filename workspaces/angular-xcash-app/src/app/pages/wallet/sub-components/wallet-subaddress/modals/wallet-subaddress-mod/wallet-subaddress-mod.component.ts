import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { faPaste } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-wallet-subaddress-mod',
  templateUrl: './wallet-subaddress-mod.component.html',
  styleUrls: ['./wallet-subaddress-mod.component.sass']
})
export class WalletSubaddressModComponent implements OnInit {
  newLabel: string = '';
  faPaste = faPaste;
  @Input() modId: number = 0;
  @Input() modLabel: string = '';
  @Output() onClose = new EventEmitter<{ outId: number, newLabel: string }>();

  constructor(private validatorsRegexService: ValidatorsRegexService,
    private constantsService: ConstantsService) { }

  labelCk: string = '';
  minlen: number = 0;
  maxlen: number = 0;

  ngOnInit() {
    this.labelCk = this.validatorsRegexService.text_settings;
    this.minlen = this.constantsService.text_settings_minlength;
    this.maxlen = this.constantsService.text_settings_length;
    this.newLabel = this.modLabel;
  }

  async onPaste(event: Event): Promise<void> {
    event.preventDefault(); // prevent default paste behavior
    try {
      const clipboardText = await navigator.clipboard.readText();
      this.newLabel = clipboardText;
    }
    catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  }

  cancelMod() { this.onClose.emit({ outId: 0, newLabel: '' }); }
  selectMod(event: Event) {
    event.preventDefault();
    this.onClose.emit({ outId: this.modId, newLabel: this.newLabel });
  }

}
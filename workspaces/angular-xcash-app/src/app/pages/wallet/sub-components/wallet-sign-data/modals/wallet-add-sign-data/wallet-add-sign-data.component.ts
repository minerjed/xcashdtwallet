import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { faPaste } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-wallet-add-sign-data',
  templateUrl: './wallet-add-sign-data.component.html',
  styleUrls: ['./wallet-add-sign-data.component.sass']
})
export class WalletAddSignDataComponent implements OnInit {
  faPaste = faPaste;
  signData: string = '';
  @Output() onClose = new EventEmitter<{ outdata: string }>();
  constructor(private validatorsRegexService: ValidatorsRegexService,
    private constantsService: ConstantsService) { }

  dataCk: string = '';
  messageLength: number = 0;

  ngOnInit() {
    this.dataCk = this.validatorsRegexService.message_settings;
    this.messageLength = this.constantsService.message_settings_length;
  }

  cancelAdd() { this.onClose.emit({ outdata: 'skip' }); }
  selectAdd() { this.onClose.emit({ outdata: this.signData }); }

  async onPaste(event: Event): Promise<void> {
    event.preventDefault(); // prevent default paste behavior
    try {
      const clipboardText = await navigator.clipboard.readText();
      this.signData = clipboardText;
    }
    catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  }

}
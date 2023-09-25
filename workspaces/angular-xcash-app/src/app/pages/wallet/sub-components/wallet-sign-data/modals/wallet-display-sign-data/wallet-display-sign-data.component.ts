import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-wallet-display-sign-data',
  templateUrl: './wallet-display-sign-data.component.html',
  styleUrls: ['./wallet-display-sign-data.component.sass']
})
export class WalletDisplaySignDataComponent implements OnInit {
  constructor() { };
  faCopy = faCopy;
  showSpinner: boolean = true;
  signedData: string = '';
  signature: any = '';
  pubKey: string = '';
  message: string = '';
  @Input() insignedData: string = '';
  @Input() inSignature: string = '';
  @Input() inpubKey: string = '';
  @Output() onClose = new EventEmitter<{}>();
  tippyOptions = {
    trigger: 'click',
    hideOnClick: false,
    onShow: (instance: any) => {
      setTimeout(() => {
        instance.hide();
      }, 700);
    }
  };

  ngOnInit(): void {
    this.signedData = this.insignedData;
    this.signature = this.inSignature;
    this.pubKey = this.inpubKey;
  }

  copyToClipboard(value: string) {
		navigator.clipboard.writeText(value)
			.then(() => { })
			.catch(err => {
        this.showMessage('Failed to copy text: ' + err);
			});
	}

  showMessage(message: string): void {
    this.message = message;
  }

closeModal() { this.onClose.emit({}); }

}

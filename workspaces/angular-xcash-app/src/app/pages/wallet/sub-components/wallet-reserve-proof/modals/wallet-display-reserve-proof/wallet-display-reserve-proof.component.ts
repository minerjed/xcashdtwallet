import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-wallet-display-reserve-proof',
  templateUrl: './wallet-display-reserve-proof.component.html',
  styleUrls: ['./wallet-display-reserve-proof.component.sass']
})
export class WalletDisplayReserveProofComponent implements OnInit {
  constructor() { };
  faCopy = faCopy;
  showSpinner: boolean = true;
  message: any = '';
  @Input() inreserveMessage: string = '';
  @Input() inSignature: string = '';
  @Input() inPubKey: string = '';
  @Input() inStatus: string = '';
  @Input() inAmount: any = '';

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
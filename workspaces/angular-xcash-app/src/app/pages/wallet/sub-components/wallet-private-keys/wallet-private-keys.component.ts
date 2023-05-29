import { Component, Output, EventEmitter, ElementRef } from '@angular/core';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { ActivatedRoute } from '@angular/router';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-wallet-private-keys',
  templateUrl: './wallet-private-keys.component.html',
  styleUrls: ['./wallet-private-keys.component.sass']
})
export class WalletPrivateKeysComponent {
  faCopy = faCopy;
  privatekeys: any = { "seed": "", "viewkey": "", "spendkey": "" };
  walletSpendkey: string = '';
  walletViewkey: string = '';
  walletMnemonicseed: string = '';
  publicAddress: string = '';
  walletname: string = '';
  modalmessage: string = '';
  showLoginModal: boolean = true;
  showSpinner: boolean = false;
  @Output() onClose = new EventEmitter();

  constructor(
    private rpcCallsService: RpcCallsService,
    private route: ActivatedRoute,
    private elementRef: ElementRef
  ) { };


  ngOnInit(): void {
    this.walletname = this.route.snapshot.paramMap.get('wname') ?? '';
    this.publicAddress = this.route.snapshot.paramMap.get('waddress') ?? '';
  }

  closeLogin(status: string): void {
    this.showLoginModal = false;
    if (status === 'success') {
      this.viewprivatekeys();
    } else {
      this.onClose.emit();
    }
  }

  async viewprivatekeys() {
    this.showSpinner = true;
    this.privatekeys = await this.rpcCallsService.getPrivateKeys();
    this.showSpinner = false;
    this.walletSpendkey = this.privatekeys.spendkey;
    this.walletViewkey = this.privatekeys.viewkey;
    this.walletMnemonicseed = this.privatekeys.seed;
  }

  copyToClipboard(value: string) {
		navigator.clipboard.writeText(value)
			.then(() => { })
			.catch(err => {
				console.error('Failed to copy text: ', err);
			});
	}

  printCreate(): void {
    this.elementRef.nativeElement.classList.add('print-mode'); // Add a CSS class to the component's native element for print styling
    window.print(); // Trigger the print functionality
    this.elementRef.nativeElement.classList.remove('print-mode'); // Remove the CSS class after printing
  }

}
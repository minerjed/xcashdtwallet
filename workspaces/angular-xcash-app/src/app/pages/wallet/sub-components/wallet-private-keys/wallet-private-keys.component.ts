import { Component, Output, EventEmitter, ElementRef } from '@angular/core';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { ActivatedRoute } from '@angular/router';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { rpcReturn } from 'src/app/models/rpc-return';
import { DatabaseService } from 'src/app/services/database.service';

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
  message: string = '';
  blockheight: any = '';
  @Output() onClose = new EventEmitter();
  tippyOptions = {
    trigger: 'click',
    hideOnClick: false,
    onShow: (instance: any) => {
      setTimeout(() => {
        instance.hide();
      }, 700);
    }
  };

  constructor(
    private rpcCallsService: RpcCallsService,
    private route: ActivatedRoute,
    private databaseService: DatabaseService,
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
    this.blockheight = await this.databaseService.getWalletCreateBlock(this.publicAddress);
    const response: rpcReturn = await this.rpcCallsService.getPrivateKeys();
    if (response.status) {
      this.privatekeys = response.data;
      this.showSpinner = false;
      this.walletSpendkey = this.privatekeys.spendkey;
      this.walletViewkey = this.privatekeys.viewkey;
      this.walletMnemonicseed = this.privatekeys.seed;
    } else {
      this.showMessage(response.message);
    }
  }

  copyToClipboard(value: string) {
    navigator.clipboard.writeText(value)
      .then(() => { })
      .catch(err => {
        this.showMessage('Failed to copy text: ' + err);
      });
  }

  printCreate(): void {
    this.elementRef.nativeElement.classList.add('print-mode'); // Add a CSS class to the component's native element for print styling
    window.print(); // Trigger the print functionality
    this.elementRef.nativeElement.classList.remove('print-mode'); // Remove the CSS class after printing
  }

  showMessage(message: string): void {
    this.message = message;
  }

}
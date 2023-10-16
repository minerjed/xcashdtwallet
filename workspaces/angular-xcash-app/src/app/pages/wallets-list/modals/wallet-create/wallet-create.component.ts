import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { WalletsListService } from 'src/app/services/wallets-list.service';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { DatabaseService } from 'src/app/services/database.service';
import { faKey, faEye, faWallet, faCopy } from '@fortawesome/free-solid-svg-icons';
import { rpcReturn } from 'src/app/models/rpc-return';

@Component({
  selector: 'app-wallet-create',
  templateUrl: './wallet-create.component.html',
  styleUrls: ['./wallet-create.component.sass']
})
export class WalletCreateComponent {
  @Output() onClose = new EventEmitter();
  faKey = faKey;
  faEye = faEye;
  faWallet = faWallet;
  faCopy = faCopy;
  showpassword: boolean = false;
  fielddisabled: boolean = false;
  showspinner: boolean = false;
  buttonDisabled: boolean = false;
  showMain: boolean = true;
  showCreate: boolean = false;
  showExit: boolean = false;
  walletname: string = '';
  walletpassword: string = '';
  confirmpassword: string = '';
  showconfirmpassword: boolean = false;
  passwordLength: number = 0;
  passwordFormat: string = '';
  textSettings: string = '';
  textSettingsMax: number = 0;
  textSettingsMin: number = 0;
  message: string = '';
  walletSpendkey: string = '';
  walletViewkey: string = '';
  walletMnemonicseed: string = '';
  publicAddress: any = '';
  tippyOptions = {
    trigger: 'click',
    hideOnClick: false,
    onShow: (instance: any) => {
      setTimeout(() => {
        instance.hide();
      }, 700);
    }
  };
  privatekeys: any = { "seed": "", "viewkey": "", "spendkey": "" };
  @ViewChild('walletnameinput', { static: false }) walletnameinput: any;
  @ViewChild('passwordinput', { static: false }) passwordinput: any;
  @ViewChild('confirmpasswordinput', { static: false }) confirmpasswordinput: any;

  constructor(private rpcCallsService: RpcCallsService,
    private walletsListService: WalletsListService,
    private validatorsRegexService: ValidatorsRegexService,
    private constantsService: ConstantsService,
    private databaseService: DatabaseService,
    private elementRef: ElementRef
  ) { };

  ngOnInit(): void {
    this.passwordLength = this.constantsService.password_length;
    this.passwordFormat = this.validatorsRegexService.password_format;
    this.textSettings = this.validatorsRegexService.text_settings;
    this.textSettingsMax = this.constantsService.text_settings_length;
    this.textSettingsMin = this.constantsService.text_settings_minlength;
  }

  async confirmCreate(isInvalid: any) {
    if (isInvalid) {
      this.walletnameinput.control.markAsTouched();
      this.passwordinput.control.markAsTouched();
      this.confirmpasswordinput.control.markAsTouched();
    } else {
      this.showspinner = true;
      this.buttonDisabled = true;
      const checkfile = await this.databaseService.checkIfWalletExist(this.walletname);
      if (checkfile) {
        this.showMessage('The wallet name is already exists. Try again.');
      } else {
        this.showCreate = true;
        this.showMain = false;
        const response: rpcReturn = await this.rpcCallsService.createWallet(this.walletname, this.walletpassword);
        if (response.status) {
          const response: rpcReturn = await this.rpcCallsService.getPublicAddress();
          if (response.status) {
            try {
              this.publicAddress = response.data;
              await this.databaseService.saveWalletData(this.walletname, this.publicAddress, 0);
              this.walletsListService.addWallet(this.walletname, this.publicAddress, 0);
              this.showCreate = false;
              this.continueCreate();
            } catch (error) {
              this.showMain = true;
              this.showCreate = false;
              this.showMessage('An error occurred while saving wallet data ' + error);
            }
          } else {
            this.showMain = true;
            this.showCreate = false;
            this.showMessage(response.message);
          }
        } else {
          this.showMain = true;
          this.showCreate = false;
          this.showMessage(response.message);
        }
      }
      this.showspinner = false;
    }
  }

  async continueCreate() {
    const response: rpcReturn = await this.rpcCallsService.getPrivateKeys();
    if (response.status) {
      this.privatekeys = response.data;
      this.walletSpendkey = this.privatekeys.spendkey;
      this.walletViewkey = this.privatekeys.viewkey;
      this.walletMnemonicseed = this.privatekeys.seed;
      this.showExit = true;
    } else {
      this.showMain = true;
      this.showCreate = false;
      this.showMessage(response.message);
    }
    this.showspinner = false;
  }

  cancelCreate(): void {
    this.onClose.emit();
  }

  togglePasswordVis() {
    if (this.showpassword === true) {
      this.showpassword = false;
    } else {
      this.showpassword = true;
    }
  }

  toggleconfirmPasswordVis() {
    if (this.showconfirmpassword === true) {
      this.showconfirmpassword = false;
    } else {
      this.showconfirmpassword = true;
    }
  }

  copyToClipboard(value: string) {
    navigator.clipboard.writeText(value)
      .then(() => { })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }

  showMessage(message: string): void {
    if (message === '') {
      this.walletname = '';
      this.walletpassword = '';
      this.confirmpassword = '';
    }
    this.message = message;
  }

  printCreate(): void {
    this.elementRef.nativeElement.classList.add('print-mode'); // Add a CSS class to the component's native element for print styling
    window.print(); // Trigger the print functionality
    this.elementRef.nativeElement.classList.remove('print-mode'); // Remove the CSS class after printing
  }

}
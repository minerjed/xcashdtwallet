import { Component, ChangeDetectorRef, Output, EventEmitter, ViewChild } from '@angular/core';
import { faPaste } from '@fortawesome/free-solid-svg-icons';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { DatabaseService } from 'src/app/services/database.service';
import { WalletsListService } from 'src/app/services/wallets-list.service';
import { faKey, faEye, faWallet } from '@fortawesome/free-solid-svg-icons';
import { rpcReturn } from 'src/app/models/rpc-return';
import { XcashGetblockhightService } from 'src/app/services/xcash-getblockhight.service';

@Component({
  selector: 'app-wallet-import',
  templateUrl: './wallet-import.component.html',
  styleUrls: ['./wallet-import.component.sass']
})
export class WalletImportComponent {
  @Output() onClose = new EventEmitter();
  faKey = faKey;
  faEye = faEye;
  faWallet = faWallet;
  faPaste = faPaste;
  messageType: string = '';
  showspinner: boolean = false;
  walletMnemonicseed: string = '';
  usingSeed: boolean = true;
  usingKey: boolean = false;
  getwalletName: boolean = false;
  buttonDisabled: boolean = false;
  showCreate: boolean = false;
  mnemonicwordsCk: string = '';
  walletViewkey: string = '';
  walletSpendkey: string = '';
  walletPublicKey: string = '';
  wordlength: number = 0;
  keylength: number = 0;
  xcashlength: number = 0;
  xcashprefix: string = '';
  walletname: string = '';
  walletpassword: string = '';
  confirmpassword: string = '';
  passwordLength: number = 0;
  passwordFormat: string = '';
  textSettings: string = '';
  textSettingsMax: number = 0;
  textSettingsMin: number = 0;
  publicAddress: any = '';
  blockHeight: any = 0;
  currentBK: number = 0;
  message: string = '';
  textMessage: string = '';
  Walletdata: any = { "walletName": "walletName", "password": "password", "seed": "", "viewkey": "", "privatekey": "", "publicaddress": "" };
  @ViewChild('mnemonicInput', { static: false }) mnemonicInput: any;
  @ViewChild('walletspendkeyInput', { static: false }) walletspendkeyInput: any;
  @ViewChild('walletviewkeyInput', { static: false }) walletviewkeyInput: any;
  @ViewChild('walletpublickeyInput', { static: false }) walletpublickeyInput: any;
  @ViewChild('walletnameinput', { static: false }) walletnameinput: any;
  @ViewChild('passwordinput', { static: false }) passwordinput: any;
  @ViewChild('confirmpasswordinput', { static: false }) confirmpasswordinput: any;
  @ViewChild('blockHeightInput', { static: false }) blockHeightInput: any;
  [key: string]: any;

  constructor(
    private rpcCallsService: RpcCallsService,
    private validatorsRegexService: ValidatorsRegexService,
    private constantsService: ConstantsService,
    private xcashgetblockhightService: XcashGetblockhightService,
    private changeDetectorRef: ChangeDetectorRef,
    private databaseService: DatabaseService,
    private walletsListService: WalletsListService
  ) { };

  ngOnInit(): void {
    this.getBlockHeight();
    this.wordlength = this.constantsService.mnemonic_seed_word_length;
    this.keylength = this.constantsService.private_key_length;
    this.xcashlength = this.constantsService.xcash_public_address_length_settings;
    this.xcashprefix = this.constantsService.xcash_public_address_prefix
    this.keyCk = this.validatorsRegexService.private_key;
    this.xcashkeyCk = this.validatorsRegexService.xcash_only_address;
    this.mnemonicwordsCk = this.validatorsRegexService.mnemonic_seed;
    this.passwordLength = this.constantsService.password_length;
    this.passwordFormat = this.validatorsRegexService.password_format;
    this.textSettings = this.validatorsRegexService.text_settings;
    this.textSettingsMax = this.constantsService.text_settings_length;
    this.textSettingsMin = this.constantsService.text_settings_minlength;
  }

  async getBlockHeight() {
    try {
      const data = await this.xcashgetblockhightService.getDelegates();
      if ('height' in data) {
        this.currentBK = data.height;
      }
    } catch (error) { }
  }

  confirmseedImport(formInvalid: any): void {
    if (formInvalid || this.blockHeight > this.currentBK) {
      this.mnemonicInput.control.markAsTouched();
      this.blockHeightInput.control.markAsTouched();
    } else {
      this.getwalletName = true;
      this.usingSeed = false;
      this.usingKey = false;
      this.Walletdata.seed = this.walletMnemonicseed.replace(/(\r\n|\n|\r)/gm, "");
    }
  }

  confirmkeyImport(formInvalid: any): void {
    if (formInvalid || this.blockHeight > this.currentBK) {
      this.walletspendkeyInput.control.markAsTouched();
      this.walletviewkeyInput.control.markAsTouched();
      this.walletpublickeyInput.control.markAsTouched();
      this.blockHeightInput.control.markAsTouched();
    } else {
      if (this.walletsListService.findbyPublicKey(this.walletPublicKey)) {
        this.buttonDisabled = true;
        this.message = 'The Wallet Public Key entered already exists. Try again.';
      } else {
        this.getwalletName = true;
        this.usingSeed = false;
        this.usingKey = false;
        this.Walletdata.privatekey = this.walletSpendkey.replace(/(\r\n|\n|\r)/gm, "");
        this.Walletdata.viewkey = this.walletViewkey.replace(/(\r\n|\n|\r)/gm, "");
        this.Walletdata.publicaddress = this.walletPublicKey.replace(/(\r\n|\n|\r)/gm, "");
      }
    }
  }

  async confirmkeyWalletInfo(formInvalid: any) {
    if (formInvalid || this.walletpassword !== this.confirmpassword) {
      this.walletnameinput.control.markAsTouched();
      this.passwordinput.control.markAsTouched();
      this.confirmpasswordinput.control.markAsTouched();
    } else {
      if (this.walletsListService.findWallet(this.walletname)) {
        this.buttonDisabled = true;
        this.message = 'The Wallet Name entered already exists. Try again.';
      } else {
        this.textMessage = 'Importing and synchronizing wallet data (estimated time: approximately one hour). Your patience is appreciated...';
        this.getwalletName = false;
        this.showCreate = true;
        this.showspinner = true;
        this.buttonDisabled = true;
        this.Walletdata.walletName = this.walletname;
        this.Walletdata.password = this.walletpassword;
        const response: rpcReturn = await this.rpcCallsService.importWallet(this.Walletdata, this.blockHeight);
        if (response.status) {
          try {
            await this.databaseService.saveWalletData(this.walletname, response.data.publicaddress, response.data.balance,
              this.blockHeight);
            this.walletsListService.addWallet(this.walletname, response.data.publicaddress, response.data.balance);
            this.messageType = 'is-success';
            this.textMessage = 'Success. Wallet import complete. Click Exit to continue.';
          } catch (err) {
            this.messageType = 'is-danger';
            this.textMessage = 'Failed to update database file.';
          }
        } else {
          this.messageType = 'is-danger';
          this.textMessage = response.message;
        }
        this.buttonDisabled = false;
      }
      this.showspinner = false;
    }
  }

  cancelImport(): void {
    this.onClose.emit();
  }

  importSeed(): void {
    this.usingSeed = true;
    this.usingKey = false;
  }

  importKey(): void {
    this.usingSeed = false;
    this.usingKey = true;
  }
  async onPaste(event: Event, targetField: string): Promise<void> {
    event.preventDefault(); // prevent default paste behavior
    try {
      const clipboardText = await navigator.clipboard.readText();
      this[targetField] = clipboardText;
      this.changeDetectorRef.detectChanges();
    } catch (err) {
      console.error('Failed to read clipboard contents:');
    }
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

  showMessage(message: string): void {
    if (message === '') {
      this.buttonDisabled = false;
    }
    this.message = message;
  }

}

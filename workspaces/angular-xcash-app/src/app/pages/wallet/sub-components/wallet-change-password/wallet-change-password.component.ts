import { Component, ViewChild } from '@angular/core';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { faEye, faKey } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-wallet-change-password',
  templateUrl: './wallet-change-password.component.html',
  styleUrls: ['./wallet-change-password.component.sass']
})
export class WalletChangePasswordComponent {
  faKey = faKey;
  faEye = faEye;
  oldpassword: string = '';
  newpassword: string = '';
  modalmessage: string = '';
  showSpinner: boolean = false;
  passwordCk: string = '';
  pwlengthCk: number = 0;
  showpassword: boolean = false;
  fielddisabled: boolean = false;
  newshowpassword: boolean = false;
  newfielddisabled: boolean = false;
  infoMessage: string = '';
  message: string = '';
  @ViewChild('walletpassinput', { static: false }) walletpassinput: any;

  constructor(
    private rpcCallsService: RpcCallsService,
    private validatorsRegexService: ValidatorsRegexService,
    private constantsService: ConstantsService
  ) { };

  ngOnInit(): void {
    this.passwordCk = this.validatorsRegexService.password_format;
    this.pwlengthCk = this.constantsService.password_length;
  }

  async submitChange(forminvalid: any) {
    if (!forminvalid) {
      this.newfielddisabled = true;
      this.fielddisabled = true;
      this.showSpinner = true;
      const message: string = await this.rpcCallsService.changePassword(this.oldpassword, this.newpassword);
      this.showSpinner = false;
      if (message === 'success') {
        this.showInfoMessage();
      } else {
        this.message = message;
        console.log(this.message);
      }
    }
  }

  showMessage(message: string) {
    this.message = message;
    this.oldpassword = '';
    this.newpassword = '';
    this.newfielddisabled = false;
    this.fielddisabled = false;
  }

  togglePasswordVis() {
    if (this.showpassword === true) {
      this.showpassword = false;
    } else {
      this.showpassword = true;
    }
  }

  newtogglePasswordVis() {
    if (this.newshowpassword === true) {
      this.newshowpassword = false;
    } else {
      this.newshowpassword = true;
    }
  }

	async showInfoMessage() {
		this.infoMessage = 'Passwords changed Successfully';
		await new Promise(resolve => setTimeout(resolve, 4000)); // Set the timer to expire after 4 seconds
		this.infoMessage = '';
    this.oldpassword = '';
    this.newpassword = '';
    this.newfielddisabled = false;
    this.fielddisabled = false;
	}

}
import { Component, OnInit, Output, Input, EventEmitter, ViewChild } from '@angular/core';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { faKey, faEye } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { ConstantsService } from 'src/app/services/constants.service';


@Component({
  selector: 'app-wallet-login',
  templateUrl: './wallet-login.component.html',
  styleUrls: ['./wallet-login.component.sass']
})
export class WalletLoginComponent implements OnInit {
  faKey = faKey;
  faEye = faEye;
  walletpass: string = '';
  showpassword: boolean = false;
  fielddisabled: boolean = false;
  passwordCk: string = '';
  pwlengthCk: number = 0;
  walletname: string = '';
  @ViewChild('walletpassinput', { static: false }) walletpassinput: any;

  @Input() modalmessage: string = '';
  @Input() callfrom: string = '';

  @Output() onClose: EventEmitter<string> = new EventEmitter<string>();

  constructor(private validatorsRegexService: ValidatorsRegexService,
		private rpcCallsService: RpcCallsService,
    private constantsService: ConstantsService,
    private activedroute: ActivatedRoute,
    ) { }

  ngOnInit(): void {
    this.walletname = this.activedroute.snapshot.paramMap.get('wname') ?? '';
    this.passwordCk = this.validatorsRegexService.password_format;
    this.pwlengthCk = this.constantsService.password_length;
  }

  selectLogin(isInvalid: any) {
    if (!isInvalid) {
      this.fielddisabled = true;
      this.openwallet();
    } else {
      this.walletpassinput.control.markAsTouched();
    }
  }

	async openwallet(): Promise<void> {
		this.modalmessage = await this.rpcCallsService.openWallet(this.walletname, this.walletpass);
		if (this.modalmessage) {
			this.walletpass = '';
    } else {
      this.onClose.emit('success');
    }
	}

  cancelLogin() {
    this.walletpass = '';
    this.onClose.emit('cancel');
  }

  resetLogin() {
    this.walletpass = '';
    this.modalmessage = '';
    this.fielddisabled = false;
  }

  togglePasswordVis() {
    if (this.showpassword === true) {
      this.showpassword = false;
    } else {
      this.showpassword = true;
    }
  }

}
import { Component, OnInit, Output, Input, EventEmitter, ViewChild } from '@angular/core';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { faKey, faEye } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

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
  @ViewChild('walletpassinput', { static: false }) walletpassinput: any;

  @Input() walletname: string = '';
  @Input() modalmessage: string = '';

  @Output() onClose = new EventEmitter();

  constructor(private validatorsRegexService: ValidatorsRegexService,
    private router: Router) { }

  ngOnInit(): void {
    this.passwordCk = this.validatorsRegexService.password_format;
    this.pwlengthCk = this.validatorsRegexService.password_length;
  }

  selectLogin(isInvalid: any) {
    if (!isInvalid) {
      this.fielddisabled = true;
      this.onClose.emit(this.walletpass);
    } else {
      this.walletpassinput.control.markAsTouched();
    }
  }

  cancelLogin() {
    this.walletpass = '';
    this.router.navigate(['']);
}

  togglePasswordVis() {
    if (this.showpassword === true) {
      this.showpassword = false;
    } else {
      this.showpassword = true;
    }
  }

}
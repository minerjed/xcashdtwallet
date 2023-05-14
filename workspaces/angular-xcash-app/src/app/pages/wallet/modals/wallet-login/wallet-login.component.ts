import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { faKey, faEye } from '@fortawesome/free-solid-svg-icons';

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

  @Input() walletname: string = '';
  @Input() modalmessage: string = '';

  @Output() onClose = new EventEmitter();

  constructor() { }

  ngOnInit(): void { }

  selectLogin() { 
    this.fielddisabled = true;
    this.onClose.emit(this.walletpass); }

  togglePasswordVis() {
    if (this.showpassword === true) {
      this.showpassword = false;
    } else {
      this.showpassword = true;
    }
  }

}
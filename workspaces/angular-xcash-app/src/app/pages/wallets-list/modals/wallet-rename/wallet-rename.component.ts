import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { faWallet } from '@fortawesome/free-solid-svg-icons';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-wallet-rename',
  templateUrl: './wallet-rename.component.html',
  styleUrls: ['./wallet-rename.component.sass']
})
export class WalletRenameComponent implements OnInit {
  faWallet = faWallet;
  newwalletname : string = '';

  @Input() idForRename : number  = 0;
  @Input() nameForRename : string = '';
  @Output() onClose = new EventEmitter<{id : number, newname : string}>();

  constructor(private validatorsRegexService: ValidatorsRegexService,
    private constantsService: ConstantsService) { }

  nameCk: string = '';
  minlen: number = 0;
  maxlen: number = 0;

  ngOnInit() {
    this.nameCk = this.validatorsRegexService.text_settings;
    this.minlen = this.constantsService.text_settings_minlength;
    this.maxlen = this.constantsService.text_settings_length;
   }

  cancelRename() { this.onClose.emit({id:0, newname:''}); }
  selectRename() { this.onClose.emit({id: this.idForRename, newname: this.newwalletname}); }

}
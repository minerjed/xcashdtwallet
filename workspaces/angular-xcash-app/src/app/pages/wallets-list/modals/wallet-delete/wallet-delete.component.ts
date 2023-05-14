import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-wallet-delete',
  templateUrl: './wallet-delete.component.html',
  styleUrls: ['./wallet-delete.component.sass']
})
export class WalletDeleteComponent implements OnInit {

  @Input()
  idForDel : number  = 0;

  @Input()
  nameForDel : string = '';

  @Output()
  onClose = new EventEmitter();

  constructor() { }

  ngOnInit() {
   }

  cancelDel() { this.onClose.emit(null); }
  selectDel() { this.onClose.emit(this.idForDel); }
}
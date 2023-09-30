import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { rpcReturn } from 'src/app/models/rpc-return';

@Component({
  selector: 'app-wallet-revote',
  templateUrl: './wallet-revote.component.html',
  styleUrls: ['./wallet-revote.component.sass']
})
export class WalletRevoteComponent {

  @Input() delegateVote: string = '';
  @Output() onClose = new EventEmitter();
  showspinner: boolean = false;
  modalText: string = '';
  buttonDisabled: boolean = false;
  showExit = false;

  constructor(private rpcCallsService: RpcCallsService) { };

  ngOnInit() {
    this.modalText = `You are revoting for ${this.delegateVote}. Please confirm your selection.`;
  }

  async confirmreVote() {
    this.showspinner = true;
    this.buttonDisabled = true;
    this.modalText = 'Waiting until three minutes after the top of the hour.  Please leave the Delegate Selection window open and wait for a confirmation message.'
    const response: rpcReturn = await this.rpcCallsService.revote();
    if (response.status) {
      this.modalText = `You have successfully revoted for delegate ${this.delegateVote}.  You may close this Delegate Selection window.`
    } else {
      this.modalText = response.message;
    }
    this.buttonDisabled = false;
    this.showExit = true;
    this.showspinner = false;
  }

  cancelreVote(): void {
    this.onClose.emit();
  }

}

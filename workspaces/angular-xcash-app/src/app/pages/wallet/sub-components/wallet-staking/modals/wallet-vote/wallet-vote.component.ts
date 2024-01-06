import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { rpcReturn } from 'src/app/models/rpc-return';

@Component({
  selector: 'app-wallet-vote',
  templateUrl: './wallet-vote.component.html',
  styleUrls: ['./wallet-vote.component.sass']
})
export class WalletVoteComponent {
  @Input() delegateVote: string = '';
  @Input() xcashbalance: number = 0;

  @Output() onClose = new EventEmitter();
  showspinner: boolean = false;
  modalText: string = '';
  buttonDisabled: boolean = false;
  voteDisabled: boolean = false;
  showExit = false;
  delegateSuccess: string = '';

  constructor(private rpcCallsService: RpcCallsService) { };

  ngOnInit() {
    this.modalText = `You are voting for ${this.delegateVote}. Please confirm your selection.`;
    if (this.xcashbalance < 2000000) {
      this.voteDisabled = true;
      this.modalText = 'To vote, you need to have at least 2,000,000 (2 Millions) XCASH unlocked in your wallet.';
    }
  }

  async confirmVote() {
    this.showspinner = true;
    this.buttonDisabled = true;
    this.modalText = 'Waiting until three minutes after the top of the hour.  Please leave the Delegate Selection window open and wait for a confirmation message.'
    const response: rpcReturn = await this.rpcCallsService.delegateVote(this.delegateVote);
    if (response.status) {
      this.modalText = `You have successfully voted for delegate ${this.delegateVote}.  You may close this Delegate Selection window.`
      this.delegateSuccess = this.delegateVote;
    } else {
      this.modalText = response.message + " Please try again after completing the Sweep operation." ;
    }
    this.buttonDisabled = false;
    this.showExit = true;
    this.showspinner = false;
  }

  cancelVote(): void {
    this.onClose.emit(this.delegateSuccess);
  }
}
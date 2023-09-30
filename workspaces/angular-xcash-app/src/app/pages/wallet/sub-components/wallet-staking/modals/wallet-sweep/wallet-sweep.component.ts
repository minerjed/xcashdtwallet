import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { rpcReturn } from 'src/app/models/rpc-return';

@Component({
  selector: 'app-wallet-sweep',
  templateUrl: './wallet-sweep.component.html',
  styleUrls: ['./wallet-sweep.component.sass']
})
export class WalletSweepComponent {
  @Input() walletname: string = '';
  @Input() walletaddress: string = '';
  @Output() onClose = new EventEmitter();
  showspinner: boolean = false;
  modalText: string = '';
  buttonDisabled: boolean = false;
  showExit = false;

  constructor(private rpcCallsService: RpcCallsService) { };

  ngOnInit() {
    this.modalText = `You are performing maintenance on ${this.walletname}. Please confirm your selection.`;
  }
  async confirmSweep() {
    this.showspinner = true;
    this.buttonDisabled = true;
    let xcashbalance = 0;
    const response: rpcReturn = await this.rpcCallsService.getBalance();
    xcashbalance = response.data;
    if (response.status) {
      this.modalText = 'Please wait, preparing the wallet…. This might take up to 15 minutes.';
      const response: rpcReturn = await this.rpcCallsService.sweep_all_vote(this.walletaddress);
      let newxcashbalance: number = 0;
      let ckxcashbalance = xcashbalance - 1000;
      if (response.status) {
        while (newxcashbalance < ckxcashbalance) {
          await new Promise(resolve => setTimeout(resolve, 60000));  // 1 min
          const response: rpcReturn = await this.rpcCallsService.getBalance();
          if (response.status) {
            newxcashbalance = response.data
          } else {
            this.modalText = response.message;
            break;
          };
        }
        if (newxcashbalance >= ckxcashbalance) {
          this.modalText = 'Transaction Sweep complete successfully.  You may close this window.';
        }
      } else {
        this.modalText = response.message;
      }
    } else {
      this.modalText = response.message;
    }
    this.showspinner = false;
    this.buttonDisabled = false;
    this.showExit = true;
  }

  cancelSweep(): void {
    this.onClose.emit();
  }

}
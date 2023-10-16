import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { Transfer } from 'src/app/models/transfer';
import { ConstantsService } from 'src/app/services/constants.service';
import { rpcReturn } from 'src/app/models/rpc-return';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.sass']
})
export class TransactionDetailsComponent implements OnInit {
  showSpinner: boolean = true;
  transfer: Transfer[] = [];
  hidetrans: boolean = true;
  faddress: string = '';
  famount: any = '';
  fconfirmations: any = '';
  fdouble_spend_seen: any = '';
  ffee: any = '';
  fheight: any = '';
  fnote: any = '';
  fpayment_id: any = '';
  fsubaddres_index_major: any = '';
  fsubaddress_index_minor: any = '';
  fsuggested_confirmations_threshold: any = '';
  ftimestamp: any = '';;
  ftxid: any = '';
  ftype: any = '';
  funlock_time: any = '';
  message: string = '';

  constructor(
    private rpcCallsService: RpcCallsService,
    private constantsService: ConstantsService
  ) { };

  @Input() txid: string = '';

  @Output() closeModalEvent = new EventEmitter<void>();

  ngOnInit(): void {
    this.gettransactiondetails(this.txid);
  }

  async gettransactiondetails(txid: string): Promise<void> {
    const response: rpcReturn = await this.rpcCallsService.getTransactionDetails(txid);
    if (response.status) {
      const transferObj = response.data;
      if (typeof transferObj !== 'boolean') {
        const transArray = transferObj;
        this.transfer = transArray.transfers;
        this.faddress = this.transfer[0].address;
        this.famount = this.transfer[0].amount / this.constantsService.xcash_decimal_places;
        this.fconfirmations = this.transfer[0].confirmations;
        this.fdouble_spend_seen = this.transfer[0].double_spend_seen;
        this.ffee = this.transfer[0].fee / this.constantsService.xcash_decimal_places;
        this.fheight = this.transfer[0].height;
        this.fnote = this.transfer[0].note;
        this.fpayment_id = this.transfer[0].payment_id;
        this.fconfirmations = this.transfer[0].confirmations;
        this.fsubaddres_index_major = this.transfer[0].subaddr_index.major;
        this.fsubaddress_index_minor = this.transfer[0].subaddr_index.minor;
        this.fsuggested_confirmations_threshold = this.transfer[0].suggested_confirmations_threshold;
        this.ftimestamp = new Date(this.transfer[0].timestamp * 1000);
        this.transfer[0].timestamp;
        this.ftxid = this.transfer[0].txid;
        this.ftype = this.transfer[0].type;
        this.funlock_time = this.transfer[0].unlock_time;
      } else {
        this.faddress = 'Transaction ID not found.'
        this.famount = 0;
        this.ffee = 0;
      }
    } else {
      this.message = response.message;
    }
    this.showSpinner = false;
  }

  isNumber(indata: any): boolean {
    return typeof indata === 'number';
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  showMessage(message: string): void {
    this.message = message;
  }

}
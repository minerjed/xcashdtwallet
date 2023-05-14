import { Injectable } from '@angular/core';
import { ConstantsService } from './constants.service';

@Injectable({
  providedIn: 'root'
})

export class RpcCallsService {
  constructor(
    private constantsService: ConstantsService
  ) { };

  private async getPostRequestData(json_data: string): Promise<any> {
    const requestHeaders = new Headers({});
    const settings = { method: 'post', headers: requestHeaders, body: json_data };
    try {
      const res = await fetch(this.constantsService.xcash_rpc_url, settings);
      return await res.json();
    } catch (error) {
      console.log('received error:', JSON.stringify(error));
      throw error;
    }
  }

  public async openWallet(wallet: string, password: string): Promise<any> {
    // make sure no wallets are open
    this.closeWallet();
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"open_wallet","params":{"filename":"${wallet}","password":"${password}"}`;
    const result: string = await this.getPostRequestData(intrans);
    const ckerror: any = result;
    if (ckerror.hasOwnProperty('error')) {
      if (ckerror.error.code === -1) {
        return ('You may have entered an incorrect password. Please try again.');
      } else {
        return ckerror.error.message;
      }
    } else {
      return '';
    }
  }

  public async closeWallet(): Promise<void> {
    const intrans = '{"jsonrpc":"2.0","id":"0","method":"close_wallet"}';
    await this.getPostRequestData(intrans);
  }

  public async getTransactions(): Promise<any> {
    const intrans = '{"jsonrpc":"2.0","id":"0","method":"get_transfers","params":{"in":true,"out":true}}';
    let { result: { in: incomingTransactions, out: outgoingTransactions } } = await this.getPostRequestData(intrans);
    // No transactions found
    if (incomingTransactions === undefined && outgoingTransactions === undefined) {
      return [{ id: 0, amount: "", txid: "", date: "", transactionType: "" }];
    } else if (outgoingTransactions === undefined) {
      outgoingTransactions = [];
    }
    const transactions = incomingTransactions.concat(outgoingTransactions).map((item: any, index: any) => ({
      id: index + 1,
      amount: item.amount / this.constantsService.xcash_decimal_places,
      txid: item.txid,
      date: new Date(item.timestamp * 1000),
      transactionType: (item.type === 'block' || item.type === 'in') ? 'in' : 'out'
    }));
    // Sort the transactions by date in descending order
    transactions.sort((a: any, b: any) => b.date - a.date);
    // Reassign IDs to each transaction
    const transactionsWithIds = transactions.map((transaction: any, index: number) => ({
      ...transaction,
      id: index + 1,
    }));
    return transactionsWithIds;
  }

  public async getBalance(): Promise<number> {
    const intrans = '{"jsonrpc":"2.0","id":"0","method":"get_balance"}';
    const result: string = await this.getPostRequestData(intrans);
    const data: any = result;
    return (data.result.balance / this.constantsService.xcash_decimal_places);
  }

  public async getTransactionDetails(txid: string): Promise<any> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"get_transfer_by_txid","params":{"txid": "${txid}"}}`;
    let result: string = await this.getPostRequestData(intrans);
    if (result === undefined) {
      return [];
    } else {
      const data: any = result;
//      console.log('check this=', data.result);
      return data.result;
    }
  }

  public async sendPayment(toAddress: string, toPaymentId: string, toAmount: number, toPrivacy: string, 
    toMax: boolean, settings: boolean): Promise<Record<string, unknown>> {

      console.log(toAddress);
      console.log(toPaymentId);
      console.log(toAmount);
      console.log(toPrivacy);
      console.log(toMax);

      const sendType = toMax === true ? "sweep_all" : "transfer_split";
    const decimal_places = this.constantsService.xcash_decimal_places;
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"${sendType}","params":{"destinations":[{"amount":${toAmount * decimal_places}, 
     "address":"${toAddress}"}],"priority":0,"ring_size":21,"get_tx_keys": true, "payment_id":"${toPaymentId}", "tx_privacy_settings":"${toPrivacy}", 
     "do_not_relay":${settings}}}`;
//     let result: string = await this.getPostRequestData(intrans);
//     const data: any = result;
//     return { "status": "success", "txid": data.result.tx_hash_list[0], "txkey": data.result.tx_key_list[0], "fee": data.result.fee_list[0] / decimal_places, 
//      "total": (data.result.fee_list[0] + data.result.amount_list[0]) / decimal_places };
    return {"status": "error"};

     // reject({ "status": "error" });

  }


}
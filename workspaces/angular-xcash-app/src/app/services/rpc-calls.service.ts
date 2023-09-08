import { Injectable } from '@angular/core';
import { ConstantsService } from './constants.service';
import { WindowApiConst } from 'shared-lib';

const fs: any = window['electronFs'];
const APIs: any = window['electronAPIs'];

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
    try {
      this.closeWallet();
      const intrans = `{"jsonrpc":"2.0","id":"0","method":"open_wallet","params":{"filename":"${wallet}","password":"${password}"}`;
      const result: string = await this.getPostRequestData(intrans);
      const ckerror: any = result;
      if (ckerror.hasOwnProperty('error')) {
        if (ckerror.error.code === -1) {
          return ('Invalid password. Please try again.');
        } else {
          return ckerror.error.message;
        }
      } else {
        return '';
      }
    } catch (error) {
      return 'Errror occured openning wallet.'
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
    // Filter out transactions with an amount of zero
    const filteredIncomingTransactions = incomingTransactions.filter((item: any) => item.amount !== 0);
    const filteredOutgoingTransactions = outgoingTransactions.filter((item: any) => item.amount !== 0);
    const transactions = filteredIncomingTransactions.concat(filteredOutgoingTransactions).map((item: any, index: any) => ({
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
      return data.result;
    }
  }

  public async sendPayment(toAddress: string, toPaymentId: string, toAmount: number, toPrivacy: string,
    settings: boolean): Promise<Record<string, unknown>> {
    const decimal_places = this.constantsService.xcash_decimal_places;
    const intrans: string = `{"jsonrpc":"2.0","id":"0","method":"transfer_split","params":{"destinations":[{"amount":${toAmount * decimal_places}, "address":"${toAddress}"}],
    "priority":0,"ring_size":21,"get_tx_keys": true, "payment_id":"${toPaymentId}", "tx_privacy_settings":"${toPrivacy}", 
    "do_not_relay":${settings}}}`;
    let result: string = await this.getPostRequestData(intrans);
    const data: any = result;
    if (data.error === undefined) {
      return {
        "status": "success", "txid": data.result.tx_hash_list[0], "txkey": data.result.tx_key_list[0], "fee": data.result.fee_list[0] / decimal_places,
        "total": (data.result.fee_list[0] + data.result.amount_list[0]) / decimal_places
      };
    } else {
      if (data.error.code === -17) {
        return { "status": "error", "message": "Not enough XCASH for this transaction." }
      } else {
        return { "status": "error", "message": "RPC error, ${data.error.message}" };
      }
    }
  }

  public async getPrivateKeys(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const privatekeys = { "seed": "", "viewkey": "", "spendkey": "" };
      let data: any;
      try {
        data = await this.getPostRequestData('{"jsonrpc":"2.0","id":"0","method":"query_key","params":{"key_type":"mnemonic"}}');
        privatekeys.seed = data.result.key;
        data = await this.getPostRequestData('{"jsonrpc":"2.0","id":"0","method":"query_key","params":{"key_type":"view_key"}}');
        privatekeys.viewkey = data.result.key;
        data = await this.getPostRequestData('{"jsonrpc":"2.0","id":"0","method":"query_key","params":{"key_type":"spend_key"}}');
        privatekeys.spendkey = data.result.key;
        resolve(privatekeys);
      }
      catch (error) {
        reject();
      }
    });
  }

  public async changePassword(currentpassword: string, newpassword: string): Promise<string> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"change_wallet_password","params":{"old_password":"${currentpassword}","new_password":"${newpassword}"}}`;
    const result: string = await this.getPostRequestData(intrans);
    const ckerror: any = result;
    if (ckerror.hasOwnProperty('error')) {
      if (ckerror.error.code === -22) {
        return ('Current password is invalid. Please try again.');
      } else {
        return ckerror.error.message;
      }
    } else {
      return 'success';
    }
  }

  public async delegateVote(delegateData: any): Promise<string> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"vote","params":{"delegate_data":"${delegateData}"}}`;
    const result: string = await this.getPostRequestData(intrans);
    const ckerror: any = result;
    if (ckerror.hasOwnProperty('error')) {
      return (ckerror.error.message);
    } else {
      return ('success');
    }
  }

  public async revote(): Promise<string> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"revote"}`;
    const result: string = await this.getPostRequestData(intrans);
    const ckerror: any = result;
    if (ckerror.hasOwnProperty('error')) {
      return (ckerror.error.message);
    } else {
      return ('success');
    }
  }

  public async sweep_all_vote(inpublicAddress: string): Promise<any> {
    // Lets validate the public address just to make sure we have the correct one.
    const public_address = await this.getPublicAddress();
    if (public_address === 'failure') {
      return ('RPC error retriving public address')
    } else {
      const intrans = `{"jsonrpc":"2.0","id":"0","method":"sweep_all","params":{"address":"${inpublicAddress}","ring_size":21}}`;
      if (public_address !== inpublicAddress) {
        return ('Error matching pubilc address.');
      }
      const result: string = await this.getPostRequestData(intrans);
      const ckerror: any = result;
      if (ckerror.hasOwnProperty('error')) {
        return (ckerror.error.message);
      } else {
        return ('success');
      }
    }
  }

  public async check_vote_status(): Promise<any> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"vote_status"}`;
    try {
      const result: string = await this.getPostRequestData(intrans);
      const data: any = result;
      if (data.hasOwnProperty('error')) {
        if (data.error.code === -1) {
          return ('novote');
        } else {
          return (data);
        }
      } else {
        return (data.result.status);
      }
    } catch (error) {
      return ('error');
    }
  }

  public async createWallet(walletName: string, walletPassword: string): Promise<any> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"create_wallet","params":{"filename":"${walletName}","password":"${walletPassword}","language":"English"}}`;
    const result: string = await this.getPostRequestData(intrans);
    const ckerror: any = result;
    if (ckerror.hasOwnProperty('error')) {
      return (ckerror.error.message);
    } else {
      return ('success');
    }
  }

  public async getPublicAddress(): Promise<string> {
    const intrans = '{"jsonrpc":"2.0","id":"0","method":"get_address"}';
    try {
      const result: string = await this.getPostRequestData(intrans);
      const ckerror: any = result;
      if (ckerror.hasOwnProperty('error')) {
        return 'failure';
      } else {
        return (ckerror.result.address);
      }
    } catch (error) {
      return 'failure';
    }
  }

  public async getCurrentBlockHeight(): Promise<any> {
    const intrans = '{"jsonrpc":"2.0","id":"0","method":"get_height"}';
    try {
      const result: string = await this.getPostRequestData(intrans);
      const ckerror: any = result;
      if (ckerror.hasOwnProperty('error')) {
        return 'failure';
      } else {
        return (ckerror.result.height);
      }
    } catch (error) {
      return 'failure';
    }
  }

  public async importWallet(walletData: any): Promise<Record<any, any>> {
    try {
      if (APIs.platform === "win32") {
        APIs.exec("taskkill /F /IM xcash-wallet-rpc-win.exe");
      } else {
        APIs.exec("killall -9 'xcash-wallet-rpc-win.exe'");
      }
      await new Promise(resolve => setTimeout(resolve, 10000));
      const wdir = APIs.platform !== "win32" ? `${APIs.env.HOME}/${WindowApiConst.XCASHOFFICAL}/` : (`${APIs.userProfile}\\${WindowApiConst.XCASHOFFICAL}\\`).replace(/\\/g, "\\\\");
      const rpcexe = APIs.platform !== "win32" ? `${APIs.env.NODE_ENV}/xxxxx.exe` : (`${APIs.userProfile}\\AppData\\Local\\xcashdtwallet\\app-${WindowApiConst.XCASHVERSION}\\resources\\xcash-wallet-rpc-win.exe`).replace(/\\/g, "\\\\");
      const rpclog = `${wdir}xcash-wallet-rpc.log`;
      const dbfile = `${wdir}database.txt`;
      const data = fs.readFileSync(dbfile, "utf8");
      const dbdata = JSON.parse(data);
      const rnode = dbdata.wallet_settings.remote_node;
      const rpcUserAgent = navigator.userAgent;
      const IMPORT_WALLET_DATA = walletData.seed != '' ? `{"version":1,"filename":"${wdir}${walletData.walletName}","scan_from_height":0,"password":"${walletData.password}","seed":"${walletData.seed}"}` : `{"version":1,"filename":"${wdir}${walletData.walletName}","scan_from_height":0,"password":"${walletData.password}","address":"${walletData.publicaddress}","viewkey":"${walletData.viewkey}","spendkey":"${walletData.privatekey}"}`;
      const IMPORT_WALLET_FILE = `${wdir}importwallet.txt`;
      if (fs.existsSync(rpclog)) {
        fs.unlinkSync(rpclog);
      }
      await new Promise(resolve => setTimeout(resolve, 10000));
      fs.writeFileSync(IMPORT_WALLET_FILE, IMPORT_WALLET_DATA);
      await new Promise(resolve => setTimeout(resolve, 10000));
      // open the wallet in import mode
      APIs.exec(`${rpcexe}  --rpc-bind-port 18285 --disable-rpc-login --log-level 1 --generate-from-json "${IMPORT_WALLET_FILE}" --daemon-address "${rnode}" --rpc-user-agent "${rpcUserAgent}"`);
      await new Promise(resolve => setTimeout(resolve, 10000));
      fs.unlinkSync(IMPORT_WALLET_FILE);
      if (fs.existsSync(rpclog)) {
        fs.unlinkSync(rpclog);
      }
      await new Promise(resolve => setTimeout(resolve, 10000));
      if (APIs.platform === "win32") {
        APIs.exec("taskkill /F /IM xcash-wallet-rpc-win.exe");
      } else {
        APIs.exec("killall -9 'xcash-wallet-rpc-win.exe'");
      }
      await new Promise(resolve => setTimeout(resolve, 10000));
      const rpccommand: string = `${rpcexe} --rpc-bind-port 18285 --disable-rpc-login --log-level 1 --log-file ${rpclog} --wallet-dir ${wdir} --daemon-address ${rnode} --rpc-user-agent ${rpcUserAgent}`;
      APIs.exec(`${rpccommand}`);
      await new Promise(resolve => setTimeout(resolve, 10000));
      await this.openWallet(walletData.walletName, walletData.password);
      const publicaddress: any = await this.getPublicAddress();
      let block_height: number = 0;
      let current_block_height: number = 0;
      for (; ;) {
        block_height = await this.getCurrentBlockHeight();
        await new Promise(resolve => setTimeout(resolve, 60000));
        current_block_height = await this.getCurrentBlockHeight();
        if (block_height === current_block_height && block_height !== 0) {
          break;
        } else {
          await new Promise(resolve => setTimeout(resolve, 60000));
        }
      }
      const xcashbalance: number = await this.getBalance();
      await this.closeWallet();
      await new Promise(resolve => setTimeout(resolve, 10000));
      if (fs.existsSync(`${wdir}xcash-wallet-rpc.log-part-1`)) {
        fs.unlinkSync(`${wdir}xcash-wallet-rpc.log-part-1`);
      }
      if (fs.existsSync(`${wdir}xcash-wallet-rpc.log-part-2`)) {
        fs.unlinkSync(`${wdir}xcash-wallet-rpc.log-part-2`);
      }
      return { 'result': publicaddress, 'balance': xcashbalance };
    } catch (error) {
      return { 'result': 'failure', 'balance': 0 };
    }
  }

}
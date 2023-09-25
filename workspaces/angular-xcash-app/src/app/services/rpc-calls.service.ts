import { Injectable } from '@angular/core';
import { ConstantsService } from './constants.service';
import { WindowApiConst } from 'shared-lib';
import { SubAddress } from 'src/app/models/subaddress';
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
      const ret =
        { "error": { "code": -1, "message": "Failed to connect to daemon" }, "id": "0", "jsonrpc": "2.0" };
      return(ret);
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
    try {
      const intrans = `{"jsonrpc":"2.0","id":"0","method":"get_transfer_by_txid","params":{"txid": "${txid}"}}`;
      let result: string = await this.getPostRequestData(intrans);
      const ckdata: any = result;
      if (ckdata.hasOwnProperty('error')) {
        return (false);
      } else {
        return (ckdata.result);
      }
    } catch (error) {
      return 'false';
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

  public async getSubAddresses(subAddressCount: number): Promise<SubAddress[]> {
    return new Promise(async (resolve, reject) => {
      let subAddressList = "";
      let count;
      for (count = 1; count <= subAddressCount; count++) {
        subAddressList += `${count},`;
      }
      subAddressList = subAddressList.slice(0, -1);
      const intrans = `{"jsonrpc":"2.0","id":"0","method":"get_balance","params":{"account_index":0,"address_indices":[${subAddressList}]}}`;
      let subAddresses: SubAddress[] = [];
      let data: any;
      try {
        data = await this.getPostRequestData(intrans);
        data.result.per_subaddress.forEach((item: { address_index: any; label: any; address: any; balance: number; }) => {
          subAddresses.push({
            id: item.address_index,
            label: item.label,
            address: item.address,
            balance: item.balance / this.constantsService.xcash_decimal_places,
          });
        });
        resolve(subAddresses);
      }
      catch (error) {
        let subAddresses: SubAddress[] = [];
        reject(subAddresses);
      }
    });
  }

  public async createSubAddress(label: string): Promise<{ newaddress: string, addressIndex: number }> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"create_address","params":{"account_index":0,"label":"${label}"}}`;
    try {
      const result: string = await this.getPostRequestData(intrans);
      const ckdata: any = result;
      if (ckdata.hasOwnProperty('error')) {
        return { newaddress: 'failure', addressIndex: 0 };
      } else {
        return {
          newaddress: ckdata.result.address,
          addressIndex: ckdata.result.address_index
        };
      }
    }
    catch (error) {
      return { newaddress: 'failure', addressIndex: 0 };
    }
  }

  public async updateaddressLabel(addressId: number, newLabel: string): Promise<boolean> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"label_address",
      "params":{"index":{"major":0,"minor":${addressId}},"label":"${newLabel}"}}`;
    try {
      const result: string = await this.getPostRequestData(intrans);
      const ckerror: any = result;
      if (ckerror.hasOwnProperty('error')) {
        return (false);
      } else {
        return (true);
      }
    } catch (error) {
      return (false);
    }
  }

  public async createIntegratedAddress(paymentid: string): Promise<any> {
    let intrans: string = '';
    if (paymentid === undefined) {
      intrans = `{"jsonrpc":"2.0","id":"0","method":"make_integrated_address"}`;
    } else {
      intrans = `{"jsonrpc":"2.0","id":"0","method":"make_integrated_address",
        "params":{"payment_id":"${paymentid}"}}`;
    }
    try {
      const result: string = await this.getPostRequestData(intrans);
      const ckdata: any = result;
      if (ckdata.hasOwnProperty('error')) {
        return ({ "status": false, "payment_id": '', "integrated_address": '' });
      } else {
        return ({
          "status": true, "payment_id": ckdata.result.payment_id,
          "integrated_address": ckdata.result.integrated_address
        });
      }
    } catch (error) {
      return ({ "status": false, "payment_id": '', "integrated_address": '' });
    }
  }

  public async createSignedData(signedData: string): Promise<string> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"sign","params":{"data":"${signedData}"}}`;
    try {
      const result: string = await this.getPostRequestData(intrans);
      const ckdata: any = result;
      if (ckdata.hasOwnProperty('error')) {
        return ('error');
      } else {
        return (ckdata.result.signature);
      }
    }
    catch (error) {
      return ('error');
    }
  }

  public async verifySignedData(signedData: any): Promise<boolean> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"verify","params":{"data":"${signedData.data}",
      "address":"${signedData.public_address}","signature":"${signedData.signature}"}}`;
    try {
      const result: string = await this.getPostRequestData(intrans);
      const ckdata: any = result;
      if (ckdata.hasOwnProperty('error')) {
        return (false);
      } else {
        return (ckdata.result.good);
      }
    }
    catch (error) {
      return (false);
    }
  }

  public async createReserveproof(reserveproofData: any): Promise<string> {
    const newAmmount = reserveproofData.amount * this.constantsService.xcash_decimal_places;
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"get_reserve_proof",
      "params":{"all":false,"account_index":0,"amount":${newAmmount},"message":"${reserveproofData.message}"}}`;
    try {
      const result: string = await this.getPostRequestData(intrans);
      const ckdata: any = result;
      if (ckdata.hasOwnProperty('error')) {
        return ('error');
      } else {
        return (ckdata.result.signature);
      }
    }
    catch (error) {
      return ('error');
    }
  }

  public async verifyReserveproof(reserveproofData: any): Promise<string> {
    reserveproofData.message = reserveproofData.message == null ? "" : reserveproofData.message;
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"check_reserve_proof",
      "params":{"address":"${reserveproofData.public_address}","message":"${reserveproofData.message}",
      "signature":"${reserveproofData.reserveproof}"}}`;
    try {
      const result: string = await this.getPostRequestData(intrans);
      const ckdata: any = result;
      if (ckdata.hasOwnProperty('error')) {
        return ('error');
      } else {
        return (ckdata.result.good === true && ckdata.result.spent === 0 ? 'true' : 'false');
      }
    }
    catch (error) {
      return ('error');
    }
  }

}
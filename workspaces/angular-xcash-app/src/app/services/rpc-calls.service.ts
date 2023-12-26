import { Injectable } from '@angular/core';
import { ConstantsService } from './constants.service';
import { WindowApiConst } from 'shared-lib';
import { SubAddress } from 'src/app/models/subaddress';
import { rpcReturn } from 'src/app/models/rpc-return';
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
      return (ret);
    }
  }

  public async openWallet(wallet: string, password: string): Promise<rpcReturn> {
    // make sure no wallets are open
    await this.closeWallet();
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"open_wallet","params":{"filename":"${wallet}","password":"${password}"}`;
    const result: string = await this.getPostRequestData(intrans);
    const ckerror: any = result;
    if (ckerror.hasOwnProperty('error')) {
      if (ckerror.error.code === -1) {
        return { status: false, message: 'Invalid password. Please try again.', data: null };
      } else {
        return { status: false, message: 'RPC error, ' + ckerror.error.message, data: null };
      }
    } else {
      return { status: true, message: '', data: null };
    }
  }

  public async closeWallet(): Promise<void> {
    const intrans = '{"jsonrpc":"2.0","id":"0","method":"close_wallet"}';
    await this.getPostRequestData(intrans);
  }

  public async getTransactions(): Promise<rpcReturn> {
    const intrans = '{"jsonrpc":"2.0","id":"0","method":"get_transfers","params":{"in":true,"out":true}}';
    const fresult = await this.getPostRequestData(intrans);
    const ckdata: any = fresult;
    if (ckdata.hasOwnProperty('error')) {
      return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
    } else {
      let { result: { in: incomingTransactions, out: outgoingTransactions } } = fresult;
      // No transactions found
      if (incomingTransactions === undefined && outgoingTransactions === undefined) {
        return { status: true, message: 'No transactions found.', data: [{ id: 0, amount: "", txid: "", date: "", transactionType: "" }] };
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
      return { status: true, message: 'Success.', data: transactionsWithIds };
    }
  }

  public async getBalance(): Promise<rpcReturn> {
    const intrans = '{"jsonrpc":"2.0","id":"0","method":"get_balance"}';
    const result: string = await this.getPostRequestData(intrans);
    const ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
    } else {
      return { status: true, message: 'Success.', data: (ckdata.result.balance / this.constantsService.xcash_decimal_places) };
    }
  }

  public async getTransactionDetails(txid: string): Promise<rpcReturn> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"get_transfer_by_txid","params":{"txid": "${txid}"}}`;
    let result: string = await this.getPostRequestData(intrans);
    const ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
    } else {
      return { status: true, message: 'Success.', data: ckdata.result };
    }
  }

  public async sendPayment(toAddress: string, toPaymentId: string, toAmount: number, toPrivacy: string,
    settings: boolean): Promise<rpcReturn> {
    const decimal_places = this.constantsService.xcash_decimal_places;
    const intrans: string = `{"jsonrpc":"2.0","id":"0","method":"transfer_split","params":{"destinations":[{"amount":${toAmount * decimal_places}, "address":"${toAddress}"}],
    "priority":0,"ring_size":21,"get_tx_keys": true, "payment_id":"${toPaymentId}", "tx_privacy_settings":"${toPrivacy}", 
    "do_not_relay":${settings}}}`;
    let result: string = await this.getPostRequestData(intrans);
    const ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      if (ckdata.error.code === -17) {
        return { status: false, message: 'Not enough XCASH for this transaction.', data: null };
      } else {
        return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
      }
    } else {
      const wsdata = {
        "status": true, "txid": ckdata.result.tx_hash_list[0], "txkey": ckdata.result.tx_key_list[0],
        "fee": ckdata.result.fee_list[0] / decimal_places,
        "total": (ckdata.result.fee_list[0] + ckdata.result.amount_list[0]) / decimal_places
      };
      return { status: true, message: 'Success.', data: wsdata };
    }
  }

  public async getPrivateKeys(): Promise<rpcReturn> {
    const privatekeys = { "seed": "", "viewkey": "", "spendkey": "" };
    const result = await this.getPostRequestData('{"jsonrpc":"2.0","id":"0","method":"query_key","params":{"key_type":"mnemonic"}}');
    let ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
    } else {
      privatekeys.seed = ckdata.result.key;
      const result = await this.getPostRequestData('{"jsonrpc":"2.0","id":"0","method":"query_key","params":{"key_type":"view_key"}}');
      ckdata = result;
      if (ckdata.hasOwnProperty('error')) {
        return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
      } else {
        privatekeys.viewkey = ckdata.result.key;
        const result = await this.getPostRequestData('{"jsonrpc":"2.0","id":"0","method":"query_key","params":{"key_type":"spend_key"}}');
        ckdata = result;
        if (ckdata.hasOwnProperty('error')) {
          return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
        } else {
          privatekeys.spendkey = ckdata.result.key;
          return { status: true, message: 'Success.', data: privatekeys };
        }
      }
    }
  }

  public async changePassword(currentpassword: string, newpassword: string): Promise<rpcReturn> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"change_wallet_password","params":{"old_password":"${currentpassword}","new_password":"${newpassword}"}}`;
    const result: string = await this.getPostRequestData(intrans);
    const ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      if (ckdata.error.code === -22) {
        return { status: false, message: 'Current password is invalid. Please try again.', data: null };
      } else {
        return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
      }
    } else {
      return { status: true, message: 'Success.', data: null };
    }
  }

  public async delegateVote(delegateData: any): Promise<rpcReturn> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"vote","params":{"delegate_data":"${delegateData}"}}`;
    const result: string = await this.getPostRequestData(intrans);
    const ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
    } else {
      return { status: true, message: 'Success.', data: null };
    }
  }

  public async revote(): Promise<rpcReturn> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"revote"}`;
    const result: string = await this.getPostRequestData(intrans);
    const ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
    } else {
      return { status: true, message: 'Success.', data: null };
    }
  }

  public async sweep_all_vote(inpublicAddress: string): Promise<rpcReturn> {
    // Lets validate the public address just to make sure we have this correct.
    const response: rpcReturn = await this.getPublicAddress();
    if (response.status) {
      const public_address = response.data;
      if (public_address !== inpublicAddress) {
        return { status: false, message: 'Error matching pubilc address.', data: null };
      } else {
        const intrans = `{"jsonrpc":"2.0","id":"0","method":"sweep_all","params":{"address":"${inpublicAddress}","ring_size":21}}`;
        const result: string = await this.getPostRequestData(intrans);
        const ckdata: any = result;
        if (ckdata.hasOwnProperty('error')) {
          return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
        } else {
          return { status: true, message: 'Success.', data: null };
        }
      }
    } else {
      return { status: false, message: 'RPC error, ' + response.message, data: null };
    }
  }

  public async check_vote_status(): Promise<rpcReturn> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"vote_status"}`;
    const result: string = await this.getPostRequestData(intrans);
    const ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      if (ckdata.error.code === -1) {
        return { status: false, message: 'RPC error, ' + ckdata.error.message, data: 'novote' };
      } else {
        return { status: false, message: 'RPC error, ' + ckdata.error.message, data: '' };
      }
    } else {
      return { status: true, message: 'Success.', data: ckdata.result.status };
    }
  }

  public async createWallet(walletName: string, walletPassword: string): Promise<rpcReturn> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"create_wallet","params":{"filename":"${walletName}","password":"${walletPassword}","language":"English"}}`;
    const result: string = await this.getPostRequestData(intrans);
    const ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
    } else {
      return { status: true, message: 'Success.', data: null };
    }
  }

  public async getPublicAddress(): Promise<rpcReturn> {
    const intrans = '{"jsonrpc":"2.0","id":"0","method":"get_address"}';
    const result: string = await this.getPostRequestData(intrans);
    const ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
    } else {
      return { status: true, message: 'Success.', data: ckdata.result.address };
    }
  }

  public async getCurrentBlockHeight(): Promise<rpcReturn> {
    const intrans = '{"jsonrpc":"2.0","id":"0","method":"get_height"}';
    const result: string = await this.getPostRequestData(intrans);
    const ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
    } else {
      return { status: true, message: 'Success.', data: ckdata.result.height };
    }
  }

  public async importWallet(walletData: any, blockheight: number): Promise<rpcReturn> {
    try {
      if (APIs.platform === "win32") {
        APIs.exec("taskkill /F /IM xcash-wallet-rpc-win.exe");
      } else { 
        APIs.exec("killall -9 'xcash-wallet-rpc-linux'");
      }
      await new Promise(resolve => setTimeout(resolve, 10000));
      const wdir = APIs.platform !== "win32" ? `${APIs.homeDir}/${WindowApiConst.XCASHOFFICIAL}/` : (`${APIs.userProfile}\\${WindowApiConst.XCASHOFFICIAL}\\`).replace(/\\/g, "\\\\");
      const rpcexe = APIs.platform !== "win32" ? `/usr/lib/xcashdtwallet/resources/xcash-wallet-rpc-linux` : (`${APIs.userProfile}\\AppData\\Local\\xcashdtwallet\\app-${WindowApiConst.XCASHVERSION}\\resources\\xcash-wallet-rpc-win.exe`).replace(/\\/g, "\\\\");
      const rpclog = `${wdir}xcash-wallet-rpc.log`;
      const dbfile = `${wdir}database.txt`;
      const data = fs.readFileSync(dbfile, "utf8");
      const dbdata = JSON.parse(data);
      const rnode = dbdata.wallet_settings.remote_node;
      const rpcUserAgent = navigator.userAgent;
      const IMPORT_WALLET_DATA = walletData.seed != '' ? `{"version":1,"filename":"${wdir}${walletData.walletName}","scan_from_height":${blockheight},"password":"${walletData.password}","seed":"${walletData.seed}"}` : `{"version":1,"filename":"${wdir}${walletData.walletName}","scan_from_height":${blockheight},"password":"${walletData.password}","address":"${walletData.publicaddress}","viewkey":"${walletData.viewkey}","spendkey":"${walletData.privatekey}"}`;
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
        APIs.exec("killall -9 'xcash-wallet-rpc-linux'");
      }
      await new Promise(resolve => setTimeout(resolve, 10000));
      const rpccommand: string = `${rpcexe} --rpc-bind-port 18285 --disable-rpc-login --log-level 1 --log-file ${rpclog} --wallet-dir ${wdir} --daemon-address ${rnode} --rpc-user-agent ${rpcUserAgent}`;
      APIs.exec(`${rpccommand}`);
      await new Promise(resolve => setTimeout(resolve, 10000));
      const wsopen: any = await this.openWallet(walletData.walletName, walletData.password);
      if (!wsopen.status) {
        return { status: false, message: 'RPC error, ' + wsopen.message, data: null };
      }
      const wsaddress: any = await this.getPublicAddress();
      let wspublicaddress: string = '';
      if (wsaddress.status) {
        wspublicaddress = wsaddress.data;
      } else {
        return { status: false, message: 'RPC error, ' + wsaddress.message, data: null };
      }
      let xcashbalance = 0;
      const wsbalance: rpcReturn = await this.getBalance();
      if (wsbalance.status) {
        xcashbalance = wsbalance.data
      } else {
        return { status: false, message: 'RPC error, ' + wsbalance.message, data: null };
      }
      if (fs.existsSync(`${wdir}xcash-wallet-rpc.log-part-1`)) {
        fs.unlinkSync(`${wdir}xcash-wallet-rpc.log-part-1`);
      }
      if (fs.existsSync(`${wdir}xcash-wallet-rpc.log-part-2`)) {
        fs.unlinkSync(`${wdir}xcash-wallet-rpc.log-part-2`);
      }
      return { status: true, message: 'Success.', data: { 'publicaddress': wspublicaddress, 'balance': xcashbalance } };
    } catch (error) {
      return { status: false, message: 'Failed to import wallet, ' + error, data: null };
    }
  }

  public async killRPC(): Promise<rpcReturn> {
    try {
      const wdir = APIs.platform !== "win32" ? `${APIs.homeDir}/${WindowApiConst.XCASHOFFICIAL}/` : (`${APIs.userProfile}\\${WindowApiConst.XCASHOFFICIAL}\\`).replace(/\\/g, "\\\\");
      const rpcexe = APIs.platform !== "win32" ? `/usr/lib/xcashdtwallet/resources/xcash-wallet-rpc-linux` : (`${APIs.userProfile}\\AppData\\Local\\xcashdtwallet\\app-${WindowApiConst.XCASHVERSION}\\resources\\xcash-wallet-rpc-win.exe`).replace(/\\/g, "\\\\");
      const rpclog = `${wdir}xcash-wallet-rpc.log`;
      const dbfile = `${wdir}database.txt`;
      const data = fs.readFileSync(dbfile, "utf8");
      const dbdata = JSON.parse(data);
      const rnode = dbdata.wallet_settings.remote_node;
      const rpcUserAgent = navigator.userAgent;
      if (APIs.platform === "win32") {
        APIs.exec("taskkill /F /IM xcash-wallet-rpc-win.exe");
      } else {
        APIs.exec("killall -9 'xcash-wallet-rpc-linux'");
      }
      await new Promise(resolve => setTimeout(resolve, 10000));
      const rpccommand: string = `${rpcexe} --rpc-bind-port 18285 --disable-rpc-login --log-level 1 --log-file ${rpclog} --wallet-dir ${wdir} --daemon-address ${rnode} --rpc-user-agent ${rpcUserAgent}`;
      APIs.exec(`${rpccommand}`);
      await new Promise(resolve => setTimeout(resolve, 10000));
      return { status: true, message: 'Success.', data: '' };
    } catch (error) {
      return { status: false, message: 'Error shutting down RPC process.' + error, data: null };
    }
  }

  public async getSubAddresses(subAddressCount: number): Promise<rpcReturn> {
    let subAddressList = "";
    let count;
    for (count = 1; count <= subAddressCount; count++) {
      subAddressList += `${count},`;
    }
    subAddressList = subAddressList.slice(0, -1);
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"get_balance","params":{"account_index":0,"address_indices":[${subAddressList}]}}`;
    let subAddresses: SubAddress[] = [];
    const result = await this.getPostRequestData(intrans);
    const ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
    } else {
      ckdata.result.per_subaddress.forEach((item: { address_index: any; label: any; address: any; balance: number; }) => {
        subAddresses.push({
          id: item.address_index,
          label: item.label,
          address: item.address,
          balance: item.balance / this.constantsService.xcash_decimal_places,
        });
      });
      return { status: true, message: 'Success.', data: subAddresses };
    }
  }

  public async createSubAddress(label: string): Promise<rpcReturn> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"create_address","params":{"account_index":0,"label":"${label}"}}`;
    const result: string = await this.getPostRequestData(intrans);
    const ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
    } else {
      return { status: true, message: 'Success.', data: { newaddress: ckdata.result.address, addressIndex: ckdata.result.address_index } };
    }
  }

  public async updateaddressLabel(addressId: number, newLabel: string): Promise<rpcReturn> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"label_address",
      "params":{"index":{"major":0,"minor":${addressId}},"label":"${newLabel}"}}`;
    const result: string = await this.getPostRequestData(intrans);
    const ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
    } else {
      return { status: true, message: 'Success.', data: null };
    }
  }

  public async createIntegratedAddress(paymentid: string): Promise<rpcReturn> {
    let intrans: string = '';
    if (paymentid === undefined) {
      intrans = `{"jsonrpc":"2.0","id":"0","method":"make_integrated_address"}`;
    } else {
      intrans = `{"jsonrpc":"2.0","id":"0","method":"make_integrated_address",
        "params":{"payment_id":"${paymentid}"}}`;
    }
    const result: string = await this.getPostRequestData(intrans);
    const ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
    } else {
      return {
        status: true, message: 'Success.', data: {
          "payment_id": ckdata.result.payment_id,
          "integrated_address": ckdata.result.integrated_address
        }
      };
    }
  }

  public async createSignedData(signedData: string): Promise<rpcReturn> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"sign","params":{"data":"${signedData}"}}`;
    const result: string = await this.getPostRequestData(intrans);
    const ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
    } else {
      return { status: true, message: 'Success.', data: ckdata.result.signature };
    }
  }

  public async verifySignedData(signedData: any): Promise<rpcReturn> {
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"verify","params":{"data":"${signedData.data}",
      "address":"${signedData.public_address}","signature":"${signedData.signature}"}}`;
    const result: string = await this.getPostRequestData(intrans);
    const ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
    } else {
      return { status: true, message: 'Success.', data: ckdata.result.good };
    }
  }

  public async createReserveproof(reserveproofData: any): Promise<rpcReturn> {
    const newAmount = reserveproofData.amount * this.constantsService.xcash_decimal_places;
    let intrans = '';
    if (reserveproofData.message === '') {
      intrans = `{"jsonrpc":"2.0","id":"0","method":"get_reserve_proof",
      "params":{"all":false,"account_index":0,"amount":${newAmount}}`;
    } else {
      intrans = `{"jsonrpc":"2.0","id":"0","method":"get_reserve_proof",
      "params":{"all":false,"account_index":0,"amount":${newAmount},"message":"${reserveproofData.message}"}}`;
    }
    const result: string = await this.getPostRequestData(intrans);
    const ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
    } else {
      return { status: true, message: 'Success.', data: ckdata.result.signature };
    }
  }

  public async verifyReserveproof(reserveproofData: any): Promise<rpcReturn> {
    reserveproofData.message = reserveproofData.message == null ? "" : reserveproofData.message;
    const intrans = `{"jsonrpc":"2.0","id":"0","method":"check_reserve_proof",
      "params":{"address":"${reserveproofData.public_address}","message":"${reserveproofData.message}",
      "signature":"${reserveproofData.reserveproof}"}}`;
    const result: string = await this.getPostRequestData(intrans);
    const ckdata: any = result;
    if (ckdata.hasOwnProperty('error')) {
      return { status: false, message: 'RPC error, ' + ckdata.error.message, data: null };
    } else {
      ckdata.result.good === true && ckdata.result.spent === 0 ? 'true' : 'false';
      return { status: true, message: 'Success.', data: ckdata.result };
    }
  }

}
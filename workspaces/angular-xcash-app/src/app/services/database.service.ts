import { Injectable } from '@angular/core';
import { WindowApiConst } from 'shared-lib';

const fs: any = window['electronFs'];
const APIs: any = window['electronAPIs'];

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  wdir = APIs.platform !== "win32" ? `${APIs.homeDir}${WindowApiConst.XCASHOFFICAL}` : (`${APIs.userProfile}\\${WindowApiConst.XCASHOFFICAL}\\`).replace(/\\/g, "\\\\");
  dbfile: string = `${this.wdir}database.txt`;

  constructor() { }

  public async saveWalletData(walletname: string, publicaddress: string, balance: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        let database_data: any = JSON.parse(fs.readFileSync(this.dbfile, "utf8"));
        database_data.wallet_data.push({
          wallet_name: walletname,
          public_address: publicaddress,
          balance: balance,
          sub_address_count: 0,
          integrated_addresses: [],
          reserve_proofs: [],
          signed_data: []
        });
        fs.writeFileSync(this.dbfile, JSON.stringify(database_data));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public async checkIfWalletExist(data: string): Promise<boolean> {
    if (fs.existsSync(`${this.wdir}${data}`)) {
      return true;
    } else {
      return false;
    }
  }

}
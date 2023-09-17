import { Injectable } from '@angular/core';
import { WindowApiConst } from 'shared-lib';
import { Contact } from '../models/contact.model';

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

  public async getContacts(): Promise<Contact[]> {
    return new Promise(async (resolve, reject) => {
      try {
        // Constants
        const DATABASE_DATA: any = JSON.parse(fs.readFileSync(this.dbfile, "utf8"));

        // variables
        let Contact: Contact[] = [];
        let count = 0;
        DATABASE_DATA.contact_data.forEach((item: any) => {
          Contact.push({
            id: count,
            name: item.name,
            address: item.public_address,
          });
          count++;
        });
        resolve(Contact);
      } catch (error) {
        reject(error);
      }
    });
  }

  public async addContacts(data: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Variables
        let database_data: any = JSON.parse(fs.readFileSync(this.dbfile, "utf8"));
        database_data.contact_data.push({
          name: data.name,
          public_address: data.public_address,
        });
        fs.writeFileSync(this.dbfile, JSON.stringify(database_data));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public async editContacts(data: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Variables
        let database_data: any = JSON.parse(fs.readFileSync(this.dbfile, "utf8"));
        database_data.contact_data[data.id].name = data.name;
        database_data.contact_data[data.id].public_address = data.public_address;
        fs.writeFileSync(this.dbfile, JSON.stringify(database_data));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public async deleteContacts(id: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        let database_data: any = JSON.parse(fs.readFileSync(this.dbfile, "utf8"));
        database_data.contact_data.splice(id, 1);
        fs.writeFileSync(this.dbfile, JSON.stringify(database_data));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public async getSubAddressCount(public_address: string): Promise<number> {
    return new Promise(async (resolve, reject) => {
      try {
        const DATABASE_DATA: any = JSON.parse(fs.readFileSync(this.dbfile, "utf8"));
        const WALLET_COUNT: number = await this.getCurrentWallet(public_address);
        resolve(DATABASE_DATA.wallet_data[WALLET_COUNT].sub_address_count);
      } catch (error) {
        reject(error);
      }
    });
  }

  public async updateSubAddressCount(public_address: string, addressIndex: number): Promise<boolean> {
    try {
      const WALLET_COUNT: number = await this.getCurrentWallet(public_address);
      let database_data: any = JSON.parse(fs.readFileSync(this.dbfile, "utf8"));
      database_data.wallet_data[WALLET_COUNT].sub_address_count = addressIndex;
      fs.writeFileSync(this.dbfile, JSON.stringify(database_data));
      return (true);
    } catch (error) {
      return (false);
    }
  }

  private async getCurrentWallet(public_address: string): Promise<number> {
    return new Promise(async (resolve) => {
      try {
        const DATABASE_DATA: any = JSON.parse(fs.readFileSync(this.dbfile, "utf8"));
        let wallet_count: number = 0;
        for (wallet_count = 0; wallet_count < DATABASE_DATA.wallet_data.length; wallet_count++) {
          if (DATABASE_DATA.wallet_data[wallet_count].public_address === public_address) {
            break;
          }
        }
        if (wallet_count === DATABASE_DATA.wallet_data.length) {
          resolve(0);
        }
        else {
          resolve(wallet_count);
        }
      } catch (error) {
        resolve(0);
      }
    });
  }

}
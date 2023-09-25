import { Injectable } from '@angular/core';
import { WindowApiConst } from 'shared-lib';
import { Contact } from '../models/contact.model';
import { integratedAddress } from '../models/integratedaddress';
import { signedData } from '../models/signeddata';
import { ReserveProof } from '../models/reserveproof';
import { RpcCallsService } from './rpc-calls.service';

const fs: any = window['electronFs'];
const APIs: any = window['electronAPIs'];

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  wdir = APIs.platform !== "win32" ? `${APIs.homeDir}${WindowApiConst.XCASHOFFICAL}` : (`${APIs.userProfile}\\${WindowApiConst.XCASHOFFICAL}\\`).replace(/\\/g, "\\\\");
  dbfile: string = `${this.wdir}database.txt`;

  constructor(private rpcallsService: RpcCallsService) { }

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
        const database_data: any = JSON.parse(fs.readFileSync(this.dbfile, "utf8"));

        // variables
        let Contact: Contact[] = [];
        let count = 0;
        database_data.contact_data.forEach((item: any) => {
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
        const database_data: any = JSON.parse(fs.readFileSync(this.dbfile, "utf8"));
        const wallet_count: number = await this.getCurrentWallet(public_address);
        resolve(database_data.wallet_data[wallet_count].sub_address_count);
      } catch (error) {
        reject(error);
      }
    });
  }

  public async updateSubAddressCount(public_address: string, addressIndex: number): Promise<boolean> {
    try {
      const wallet_count: number = await this.getCurrentWallet(public_address);
      let database_data: any = JSON.parse(fs.readFileSync(this.dbfile, "utf8"));
      database_data.wallet_data[wallet_count].sub_address_count = addressIndex;
      fs.writeFileSync(this.dbfile, JSON.stringify(database_data));
      return (true);
    } catch (error) {
      return (false);
    }
  }

  private async getCurrentWallet(public_address: string): Promise<number> {
    return new Promise(async (resolve) => {
      try {
        const database_data: any = JSON.parse(fs.readFileSync(this.dbfile, "utf8"));
        let wallet_count: number = 0;
        for (wallet_count = 0; wallet_count < database_data.wallet_data.length; wallet_count++) {
          if (database_data.wallet_data[wallet_count].public_address === public_address) {
            break;
          }
        }
        if (wallet_count === database_data.wallet_data.length) {
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

  public async getIntegratedAddresses(public_address: string): Promise<integratedAddress[]> {
    let IntegratedAddress: integratedAddress[] = [];
    try {
      const database_data: any = JSON.parse(fs.readFileSync(this.dbfile, "utf8"));
      const wallet_count: number = await this.getCurrentWallet(public_address);
      let count = 0;
      database_data.wallet_data[wallet_count].integrated_addresses.forEach((item: {
        label: string; payment_id: string; integrated_address: string;
      }) => {
        count++;
        IntegratedAddress.push({
          id: count,
          label: item.label,
          paymentid: item.payment_id,
          address: item.integrated_address,
        });
      });
      return (IntegratedAddress);
    } catch (error) {
      return (IntegratedAddress);
    }
  }

  public async saveIntegratedAddresses(data: any, public_address: string): Promise<boolean> {
    try {
      const wallet_count: number = await this.getCurrentWallet(public_address);
      let database_data: any = JSON.parse(fs.readFileSync(this.dbfile, "utf8"));
      database_data.wallet_data[wallet_count].integrated_addresses.push({
        label: data.label,
        payment_id: data.payment_id,
        integrated_address: data.integrated_address,
      });
      fs.writeFileSync(this.dbfile, JSON.stringify(database_data));
      return (true);
    } catch (error) {
      return (false);
    }
  }

  public async getSignedData(public_address: string): Promise<signedData[]> {
    let SignedData: signedData[] = [];
    try {
      const database_data: any = JSON.parse(fs.readFileSync(this.dbfile, "utf8"));
      const wallet_count: number = await this.getCurrentWallet(public_address);
      let count: number = 0;
      database_data.wallet_data[wallet_count].signed_data.forEach((item: { data: any; signature: any; }) => {
        count++;
        SignedData.push({
          id: count,
          data: item.data,
          signature: item.signature,
        });
      });
      return (SignedData);
    } catch (error) {
      return (SignedData);
    }
  }

  public async saveSignedData(data: any, public_address: string): Promise<boolean> {
    try {
      const wallet_count: number = await this.getCurrentWallet(public_address);
      let database_data: any = JSON.parse(fs.readFileSync(this.dbfile, "utf8"));
      database_data.wallet_data[wallet_count].signed_data.push({
        data: data.data,
        signature: data.signature,
      });
      fs.writeFileSync(this.dbfile, JSON.stringify(database_data));
      return (true);
    } catch (error) {
      return (false);
    }
  }

  public async getReserveproof(public_address: string): Promise<ReserveProof[]> {
    let reserveProof: ReserveProof[] = [];
    const wallet_count: number = await this.getCurrentWallet(public_address);
    let database_data: any = JSON.parse(fs.readFileSync(this.dbfile, "utf8"));
    let count: number = 0;
    let status: string[] = [];
    let retStatus: string;
    try {
      if (database_data.wallet_data[wallet_count].reserve_proofs.length > 0) {
        database_data.wallet_data[wallet_count].reserve_proofs.forEach(async (item: {
          message: any; reserve_proof: any;
        }) => {
          retStatus = await this.rpcallsService.verifyReserveproof({
            "public_address": public_address, "message": item.message, "reserveproof": item.reserve_proof
          });
          if (retStatus === 'error') {
            status[count] = 'Error';
          } else {
            status[count] = retStatus === 'true' ? "Valid" : "Invalid";
          }
          count++;
        });
        while (status[database_data.wallet_data[wallet_count].reserve_proofs.length - 1] == undefined) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        count = 0;
        database_data.wallet_data[wallet_count].reserve_proofs.forEach((item: { balance: any; reserve_proof: any; message: any; }) => {
          reserveProof.push({
            id: count + 1,
            amount: item.balance,
            signature: item.reserve_proof,
            status: status[count],
            message: item.message
          });
          count++;
        });
      }
      return (reserveProof);
    } catch (error) {
      return (reserveProof);
    }
  }

  public async saveReserveproof(data: any, public_address: string): Promise<boolean> {
    const wallet_count: number = await this.getCurrentWallet(public_address);
    try {
      let database_data: any = JSON.parse(fs.readFileSync(this.dbfile, "utf8"));
      database_data.wallet_data[wallet_count].reserve_proofs.push({
        reserve_proof: data.reserve_proof,
        message: data.message,
        balance: data.balance
      });
      fs.writeFileSync(this.dbfile, JSON.stringify(database_data));
      return (true);
    } catch (error) {
      return (false);
    }
  }

}
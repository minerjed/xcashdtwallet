import { Injectable } from '@angular/core';
import { WindowApiConst } from 'shared-lib';

declare const window: any;
const { electronFs: fs, electronAPIs: APIs } = window;

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private dbfile = `${APIs.platform !== "win32" ? `${APIs.homeDir}/${WindowApiConst.XCASHOFFICAL}/database.txt` : `${APIs.userProfile}\\${WindowApiConst.XCASHOFFICAL}\\`.replace(/\\/g, "\\\\")}database.txt`;
  private readDatabase(): any {
    try {
      const data = fs.readFileSync(this.dbfile, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private writeDatabase(data: any): any {
    try {
      fs.writeFileSync(this.dbfile, JSON.stringify(data));
      return('success');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async getAutoLock(): Promise<number> {
    const databaseData = this.readDatabase();
    return databaseData.wallet_settings.autolock;
  }

  public async getRemoteNode(): Promise<string> {
    const databaseData = this.readDatabase();
    return databaseData.wallet_settings.remote_node;
  }

  public async getCurrency(): Promise<string> {
    const databaseData = this.readDatabase();
    return databaseData.wallet_settings.currency;
  }

  public async getSettings(): Promise<{ autolock: number, remote_node: string, currency: string }> {
    return new Promise(async (resolve) => {
      const databaseData = this.readDatabase();
      resolve(databaseData.wallet_settings);
    });
  }

  public async updateSettings(settings: { autolock: number, remote_node: string, currency: string }): Promise<string> {
    return new Promise(async (resolve) => {
      const databaseData = this.readDatabase();
      databaseData.wallet_settings = settings;
      const returnString = this.writeDatabase(databaseData);
      resolve(returnString);
    });
  }

}
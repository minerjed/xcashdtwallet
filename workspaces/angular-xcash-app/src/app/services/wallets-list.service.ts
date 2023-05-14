import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WalletList } from '../models/wallet-list.model';
import { Wallet } from '../models/wallet.model';

@Injectable({
  providedIn: 'root'
})
export class WalletsListService {

  private walletList: WalletList | any;
  private walletList$: BehaviorSubject<Wallet[]> | any;

  constructor() { }

  async loadWallets(json_data: string) {
    const DATABASE_DATA: any = JSON.parse(json_data);
    let Wallet: Wallet[] = [];
    let count = 0;
    DATABASE_DATA.wallet_data.forEach((item: any) => {
      Wallet.push({
        id: count,
        name: item.wallet_name,
        publicKey: item.public_address,
        balance: item.balance,
      });
      count++;
    });
    try {
      this.walletList = new WalletList(Wallet);
      this.walletList$ = new BehaviorSubject<Wallet[]>(this.walletList.getList());
    }
    catch (error) { }
  }

  private update() {
    this.walletList$.next(this.walletList.getList());
  }

  /**
   * Get the wallet list.
   * @return a `BehaviorSubject<Wallet[]>` of the wallet list
   */
  public getWalletList(): BehaviorSubject<Wallet[]> {
    return this.walletList$;
  }

  /**
   * Add a wallet to the list. Don't use this method outside of WalletService.
   * @param name label of the wallet to add 
   * @param publicKey public address of the wallet to add
   * @param balance balance of the wallet to add
   */
  public addWallet(name: string, publicKey: string, balance: number): void {
    this.walletList.addWallet(name, publicKey, balance);
    this.update();
  }

  /**
   * Remove a wallet from the list. Don't use this method outisde of WalletService.
   * @param walletId id of the wallet to remove
   */
  public removeWallet(walletId: number): void {
    this.walletList.removeElement(walletId);
    this.update();
  }

  /**
   * Rename a wallet in the list. Don't use this method outside of WalletService.
   * @param walletId id of the wallet to rename
   * @param newName new name of the wallet to rename
   */
  public renameWallet(walletId: number, newName: string): void {
    this.walletList.renameWallet(walletId, newName);
    this.update();
  }

}
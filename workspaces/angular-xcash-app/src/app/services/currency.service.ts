import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
//  tocurrency: string = '';

  tocurrencyChanged = new EventEmitter<string>();
  private _tocurrency: string = '';

  get tocurrency(): string {
    return this._tocurrency;
  }
  
  set tocurrency(newCurrency: string) {
    this._tocurrency = newCurrency;
    this.tocurrencyChanged.emit(this._tocurrency);
  }

  constructor() { }

}
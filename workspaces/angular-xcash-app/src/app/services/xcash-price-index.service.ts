import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { CurrencyService } from './currency.service';

@Injectable({
  providedIn: 'root'
})
export class XcashPriceIndexService {

  constructor(private http: HttpClient,
    public currencyService: CurrencyService) { }

  reqOptions = {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
  };

  // For the moment this service is really simple and only uses coingecko API
  /**
   * Get the XCASH price index in USD via CoinGecko
   * @return an `Observable` every 10 min
   */
  getPrice(): Observable<object> {
    const reqUrl: string = `https://api.coingecko.com/api/v3/simple/price?ids=x-cash&vs_currencies=${this.currencyService.tocurrency.toLowerCase()}&include_last_updated_at=true`;
    return timer(0, 10 * 60 * 1000).pipe(
      mergeMap(() => {
        return this.http.get(reqUrl, this.reqOptions)
      })
    );
  }

}
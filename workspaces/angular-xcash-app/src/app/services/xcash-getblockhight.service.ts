import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class XcashGetblockhightService {
  
  constructor(private http: HttpClient) { }
  
  async getDelegates(): Promise<any> {
    const url = 'https://api.xcash.live/v1/xcash/blockchain/unauthorized/blocks';
    try {
      const response = this.http.get(url, { responseType: 'json' });
      return firstValueFrom(response.pipe(
        catchError(error => {
          return 'error';
        })
      ));
    } catch (error) {
      return 'error';
    }
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class XcashDelegatesService {
  
  constructor(private http: HttpClient) { }
  
  async getDelegates(): Promise<any> {
    const url = 'http://delegates.xcash.foundation/getdelegates';
    try {
      const response = this.http.get(url, { responseType: 'json' });
      return firstValueFrom(response.pipe(
        catchError(error => {
          return 'error';
        })
      ));
    } catch (error) {
      return [{ id: 0, name: "", fee: "", vote_count: 0, online_percentage: "", vtotal_rounds: "", total_rounds: "" }];
    }
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { getNBPApiUrl } from "../../helpers/getNBPApiUrl";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NbpService {
  constructor(private http: HttpClient, private router: Router) { }

  fetchRates(curr: string, start: string, end: string): Observable<any> {
    const url = `${getNBPApiUrl(curr)}/${start}/${end}/?format=json`;
    return this.http.get<any>(url);
  }

  async syncRates(currency: string, url?: string) {
    let currentDate = new Date(), startDate = new Date();
    startDate.setFullYear(currentDate.getFullYear() - 1);
    let { start, end } = {
      start: startDate.toISOString().split('T')[0],
      end: currentDate.toISOString().split('T')[0]
    };

    this.fetchRates(currency, start, end).subscribe(async data => {
      const code = data.code;

      const rates = data.rates.map((rate: any) => ({
        currency: code,
        effective_date: rate.effectiveDate,
        rate: rate.mid
      }));

      this.addToDB(rates).subscribe((response) => {
        //return firstValueFrom(response);

        if (url) {
          this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true })
            .then(() => {
              this.router.navigate([url]);
            });
        }
      });
    });
  }

  getRates(type: string): Observable<any> {
    const url = `http://localhost:8000/data/`;
    const params = new HttpParams().set('currency_type', type);
    return this.http.get<any>(url, { params });
  }

  addToDB(data: any[]): Observable<any> {
    const url = `http://localhost:8000/data/`;
    return this.http.post<any>(url, data);
  }
}

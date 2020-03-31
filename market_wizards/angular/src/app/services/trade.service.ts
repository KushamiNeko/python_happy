import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
//import { catchError } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class TradeService {
  constructor(private _http: HttpClient) {}

  private _requestUrl(): string {
    const origin = "http://127.0.0.1:5000";
    let url = `${origin}/service/trade`;

    const now = new Date();

    url = `${url}?timestemp=${Math.round(now.getTime() / 1000)}`;
    return url;
  }

  newRecord(transaction: object): Observable<string> {
    const headers = new HttpHeaders().set("Content-Type", "application/json");

    return this._http.post(this._requestUrl(), transaction, {
      headers,
      responseType: "text"
    });
    //.subscribe(
    //data => console.log(data),
    ////err => console.log(err)
    //);
  }
}

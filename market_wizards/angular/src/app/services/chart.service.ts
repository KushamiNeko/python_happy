import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class ChartService {
  image = new BehaviorSubject<string>("");
  quote = new BehaviorSubject<object>({});
  inputs = new BehaviorSubject<object>({});

  isWorking = new BehaviorSubject<boolean>(false);

  private _date: string;

  private _symbol = "es";
  private _freq = "d";
  private _func = "slice";
  private _book = "";
  private _records = false;

  private _url = "";
  private _isWorking = false;

  private _parameters = {};

  constructor(private _http: HttpClient) {
    const now = new Date();

    this._date = `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

    this._book = this._date;

    console.log("chart service");

    this._getImage();
  }

  private _requestUrl(): string {
    const origin = "http://127.0.0.1:5000";
    let url = `${origin}/service/chart`;
    //const origin = "http://localhost:8080";
    //let url = `${origin}/service/plot/practice`;

    const now = new Date();

    url = `${url}?timestemp=${Math.round(now.getTime() / 1000)}`;
    url = `${url}&symbol=${this._symbol}&frequency=${this._freq}&function=${this._func}&date=${this._date}`;
    url = `${url}&book=${this._book}&records=${this._records.toString()}`;

    for (const [key, value] of Object.entries(this._parameters)) {
      url = `${url}&params_${key}=${value}`;
    }

    return url;
  }

  private _getImage(): void {
    if (this._isWorking) {
      return;
    }

    this._startWorking();

    const url = this._requestUrl();
    this._url = url;

    const headers = new HttpHeaders().set(
      "Content-Type",
      "text/plain; charset=utf-8"
    );

    this._http
      .get(url, { headers, responseType: "text" })
      .subscribe((data: string) => {
        const src = `data:image/png;base64,${data}`;
        this.image.next(src);

        const qurl = this._url.replace(/function=[^&]+/, "function=quote");

        this._http.get(qurl).subscribe((data: object) => {
          this.quote.next(data);
          this._date = data["date"];

          this.inputs.next({
            symbol: this._symbol,
            date: this._date,
            freq: this._freq,
            book: this._book,
          });

          this._completed();
        });
      });
  }

  private _startWorking(): void {
    this._isWorking = true;
    this.isWorking.next(this._isWorking);
  }

  private _completed(): void {
    this._isWorking = false;
    this.isWorking.next(this._isWorking);
  }

  refresh(): void {
    this._getImage();
  }

  forward(): void {
    this._func = "forward";
    this._getImage();
  }

  backward(): void {
    this._func = "backward";
    this._getImage();
  }

  symbolRequest(symbol: string): void {
    this._func = "slice";
    this._symbol = symbol.toLowerCase();
    this._getImage();
  }

  freqRequest(freq: string): void {
    this._func = "simple";
    this._freq = freq;
    this._getImage();
  }

  inputsRequest(
    date: string,
    symbol: string,
    freq: string,
    book: string = ""
  ): void {
    this._func = "slice";
    this._symbol = symbol.toLowerCase();
    this._date = date;
    this._freq = freq;
    this._book = book;

    this._getImage();
  }

  recordsRequest(show: boolean): void {
    this._func = "simple";
    this._records = show;
    this._getImage();
  }

  randomDateRequest(): void {
    this._func = "randomDate";
    this._getImage();
  }

  parametersRequest(params: object): void {
    this._parameters = params;
    this._getImage();
  }

  async inspectRequest(
    x: number,
    y: number,
    ax: number | null = null,
    ay: number | null = null
  ): Promise<string> {
    let url = this._url.replace(/function=[^&]+/, "function=inspect");
    url = `${url}&x=${x}&y=${y}`;

    if (ax != null && ax != null) {
      url = `${url}&ax=${ax}&ay=${ay}`;
    }

    const headers = new HttpHeaders().set(
      "Content-Type",
      "text/plain; charset=utf-8"
    );

    if (!this._isWorking) {
      return this._http.get(url, { headers, responseType: "text" }).toPromise();
    } else {
      return "";
    }
  }
}

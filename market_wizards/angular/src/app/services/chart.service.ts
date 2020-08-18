import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class ChartService {
  image = new BehaviorSubject<string>("");
  quote = new BehaviorSubject<object>({});
  inputs = new BehaviorSubject<object>({});

  isWorking = new BehaviorSubject<boolean>(false);

  private _date: string;

  private _symbol = "spx";
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
  }

  private _requestUrl(): string {
    const origin = "http://127.0.0.1:5000";
    let url = `${origin}/service/chart`;

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

    this._http.get(url).subscribe(
      (data: object) => {
        if (Object.keys(data).includes("error")) {
          // console.error(`${data["error"]}`);
          alert(`${data["error"]}`);
          this._completed();
          return;
        }

        const src = `data:image/png;base64,${data["img"]}`;
        this.image.next(src);
        this.quote.next(data);
        this._date = data["date"];

        this.inputs.next({
          symbol: this._symbol,
          date: this._date,
          freq: this._freq,
          book: this._book,
        });

        this._completed();
      },
      (error: HttpErrorResponse) =>
        // console.error(`${error.status}: ${error.error}`)
        alert(`${error.status}: ${error.error}`)
    );
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
    this._func = "simple";
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
    this._func = "slice";
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

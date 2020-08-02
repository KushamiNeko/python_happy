import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TradeService {
  isWorking = new BehaviorSubject<boolean>(false);
  stopOrders = new BehaviorSubject<Array<object>>([]);

  books = new BehaviorSubject<Array<string>>([]);
  statistic = new BehaviorSubject<object>({});

  private _isWorking = false;

  constructor(private _http: HttpClient) {}

  private _requestUrl(gate: string): string {
    const origin = "http://127.0.0.1:5000";
    let url = `${origin}/service/trade/${gate}`;

    const now = new Date();

    url = `${url}?timestemp=${Math.round(now.getTime() / 1000)}`;
    return url;
  }

  newMarketOrder(order: object): void {
    if (this._isWorking) {
      return;
    }

    this._isWorking = true;

    const headers = new HttpHeaders().set("Content-Type", "application/json");

    this._http
      .post(`${this._requestUrl("order")}&order=market`, order, {
        headers,
        //responseType: "text"
      })
      .subscribe(() => {
        this._isWorking = false;
        this.isWorking.next(this._isWorking);
      });
  }

  newStopOrder(order: object): void {
    if (this._isWorking) {
      return;
    }

    this._isWorking = true;

    const headers = new HttpHeaders().set("Content-Type", "application/json");

    this._http
      .post(`${this._requestUrl("order")}&order=stop`, order, {
        headers,
        //responseType: "text"
      })
      .subscribe((data) => {
        this.stopOrders.next(data["data"]);
        this._isWorking = false;
        this.isWorking.next(this._isWorking);
      });
  }

  deleteStopOrder(index: number): void {
    if (this._isWorking) {
      return;
    }

    this._isWorking = true;

    this._http
      .delete(`${this._requestUrl("order")}&index=${index}`)
      .subscribe((data) => {
        this.stopOrders.next(data["data"]);
        this._isWorking = false;
        this.isWorking.next(this._isWorking);
      });
  }

  readStopOrders(): void {
    if (this._isWorking) {
      return;
    }

    this._isWorking = true;

    this._http
      .get(`${this._requestUrl("order")}&order=stop`)
      .subscribe((data) => {
        this.stopOrders.next(data["data"]);
        this._isWorking = false;
        this.isWorking.next(this._isWorking);
      });
  }

  refreshStopOrders(): void {
    if (this._isWorking) {
      return;
    }

    this._http
      .get(`${this._requestUrl("order")}&order=stop`)
      .subscribe((data) => {
        this.stopOrders.next(data["data"]);
      });
  }

  findAllBooks(): void {
    if (this._isWorking) {
      return;
    }

    this._isWorking = true;

    this._http
      .get(`${this._requestUrl("statistic")}&function=books`)
      .subscribe((data) => {
        this.books.next(data["data"]);
        this._isWorking = false;
        this.isWorking.next(this._isWorking);
      });
  }

  readStatistic(titles: Array<string> | null): void {
    if (titles == null) {
      this.statistic.next({});
      return;
    }

    if (this._isWorking) {
      return;
    }

    this._isWorking = true;

    this._http
      .get(
        `${this._requestUrl(
          "statistic"
        )}&function=statistic&titles=${titles.join(",")}`
      )
      .subscribe((data) => {
        this.statistic.next(data);
        this._isWorking = false;
        this.isWorking.next(this._isWorking);
      });
  }

  readAllStatistic(): void {}
}

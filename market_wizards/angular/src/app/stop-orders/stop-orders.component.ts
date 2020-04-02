import { Component, OnInit, OnDestroy } from "@angular/core";
import { TradeService } from "../services/trade.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-stop-orders",
  templateUrl: "./stop-orders.component.html",
  styleUrls: ["./stop-orders.component.scss"]
})
export class StopOrdersComponent implements OnInit, OnDestroy {
  private _$orders: Subscription;
  orders = [];

  constructor(private _tradeService: TradeService) {}

  ngOnInit(): void {
    this._$orders = this._tradeService.stopOrders.subscribe(orders => {
      this.orders = orders;
    });
  }

  ngOnDestroy(): void {
    this._$orders.unsubscribe();
  }

  deleteOrder(id: number): void {
    this._tradeService.deleteStopOrder(id);
  }
}

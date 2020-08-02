import { Component, OnInit, OnDestroy } from "@angular/core";
import { TradeService } from "../services/trade.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-statistic",
  templateUrl: "./statistic.component.html",
  styleUrls: ["./statistic.component.scss"],
})
export class StatisticComponent implements OnInit, OnDestroy {
  private _$statistic: Subscription;

  statistic: object = {};

  constructor(private _tradeService: TradeService) {}

  ngOnInit(): void {
    this._$statistic = this._tradeService.statistic.subscribe((data) => {
      this.statistic = data;
    });
  }

  ngOnDestroy(): void {
    this._$statistic.unsubscribe();
  }
}

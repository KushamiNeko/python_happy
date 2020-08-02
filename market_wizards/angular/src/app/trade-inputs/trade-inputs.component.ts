import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  OnInit,
  ViewChild,
  Input,
  OnDestroy,
  OnChanges,
} from "@angular/core";
import { ChartService } from "../services/chart.service";
import { TradeService } from "../services/trade.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-trade-inputs",
  templateUrl: "./trade-inputs.component.html",
  styleUrls: ["./trade-inputs.component.scss"],
})
export class TradeInputsComponent implements OnInit, OnDestroy, OnChanges {
  private _$inputs: Subscription;
  private _$quote: Subscription;
  private _$isWorking: Subscription;

  @Input()
  isOpen: boolean = false;

  @Output()
  completed: EventEmitter<void> = new EventEmitter();

  @ViewChild("leverage")
  leverageRef: ElementRef;

  stopOrder = false;

  inputs: object = {
    book: "",
    datetime: "",
    symbol: "",
    price: "",
    leverage: "1",
    operation: "+",
  };

  errors = {
    book: false,
    datetime: false,
    symbol: false,
    price: false,
    leverage: false,
  };

  isWorking = false;

  constructor(
    private _chartService: ChartService,
    private _tradeService: TradeService
  ) {
    console.log("trade inputs construct");
  }

  ngOnInit(): void {
    console.log("trade inputs init");
    this._$inputs = this._chartService.inputs.subscribe((inputs) => {
      this.inputs["symbol"] = inputs["symbol"];
      this.inputs["datetime"] = inputs["date"];
      this.inputs["book"] = inputs["book"];

      this.dateChange();
      this.symbolChange();
      this.bookChange();
    });

    this._$quote = this._chartService.quote.subscribe((quote) => {
      this.inputs["price"] = quote["close"]?.toFixed(2);
    });

    this._$isWorking = this._tradeService.isWorking.subscribe((done) => {
      this._chartService.refresh();
      this.completed.emit();
      this.isWorking = done;
    });

    this._tradeService.readStopOrders();
  }

  ngOnDestroy(): void {
    this._$inputs.unsubscribe();
    this._$quote.unsubscribe();
    this._$isWorking.unsubscribe();
  }

  ngOnChanges(): void {
    console.log("trade inputs open");

    this._tradeService.refreshStopOrders();
    this.leverageRef?.nativeElement.focus();
  }

  bookChange(): void {
    const regex = RegExp("^[a-zA-Z0-9]+$");
    if (!regex.test(this.inputs["book"])) {
      this.errors["book"] = true;
    } else {
      this.errors["book"] = false;
    }
  }

  dateChange(): void {
    const regex = RegExp("^[0-9]{8}$");
    if (!regex.test(this.inputs["datetime"])) {
      this.errors["datetime"] = true;
    } else {
      this.errors["datetime"] = false;
    }
  }

  symbolChange(): void {
    const regex = RegExp("^[a-zA-Z0-9]+$");
    if (!regex.test(this.inputs["symbol"])) {
      this.errors["symbol"] = true;
    } else {
      this.errors["symbol"] = false;
    }
  }

  priceChange(): void {
    const regex = RegExp("^[0-9.]+$");
    if (!regex.test(this.inputs["price"])) {
      this.errors["price"] = true;
    } else {
      this.errors["price"] = false;
    }
  }

  leverageChange(): void {
    const regex = RegExp("^[0-9]+$");
    if (!regex.test(this.inputs["leverage"])) {
      this.errors["leverage"] = true;
    } else {
      this.errors["leverage"] = false;
    }
  }

  newOrder(): void {
    if (this.isWorking) {
      return;
    }

    this.isWorking = true;

    if (this.stopOrder) {
      this._tradeService.newStopOrder(this.inputs);
    } else {
      this._tradeService.newMarketOrder(this.inputs);
    }
  }
}

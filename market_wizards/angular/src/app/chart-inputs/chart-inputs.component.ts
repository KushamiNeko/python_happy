import { Component, HostListener, OnInit, OnDestroy } from "@angular/core";
import { ChartService } from "../services/chart.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-chart-inputs",
  templateUrl: "./chart-inputs.component.html",
  styleUrls: ["./chart-inputs.component.scss"],
})
export class ChartInputsComponent implements OnInit, OnDestroy {
  symbols = [
    "ES",
    "VIX",
    "NQ",
    "VXN",
    "QR",
    "RVX",
    "VLE",
    "SML",
    "ZN",
    //"TYVIX",
    "FX",
    "VSTX",
    "NP",
    //"NO",
    //"NL",
    "JNIV",
    "SPX",
    "NDX",
    "NIKK",
    "EZU",
    "EEM",
    "HSI",
    "FXI",
    "HYG",
    //"SHYG",
    "EMB",
    "IYR",
    //"REET",
    "REM",
    //"GSY",
    "NEAR",
    //"ICSH",
    "SHV",
    "LQD",
    //"IEF",
    "CL",
    //"OVX",
    "GC",
    //"GVZ",
    "DX",
    "E6",
    "J6",
  ];

  selectedSymbolID = 0;
  newSymbol = "";
  showRecords = false;

  errors = {
    newSymbol: false,
    date: false,
    freq: false,
    book: false,
  };

  isFocused = {
    newSymbol: false,
    inputs: false,
  };

  inputs = {
    date: "",
    freq: "",
    book: "",
  };

  openTrade = false;

  private _isWorking = false;

  private _key = "";

  private _$inputs: Subscription;
  private _$isWorking: Subscription;

  constructor(private _chartService: ChartService) {
    console.log("chart inputs construct");
  }

  ngOnInit(): void {
    console.log("chart inputs init");
    this._$inputs = this._chartService.inputs.subscribe((inputs) => {
      this.inputs["date"] = inputs["date"];
      this.inputs["freq"] = inputs["freq"];
      this.inputs["book"] = inputs["book"];

      this.dateChange();
      this.freqChange();
      this.bookChange();
    });

    this._$isWorking = this._chartService.isWorking.subscribe((isWorking) => {
      this._isWorking = isWorking;
    });
  }

  ngOnDestroy(): void {
    this._$inputs.unsubscribe();
    this._$isWorking.unsubscribe();
  }

  newSymbolChange(): void {
    const regex = RegExp("^[a-zA-Z0-9]*$");
    if (!regex.test(this.newSymbol)) {
      this.errors["newSymbol"] = true;
    } else {
      if (this.symbols.includes(this.newSymbol.toUpperCase())) {
        this.errors["newSymbol"] = true;
      } else {
        this.errors["newSymbol"] = false;
      }
    }
  }

  dateChange(): void {
    const regex = RegExp("^(?:[0-9]{4}|[0-9]{8})$");
    if (!regex.test(this.inputs["date"])) {
      this.errors["date"] = true;
    } else {
      this.errors["date"] = false;
    }
  }

  freqChange(): void {
    const regex = RegExp("^[dwm]{1}$");
    if (!regex.test(this.inputs["freq"])) {
      this.errors["freq"] = true;
    } else {
      this.errors["freq"] = false;
    }
  }

  bookChange(): void {
    const regex = RegExp("^[a-zA-Z0-9]*$");
    if (!regex.test(this.inputs["book"])) {
      this.errors["book"] = true;
    } else {
      this.errors["book"] = false;
    }
  }

  clickShowRecords(): void {
    if (this._isWorking) {
      return;
    }

    this.showRecords = !this.showRecords;
    this._chartService.recordsRequest(this.showRecords);
  }

  clickRandomDate(): void {
    if (this._isWorking) {
      return;
    }

    this._chartService.randomDateRequest();
  }

  setSymbolID(id: number): void {
    if (id >= this.symbols.length) {
      return;
    }

    this.selectedSymbolID = id;
    this._chartService.symbolRequest(this.symbols[id]);
  }

  @HostListener("window:keydown", ["$event"])
  handleKeyDown(event: KeyboardEvent): void {
    if (this._isWorking) {
      return;
    }

    if (this.openTrade && event.which != 13 && event.which != 32) {
      return;
    }

    if (
      (this.isFocused["newSymbol"] || this.isFocused["inputs"]) &&
      event.which != 13
    ) {
      return;
    }

    let id: number;
    switch (event.which) {
      case 13:
        if (this.openTrade) {
        } else if (this.isFocused["newSymbol"]) {
          if (!this.errors["newSymbol"]) {
            this.symbols.push(this.newSymbol.toUpperCase());
            this.newSymbol = "";
          }
        } else if (this.isFocused["inputs"]) {
          if (
            !this.errors["date"] &&
            !this.errors["freq"] &&
            !this.errors["book"]
          ) {
            if (this.inputs["date"].length == 4) {
              this.inputs["date"] += "1231";
            }

            this._chartService.inputsRequest(
              this.inputs["date"],
              this.symbols[this.selectedSymbolID],
              this.inputs["freq"],
              this.inputs["book"]
            );
          }
        }
        break;
      case 38:
        id = this.selectedSymbolID - 1;
        if (id < 0) {
          id = this.symbols.length - 1;
        }

        this.setSymbolID(id);
        break;
      case 40:
        id = this.selectedSymbolID + 1;
        if (id > this.symbols.length - 1) {
          id = 0;
        }

        this.setSymbolID(id);
        break;
      case 37:
        if (event.shiftKey || event.ctrlKey) {
          if (event.shiftKey) {
            this.inputs["date"] = `${
              parseInt(this.inputs["date"].substring(0, 4)) - 1
            }${this.inputs["date"].substring(4)}`;
          } else if (event.ctrlKey) {
            this.inputs["date"] = `${
              parseInt(this.inputs["date"].substring(0, 4)) - 1
            }1231`;
          }

          this._chartService.inputsRequest(
            this.inputs["date"],
            this.symbols[this.selectedSymbolID],
            this.inputs["freq"],
            this.inputs["book"]
          );
        } else {
          this._chartService.backward();
        }
        break;
      case 39:
        if (event.shiftKey || event.ctrlKey) {
          if (event.shiftKey) {
            this.inputs["date"] = `${
              parseInt(this.inputs["date"].substring(0, 4)) + 1
            }${this.inputs["date"].substring(4)}`;
          } else if (event.ctrlKey) {
            this.inputs["date"] = `${parseInt(
              this.inputs["date"].substring(0, 4)
            )}1231`;
          }

          const now = new Date();

          const date = `${now.getFullYear()}${(now.getMonth() + 1)
            .toString()
            .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

          if (parseInt(this.inputs["date"]) > parseInt(date)) {
            this.inputs["date"] = date;
          }

          this._chartService.inputsRequest(
            this.inputs["date"],
            this.symbols[this.selectedSymbolID],
            this.inputs["freq"],
            this.inputs["book"]
          );
        } else {
          this._chartService.forward();
        }
        break;
      case 72:
        // h
        break;
      case 68:
        // d
        this._chartService.freqRequest("d");
        break;
      case 87:
        // w
        this._chartService.freqRequest("w");
        break;
      case 77:
        // m
        this._chartService.freqRequest("m");
        break;
      case 32:
        // space
        this.openTrade = !this.openTrade;
        event.stopPropagation();
        event.preventDefault();
        break;
      default:
        if (event.which >= 48 && event.which <= 57) {
          //// number keys 48: 0, 49-57 : 1-9
          this._key += (event.which - 48).toString();
          setTimeout(() => {
            if (this._key != "") {
              this.setSymbolID(parseInt(this._key) - 1);
            }
            this._key = "";
          }, 250);
          break;
        }
    }
  }
}

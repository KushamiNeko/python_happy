import { Component, HostListener, OnInit, OnDestroy } from "@angular/core";
import { ChartService } from "../services/chart.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-chart-inputs",
  templateUrl: "./chart-inputs.component.html",
  styleUrls: ["./chart-inputs.component.scss"]
})
export class ChartInputsComponent implements OnInit {
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
    "JNIV",
    "HYG",
    "EMB",
    "GSY",
    "NEAR",
    "ICSH",
    "SHV",
    "LQD",
    "IEF",
    "CL",
    //"OVX",
    "GC",
    //"GVZ",
    "DX",
    "E6",
    "J6"
  ];

  selectedSymbolID = 0;
  newSymbol = "";
  showRecords = false;

  errors = {
    newSymbol: false,
    date: false,
    freq: false,
    book: false
  };

  isFocused = {
    newSymbol: false,
    inputs: false
  };

  inputs = {
    date: "",
    freq: "",
    book: ""
  };

  private _isWorking = false;

  private _key = "";

  private _$inputs: Subscription;
  private _$isWorking: Subscription;

  constructor(private _chartService: ChartService) {
    console.log("chart inputs construct");
  }

  ngOnInit(): void {
    console.log("chart inputs init");
    this._$inputs = this._chartService.inputs.subscribe(inputs => {
      this.inputs["date"] = inputs["date"];
      this.inputs["freq"] = inputs["freq"];
      this.inputs["book"] = inputs["book"];
    });

    this._$isWorking = this._chartService.isWorking.subscribe(isWorking => {
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
    const regex = RegExp("^[0-9]{8}$");
    if (!regex.test(this.inputs["date"])) {
      this.errors["date"] = true;
    } else {
      this.errors["date"] = false;
    }
  }

  freqChange(): void {
    const regex = RegExp("^[dw]{1}$");
    if (!regex.test(this.inputs["freq"])) {
      this.errors["freq"] = true;
    } else {
      this.errors["freq"] = false;
    }
  }

  bookChange(): void {
    const regex = RegExp("^[a-zA-Z0-9]+$");
    if (!regex.test(this.inputs["book"])) {
      this.errors["book"] = true;
    } else {
      this.errors["book"] = false;
    }
  }

  setSymbolID(id: number): void {
    this.selectedSymbolID = id;
    this._chartService.symbolRequest(this.symbols[id]);
  }

  @HostListener("window:keydown", ["$event"])
  handleKeyDown(event: KeyboardEvent): void {
    if (this._isWorking) {
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
        if (this.isFocused["newSymbol"]) {
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

        //this.selectedSymbolID = id;
        //this._chartService.symbolRequest(this.symbols[id]);
        this.setSymbolID(id);
        break;
      case 40:
        id = this.selectedSymbolID + 1;
        if (id > this.symbols.length - 1) {
          id = 0;
        }

        //this.selectedSymbolID = id;
        //this._chartService.symbolRequest(this.symbols[id]);
        this.setSymbolID(id);
        break;
      case 37:
        this._chartService.backward();
        break;
      case 39:
        this._chartService.forward();
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
        break;
      case 32:
        // space
        //if (_modal.isOpen) {
        //_modal.close();
        //} else {
        //_modal.open();
        //}
        break;
      default:
        if (event.which >= 48 && event.which <= 57) {
          //// number keys 48: 0, 49-57 : 1-9
          this._key += (event.which - 48).toString();
          setTimeout(() => {
            if (this._key != "") {
              this.setSymbolID(parseInt(this._key) - 1);
              //this.selectedSymbolID = parseInt(this._key) - 1;
              //this._chartService.symbolRequest(
              //this.symbols[this.selectedSymbolID]
              //);
            }
            this._key = "";
          }, 200);
          break;
        }
    }
  }
}

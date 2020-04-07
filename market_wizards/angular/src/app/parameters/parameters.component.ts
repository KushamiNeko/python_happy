import { Component, OnInit, OnDestroy } from "@angular/core";

import { ChartService } from "../services/chart.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-parameters",
  templateUrl: "./parameters.component.html",
  styleUrls: ["./parameters.component.scss"],
})
export class ParametersComponent implements OnInit, OnDestroy {
  private _$inputs: Subscription;

  symbol = "";

  params: object = {
    vixzone: "",
    vixop: "long",
  };

  errors = {
    vixzone: false,
  };

  isWorking = false;

  constructor(private _chartService: ChartService) {
    console.log("parameters construct");
  }

  ngOnInit(): void {
    console.log("parameters init");
    this._$inputs = this._chartService.inputs.subscribe((inputs) => {
      this.symbol = inputs["symbol"];
    });
  }

  ngOnDestroy(): void {
    this._$inputs.unsubscribe();
  }

  datetimeChange(param: string): void {
    const regex = RegExp("^(?:[0-9]{8})*$");
    if (!regex.test(this.params[param])) {
      this.errors[param] = true;
    } else {
      this.errors[param] = false;
    }
  }

  vixzoneTrigger(): boolean {
    let symbols = ["vix", "vxn", "rvx", "vstx", "jniv"];

    return symbols.includes(this.symbol);
  }

  setParameters(): void {
    this._chartService.parametersRequest(this.params);
  }
}

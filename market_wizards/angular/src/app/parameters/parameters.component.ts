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
  private _$isWorking: Subscription;

  private _isWorking: boolean = false;

  symbol = "";

  /////  Preset Control /////

  presets: object = {
    KushamiNeko: [
      "Bollinger Bands",
      "Moving Averages",
      "Vix Zone",
      "Entry Zone",
      "Volatility Summary",
      "Distribution Days",
    ],
    // Magical: [3, 5, 7, 10, 20, 30, 60, 100, 300],
    Magical: [3, 5, 7, 10, 20, 30, 60, 100, 300].map((n) => {
      return `SMA ${n}`;
    }),
  };

  selectedPreset: string = Object.keys(this.presets)[0];

  activatedSettings: object = {
    KushamiNeko: [
      "Bollinger Bands",
      "Moving Averages",
      "Vix Zone",
      "Entry Zone",
    ],
    // Magical: [5, 20, 60, 100, 300],
    Magical: [
      ...this.presets["Magical"].filter((s) => {
        const init = [5, 20, 60, 100, 300];

        for (let i = 0; i < init.length; i++) {
          const regex = RegExp(`^.*\s*${init[i]}\s*.*$`);
          if (regex.test(s)) {
            return true;
          }
        }
      }),
    ],
  };

  /////  Preset Control /////

  params: object = {
    Preset: this.selectedPreset,
    VixReferenceDate: "",
    VixOp: "long",
    EntryNoticeDate: "",
    EntryPrepareDate: "",
    EntryOp: "long",
    // settings: this.activatedSettings[this.selectedPreset]
    //   .map((s) => {
    //     return s.replace(" ", "");
    //   })
    //   .join(","),
  };

  errors = {
    VixReferenceDate: false,
  };

  isWorking = false;

  constructor(private _chartService: ChartService) {
    console.log("parameters construct");
    this.generateSettingParams();
    this._chartService.parametersRequest(this.params);
  }

  ngOnInit(): void {
    console.log("parameters init");
    this._$inputs = this._chartService.inputs.subscribe((inputs) => {
      this.symbol = inputs["symbol"];
    });

    this._$isWorking = this._chartService.isWorking.subscribe((isWorking) => {
      this._isWorking = isWorking;
    });
  }

  ngOnDestroy(): void {
    this._$inputs.unsubscribe();
  }

  // themeSetKeys(): Array<string> {
  //   return Object.keys(this.presets);
  // }

  objectKeys(obj: object): Array<string> {
    return Object.keys(obj);
  }

  presetChange(preset: string): void {
    if (this._isWorking) {
      return;
    }

    if (Object.keys(this.presets).includes(preset)) {
      this.selectedPreset = preset;
      this.params["Preset"] = this.selectedPreset;

      this.setParameters();

      // this.generateSettingParams();

      // this.params["settings"] = this.activatedSettings[
      //   this.selectedPreset
      // ]
      //   .map((s) => {
      //     return s.replace(" ", "");
      //   })
      //   .join(",");

      // this._chartService.parametersRequest(this.params);
    }
  }

  activateSetting(setting: any): void {
    if (this._isWorking) {
      return;
    }

    const set = this.activatedSettings[this.selectedPreset];
    if (!set.includes(setting)) {
      set.push(setting);
    } else {
      const index = set.indexOf(setting, 0);
      if (index > -1) {
        set.splice(index, 1);
      }
    }

    this.activatedSettings[this.selectedPreset].sort();

    this.setParameters();
    // this.generateSettingParams();

    // this.params["settings"] = this.activatedSettings[
    //   this.selectedPreset
    // ]
    //   .map((s) => {
    //     return s.replace(" ", "");
    //   })
    //   .join(",");

    // this._chartService.parametersRequest(this.params);
  }

  generateSettingParams(): void {
    for (let i = 0; i < this.presets[this.selectedPreset].length; i++) {
      let key = this.presets[this.selectedPreset][i];
      this.params[key.split(" ").join("")] = this.activatedSettings[
        this.selectedPreset
      ]
        .includes(key)
        .toString();
    }

    console.log(this.params);
  }

  datetimeChange(param: string): void {
    const regex = RegExp("^(?:[0-9]{8})*$");
    if (!regex.test(this.params[param])) {
      this.errors[param] = true;
    } else {
      this.errors[param] = false;
    }
  }

  controlsTrigger(setting: string): boolean {
    switch (setting) {
      case "vixzone":
        let symbols = ["vix", "vxn", "rvx", "vstx", "jniv", "vhsi", "vxfxi"];
        return symbols.includes(this.symbol);
      default:
        return false;
    }
  }

  // vixzoneTrigger(): boolean {
  //   let symbols = ["vix", "vxn", "rvx", "vstx", "jniv", "vhsi", "vxfxi"];
  //   return symbols.includes(this.symbol);
  // }

  setParameters(): void {
    if (this._isWorking) {
      return;
    }

    this.generateSettingParams();
    this._chartService.parametersRequest(this.params);
  }
}

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

  /////  Theme Control /////

  themeSets: object = {
    KushamiNeko: ["Bollinger Bands", "Moving Averages", "Distribution Days"],
    // Magical: [3, 5, 7, 10, 20, 30, 60, 100, 300],
    Magical: [3, 5, 7, 10, 20, 30, 60, 100, 300].map((n) => {
      return `${n}`;
    }),
  };

  selectedThemeSet: string = Object.keys(this.themeSets)[0];

  activatedThemeSetting: object = {
    KushamiNeko: ["Bollinger Bands", "Moving Averages"],
    // Magical: [5, 20, 60, 100, 300],
    Magical: [
      ...this.themeSets["Magical"].filter((s) => {
        const init = [5, 20, 60, 100, 300];

        for (let i = 0; i < init.length; i++) {
          const regex = RegExp(`^${init[i]}\s*.*$`);
          if (regex.test(s)) {
            return true;
          }
        }
      }),
    ],
  };

  /////  Theme Control /////

  params: object = {
    vixzone: "",
    vixop: "long",
    themeSet: this.selectedThemeSet,
    themeSetting: this.activatedThemeSetting[this.selectedThemeSet]
      .map((s) => {
        return s.replace(" ", "");
      })
      .join(","),
  };

  errors = {
    vixzone: false,
  };

  isWorking = false;

  constructor(private _chartService: ChartService) {
    console.log("parameters construct");
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

  themeSetKeys(): Array<string> {
    return Object.keys(this.themeSets);
  }

  themeSetChange(set: string): void {
    if (this._isWorking) {
      return;
    }
    
    if (Object.keys(this.themeSets).includes(set)) {
      this.selectedThemeSet = set;
      this.params["themeSet"] = this.selectedThemeSet;
      this.params["themeSetting"] = this.activatedThemeSetting[
        this.selectedThemeSet
      ]
        .map((s) => {
          return s.replace(" ", "");
        })
        .join(",");

      this._chartService.parametersRequest(this.params);
    }
  }

  activateThemeSetting(setting: any): void {
    if (this._isWorking) {
      return;
    }

    const set = this.activatedThemeSetting[this.selectedThemeSet];
    if (!set.includes(setting)) {
      set.push(setting);
    } else {
      const index = set.indexOf(setting, 0);
      if (index > -1) {
        set.splice(index, 1);
      }
    }

    this.activatedThemeSetting[this.selectedThemeSet].sort();

    this.params["themeSetting"] = this.activatedThemeSetting[
      this.selectedThemeSet
    ]
      .map((s) => {
        return s.replace(" ", "");
      })
      .join(",");

    this._chartService.parametersRequest(this.params);
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
    if (this._isWorking) {
      return;
    }

    this._chartService.parametersRequest(this.params);
  }
}

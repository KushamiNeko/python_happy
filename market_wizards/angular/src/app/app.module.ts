import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { CanvasComponent } from "./canvas/canvas.component";
import { ModalComponent } from "./modal/modal.component";
import { ChartInputsComponent } from "./chart-inputs/chart-inputs.component";
import { PracticeViewComponent } from "./practice-view/practice-view.component";
import { TradeInputsComponent } from './trade-inputs/trade-inputs.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    CanvasComponent,
    ModalComponent,
    ChartInputsComponent,
    PracticeViewComponent,
    TradeInputsComponent
  ],
  imports: [BrowserModule, HttpClientModule, FormsModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

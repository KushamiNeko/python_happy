import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { PracticeViewComponent } from "./practice-view/practice-view.component";
import { StatisticViewComponent } from "./statistic-view/statistic-view.component";

const routes: Routes = [
  { path: "", redirectTo: "/practice", pathMatch: "full" },
  { path: "practice", component: PracticeViewComponent },
  { path: "statistic", component: StatisticViewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

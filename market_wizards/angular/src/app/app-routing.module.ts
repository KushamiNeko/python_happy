import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { PracticeViewComponent } from "./practice-view/practice-view.component";

const routes: Routes = [{ path: "", component: PracticeViewComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-modal",
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.scss"]
})
export class ModalComponent implements OnInit {
  @Input()
  isOpen: boolean = false;

  constructor() {
    console.log("modal construct");
  }

  ngOnInit(): void {
    console.log("modal init");
  }
}

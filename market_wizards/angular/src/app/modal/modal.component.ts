import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-modal",
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.scss"],
})
export class ModalComponent implements OnInit {
  @Input()
  isOpen: boolean = false;

  @Output()
  completed: EventEmitter<void> = new EventEmitter();

  constructor() {
    console.log("modal construct");
  }

  ngOnInit(): void {
    console.log("modal init");
  }

  closeModal(): void {
    this.isOpen = false;
    this.completed.emit();
  }
}

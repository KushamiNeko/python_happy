import {
  Component,
  HostListener,
  ElementRef,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
} from "@angular/core";
import { ChartService } from "../services/chart.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-canvas",
  templateUrl: "./canvas.component.html",
  styleUrls: ["./canvas.component.scss"],
})
export class CanvasComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly _coverColor = "rgba(0, 0, 0, 0.8)";
  private readonly _inspectColor = "rgba(255, 255, 255, 0.8)";
  private readonly _anchorColor = "rgba(255, 255, 255, 0.5)";

  @ViewChild("inspect")
  private _inspectRef: ElementRef;

  @ViewChild("cover")
  private _coverRef: ElementRef;

  @ViewChild("image")
  private _imageRef: ElementRef;

  @ViewChild("info")
  private _infoRef: ElementRef;

  private _triggers = {
    left: false,
    right: false,
    both: false,
    calc: false,
    moving: false,
  };

  private _anchor = {
    calcX: 0,
    calcY: 0,
  };

  //private _isWorking = false;

  private _$image: Subscription;

  constructor(private _chartService: ChartService) {
    console.log("canvas construct");
  }

  ngAfterViewInit(): void {
    this._$image = this._chartService.image.subscribe((src) => {
      this._imageRef.nativeElement.src = src;
    });
  }

  ngOnInit(): void {
    console.log("canvas init");
  }

  ngOnDestroy(): void {
    console.log("canvas destroy");
    this._$image.unsubscribe();
  }

  imageLoaded(): void {
    this._initCanvasSize();
  }

  isMoving(): boolean {
    return this._triggers["moving"];
  }

  private _eventXOffset(event: MouseEvent): number {
    return event.clientX - this._imageRef.nativeElement.offsetLeft;
  }

  private _eventYOffset(event: MouseEvent): number {
    return event.clientY - this._imageRef.nativeElement.offsetTop;
  }

  private _initCanvasSize(): void {
    this._inspectRef.nativeElement.width =
      Math.floor(this._imageRef.nativeElement.clientWidth) - 1;
    this._inspectRef.nativeElement.height =
      Math.floor(this._imageRef.nativeElement.clientHeight) - 1;

    this._coverRef.nativeElement.width =
      Math.floor(this._imageRef.nativeElement.clientWidth) - 1;
    this._coverRef.nativeElement.height =
      Math.floor(this._imageRef.nativeElement.clientHeight) - 1;
  }

  private _singleCoverR(event: MouseEvent): void {
    const cctx = this._coverRef.nativeElement.getContext("2d");

    cctx.clearRect(
      0,
      0,
      this._coverRef.nativeElement.width,
      this._coverRef.nativeElement.height
    );
    cctx.fillStyle = this._coverColor;

    cctx.fillRect(
      this._eventXOffset(event),
      0,
      this._coverRef.nativeElement.width - this._eventXOffset(event),
      this._coverRef.nativeElement.height
    );
  }

  private _singleCoverL(event: MouseEvent): void {
    const cctx = this._coverRef.nativeElement.getContext("2d");

    cctx.clearRect(
      0,
      0,
      this._coverRef.nativeElement.width,
      this._coverRef.nativeElement.height
    );
    cctx.fillStyle = this._coverColor;

    cctx.fillRect(
      0,
      0,
      this._eventXOffset(event),
      this._coverRef.nativeElement.height
    );
  }

  private _doubleCover(event: MouseEvent): void {
    const cctx = this._coverRef.nativeElement.getContext("2d");

    cctx.clearRect(
      0,
      0,
      this._coverRef.nativeElement.width,
      this._coverRef.nativeElement.height
    );

    cctx.fillStyle = this._coverColor;

    if (this._eventXOffset(event) >= this._anchor["calcX"]) {
      cctx.fillRect(
        0,
        0,
        this._anchor["calcX"],
        this._coverRef.nativeElement.height
      );

      cctx.fillRect(
        this._eventXOffset(event),
        0,
        this._coverRef.nativeElement.width - this._eventXOffset(event),
        this._coverRef.nativeElement.height
      );
    } else {
      cctx.fillRect(
        0,
        0,
        this._eventXOffset(event),
        this._coverRef.nativeElement.height
      );

      cctx.fillRect(
        this._anchor["calcX"],
        0,
        this._coverRef.nativeElement.width - this._anchor["calcX"],
        this._coverRef.nativeElement.height
      );
    }
  }

  private async _inspectInfo(event: MouseEvent): Promise<void> {
    const x = Math.max(
      Math.min(
        this._eventXOffset(event) / this._inspectRef.nativeElement.width,
        1
      ),
      0
    );

    const y = Math.max(
      Math.min(
        (this._inspectRef.nativeElement.height - this._eventYOffset(event)) /
          this._inspectRef.nativeElement.height,
        1
      ),
      0
    );

    if (this._triggers["calc"]) {
      const ax = Math.max(
        Math.min(
          this._anchor["calcX"] / this._inspectRef.nativeElement.width,
          1
        ),
        0
      );

      const ay = Math.max(
        Math.min(
          (this._inspectRef.nativeElement.height - this._anchor["calcY"]) /
            this._inspectRef.nativeElement.height,
          1
        ),
        0
      );

      this._infoRef.nativeElement.innerHTML = await this._chartService.inspectRequest(
        x,
        y,
        ax,
        ay
      );
    } else {
      this._infoRef.nativeElement.innerHTML = await this._chartService.inspectRequest(
        x,
        y
      );
    }

    const offset = 20;

    if (this._eventXOffset(event) > this._inspectRef.nativeElement.width / 2) {
      this._infoRef.nativeElement.style.left = `${
        event.clientX - this._infoRef.nativeElement.clientWidth - offset
      }px`;
    } else {
      this._infoRef.nativeElement.style.left = `${event.clientX + offset}px`;
    }

    if (this._eventYOffset(event) > this._inspectRef.nativeElement.height / 2) {
      this._infoRef.nativeElement.style.top = `${
        event.clientY - this._infoRef.nativeElement.offsetHeight - offset
      }px`;
    } else {
      this._infoRef.nativeElement.style.top = `${event.clientY + offset}px`;
    }
  }

  private _inspect(event: MouseEvent): void {
    const ictx = this._inspectRef.nativeElement.getContext("2d");

    ictx.clearRect(
      0,
      0,
      this._inspectRef.nativeElement.width,
      this._inspectRef.nativeElement.height
    );

    ictx.strokeStyle = this._inspectColor;

    ictx.beginPath();
    ictx.moveTo(this._eventXOffset(event), 0);

    ictx.lineTo(
      this._eventXOffset(event),
      this._inspectRef.nativeElement.height
    );

    ictx.stroke();
    ictx.closePath();

    ictx.beginPath();

    ictx.moveTo(0, this._eventYOffset(event));

    ictx.lineTo(
      this._inspectRef.nativeElement.width,
      this._eventYOffset(event)
    );

    ictx.stroke();
    ictx.closePath();
  }

  private _inspectAnchor(): void {
    const ictx = this._inspectRef.nativeElement.getContext("2d");

    ictx.strokeStyle = this._anchorColor;

    ictx.beginPath();
    ictx.moveTo(this._anchor["calcX"], 0);

    ictx.lineTo(this._anchor["calcX"], this._inspectRef.nativeElement.height);

    ictx.stroke();
    ictx.closePath();

    ictx.beginPath();

    ictx.moveTo(0, this._anchor["calcY"]);

    ictx.lineTo(this._inspectRef.nativeElement.width, this._anchor["calcY"]);

    ictx.stroke();
    ictx.closePath();
  }

  @HostListener("window:mouseup", [])
  handleMouseUp(): void {
    this._triggers["left"] = false;
    this._triggers["right"] = false;
    this._triggers["both"] = false;
    this._triggers["calc"] = false;
    this._triggers["moving"] = false;
  }

  @HostListener("window:mousemove", ["$event"])
  handleMouseMove(event: MouseEvent): void {
    if (!this._triggers["moving"]) {
      this._triggers["moving"] = true;
    }

    this._inspectInfo(event);

    if (this._triggers["both"]) {
      this._doubleCover(event);
    } else if (this._triggers["left"]) {
      this._singleCoverL(event);
    } else if (this._triggers["right"]) {
      this._singleCoverR(event);
    }

    this._inspect(event);

    if (this._triggers["calc"]) {
      this._inspectAnchor();
    }
  }

  @HostListener("window:mousedown", ["$event"])
  handleMouseDown(event: MouseEvent): void {
    const ictx = this._inspectRef.nativeElement.getContext("2d");
    const cctx = this._coverRef.nativeElement.getContext("2d");

    ictx.clearRect(
      0,
      0,
      this._inspectRef.nativeElement.width,
      this._inspectRef.nativeElement.height
    );

    cctx.clearRect(
      0,
      0,
      this._inspectRef.nativeElement.width,
      this._inspectRef.nativeElement.height
    );

    this._triggers["left"] = false;
    this._triggers["right"] = false;
    this._triggers["both"] = false;

    if (event.ctrlKey) {
      this._triggers["left"] = true;
    } else if (event.shiftKey) {
      this._triggers["right"] = true;
    } else if (event.altKey) {
      this._triggers["both"] = true;
    }

    this._triggers["calc"] = true;

    this._anchor["calcX"] = this._eventXOffset(event);
    this._anchor["calcY"] = this._eventYOffset(event);

    this._triggers["moving"] = false;
  }
}

import { Component, OnInit, OnDestroy } from "@angular/core";
import { TradeService } from "../services/trade.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-books-table",
  templateUrl: "./books-table.component.html",
  styleUrls: ["./books-table.component.scss"],
})
export class BooksTableComponent implements OnInit, OnDestroy {
  private _$books: Subscription;

  books: Array<string> = [];

  selected: Array<number> = [];

  constructor(private _tradeService: TradeService) {}

  ngOnInit(): void {
    this._$books = this._tradeService.books.subscribe((books) => {
      this.books = books;
    });

    this._tradeService.findAllBooks();
  }

  ngOnDestroy(): void {
    this._$books.unsubscribe();
  }

  selectBook(index: number): void {
    if (!this.selected.includes(index)) {
      this.selected.push(index);
    } else {
      this.selected.splice(this.selected.indexOf(index), 1);
    }

    if (this.selected.length > 0) {
      this._tradeService.readStatistic(
        this.books.filter((x) => this.selected.includes(this.books.indexOf(x)))
      );
    }
  }

  selectAll(): void {
    this.selected = [...Array(this.books.length).keys()];
    this._tradeService.readStatistic(this.books);
  }

  selectNone(): void {
    this.selected = [];
    this._tradeService.readStatistic(null);
  }
}

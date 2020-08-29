import base64
import io
import os
import random
import re
from datetime import datetime
from typing import Any, Dict, List, Optional, cast

from flask import request

from fun.chart.preset import CandleSticksPreset
from fun.data.source import DAILY, FREQUENCY, HOURLY, MONTHLY, WEEKLY
from fun.plotter.plotter import Plotter
from fun.plotter.records import LeverageRecords, TradingHedgingLeverageRecords
from fun.plotter.stop import StopOrder
from fun.trading.agent import TradingAgent

# from fun.trading.transaction import FuturesTransaction


class ChartHandler:
    _root: str = os.path.join(
        cast(str, os.getenv("HOME")), "Documents", "database", "testing", "json"
    )

    _agent: TradingAgent = TradingAgent(root=_root, new_user=True)

    _store: Dict[str, CandleSticksPreset] = {}

    @classmethod
    def _store_write(cls, key: str, preset: CandleSticksPreset) -> None:
        cls._store[key] = preset

    @classmethod
    def _store_read(
        cls, key: str, dtime: Optional[datetime] = None, time_sliced: bool = False,
    ) -> Optional[CandleSticksPreset]:
        preset = cls._store.get(key, None)
        if preset is not None:
            if time_sliced:
                assert dtime is not None

                preset.time_slice(dtime)

        return preset

    @classmethod
    def _store_clear_symbol(cls, symbol: str) -> None:
        ks = []
        for k in cls._store.keys():
            if symbol in k:
                ks.append(k)

        for k in ks:
            cls._store.pop(k)

    def __init__(self):
        date = request.args.get("date")
        symbol = request.args.get("symbol")
        frequency = request.args.get("frequency")
        function = request.args.get("function")
        show_records = request.args.get("records") == "true"
        book = request.args.get("book")

        if re.match(r"^\d{8}$", date) is None:
            raise ValueError("invalid date")

        if re.match(r"^[a-zA-Z0-9]+$", symbol) is None:
            raise ValueError("invalid symbol")

        if frequency not in ("h", "d", "w", "m"):
            raise ValueError("invalid frequency")

        if function not in (
            "simple",
            "slice",
            "forward",
            "backward",
            "inspect",
            "randomDate",
        ):
            raise ValueError("invalid function")

        if show_records and re.match(r"^\w+$", book) is None:
            raise ValueError("invalid book")

        self._date = datetime.strptime(date, "%Y%m%d")
        self._symbol = symbol

        self._frequency: FREQUENCY
        if frequency == "h":
            self._frequency = HOURLY
        elif frequency == "d":
            self._frequency = DAILY
        elif frequency == "w":
            self._frequency = WEEKLY
        elif frequency == "m":
            self._frequency = MONTHLY

        assert self._frequency is not None

        self._function = function
        self._show_records = show_records
        self._book = book

        self._params = {
            k.split("_")[-1]: v
            for k, v in request.args.items()
            if k.startswith("params_")
        }

    def _store_key(self) -> str:
        return f"{self._symbol}_{self._frequency}"

    # def _read_records(self, title: str) -> Optional[List[FuturesTransaction]]:
    #     return self._agent.read_records(title)

    def _check_orders(self, title: str, preset: CandleSticksPreset) -> None:

        prices = [
            v
            for k, v in preset.last_quote().items()
            if k in ("open", "high", "low", "close")
        ]

        self._agent.check_orders(
            title=title,
            dtime=preset.quotes().index[-1].to_pydatetime(),
            price=max(prices),
            new_book=True,
        )
        self._agent.check_orders(
            title=title,
            dtime=preset.quotes().index[-1].to_pydatetime(),
            price=min(prices),
            new_book=True,
        )

    def _render(self, preset: CandleSticksPreset) -> io.BytesIO:
        plotters: List[Plotter] = []

        self._check_orders(title=self._book, preset=preset)

        orders = self._agent.read_orders()
        if orders is not None and len(orders) > 0:
            plotters.append(StopOrder(quotes=preset.quotes(), orders=orders,))

        preset.make_controller(self._params)

        if self._show_records:
            # ts = self._read_records(self._book)
            # if ts is not None and len(ts) > 0:

            plotters.append(
                # LeverageRecords(
                #     quotes=preset.quotes(),
                #     frequency=self._frequency,
                #     # records=ts,
                #     book_title=self._book,
                #     agent=self._agent,
                #     font_color=preset.theme().get_color("text"),
                #     font_properties=preset.theme().get_font(
                #         preset.setting().text_fontsize()
                #     ),
                # )
                TradingHedgingLeverageRecords(
                    dtime=preset.quotes().index[-1].to_pydatetime(),
                    virtual_close=preset.quotes().iloc[-1].loc["close"],
                    quotes=preset.quotes(),
                    frequency=self._frequency,
                    trading_book_title=f"{self._book}_trading",
                    hedging_book_title=f"{self._book}_hedging",
                    agent=self._agent,
                    # font_color=preset.theme().get_color("text"),
                    font_properties=preset.theme().get_font(
                        preset.setting().text_fontsize()
                    ),
                    info_font_color=preset.theme().get_color("text"),
                    info_font_properties=preset.theme().get_font(
                        preset.setting().text_fontsize(multiplier=1.5)
                    ),
                )
            )

        return preset.render(additional_plotters=plotters)

    def _function_slice(self) -> io.BytesIO:
        preset = self._store_read(
            self._store_key(), dtime=self._date, time_sliced=True,
        )
        if preset is None:
            preset = CandleSticksPreset(self._date, self._symbol, self._frequency)
            self._store_write(self._store_key(), preset)

        return self._render(preset)

    def _function_simple(self) -> io.BytesIO:
        preset = self._store_read(self._store_key())
        if preset is None:
            preset = CandleSticksPreset(self._date, self._symbol, self._frequency)
            self._store_write(self._store_key(), preset)

        return self._render(preset)

    def _function_forward(self) -> io.BytesIO:
        preset = self._store_read(self._store_key())
        assert preset is not None

        preset.forward()

        return self._render(preset)

    def _function_backward(self) -> io.BytesIO:
        preset = self._store_read(self._store_key())
        assert preset is not None

        preset.backward()

        return self._render(preset)

    def _function_randomDate(self) -> io.BytesIO:
        random.seed()

        year = random.randint(1990, datetime.now().year - 1)
        month = random.randint(1, 12)

        day: int
        if month in (1, 3, 5, 7, 8, 10, 12):
            day = random.randint(1, 31)
        elif month in (4, 6, 9, 11):
            day = random.randint(1, 30)
        elif month == 2:
            day = random.randint(1, 28)
        else:
            ValueError("invalid month")

        dtime = datetime(year, month, day)

        self._date = dtime

        return self._function_slice()

    def _function_inspect(self) -> str:
        preset = self._store_read(self._store_key())
        if preset is None:
            return ""

        x = request.args.get("x")
        y = request.args.get("y")

        ax = request.args.get("ax") if request.args.get("ax") != "" else None
        ay = request.args.get("ay") if request.args.get("ay") != "" else None

        if x is None or y is None:
            return ""

        info = preset.inspect(x, y, ax=ax, ay=ay)
        if info is None:
            return ""

        return "\n".join([f"{k}: {v}" for k, v in info.items()])

    def _function_quote(self) -> Dict[str, Any]:
        preset = self._store_read(self._store_key())
        if preset is None:
            return {}

        return preset.last_quote()

    def response(self) -> Any:
        if self._function == "simple":
            buf = self._function_simple()
        elif self._function == "slice":
            buf = self._function_slice()
        elif self._function == "forward":
            buf = self._function_forward()
        elif self._function == "backward":
            buf = self._function_backward()
        elif self._function == "randomDate":
            buf = self._function_randomDate()
        elif self._function == "inspect":
            return self._function_inspect()
        elif self._function == "randomDate":
            pass

        body = self._function_quote()
        body["img"] = base64.b64encode(buf.getvalue()).decode("utf-8")

        return body

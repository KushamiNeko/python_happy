import io
import base64
import re
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple, Union

import pandas as pd
from flask import request, send_file

from fun.chart.preset import ChartPreset
from fun.data.source import HOURLY, DAILY, WEEKLY, MONTHLY, FREQUENCY

# import fun.trading.indicator as ind
# from fun.chart.static import StaticChart
# from fun.trading.agent import Agent
# from fun.trading.source import Barchart, DataSource, Yahoo
# from fun.trading.transaction import FuturesTransaction


class PlotHandler:

    _store: Dict[str, ChartPreset] = {}

    @classmethod
    def _store_write(cls, key: str, preset: ChartPreset) -> None:
        cls._store[key] = preset

    @classmethod
    def _store_read(
        cls, key: str, dtime: Optional[datetime] = None, time_sliced: bool = False,
    ) -> Optional[ChartPreset]:
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

        # print(date)
        # print(symbol)
        # print(frequency)
        # print(function)
        # print(show_records)
        # print(book)

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
            "quote",
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

        # print(self._store)

    def _store_key(self) -> str:
        return f"{self._symbol}_{self._frequency}"

    def _function_slice(self) -> io.BytesIO:
        preset = self._store_read(
            self._store_key(), dtime=self._date, time_sliced=True,
        )
        if preset is None:
            preset = ChartPreset(self._date, self._symbol, self._frequency)
            self._store_write(self._store_key(), preset)

        return preset.render()

    def _function_simple(self) -> io.BytesIO:
        preset = self._store_read(self._store_key())
        if preset is None:
            preset = ChartPreset(self._date, self._symbol, self._frequency)
            self._store_write(self._store_key(), preset)

        return preset.render()

    def _function_forward(self) -> io.BytesIO:
        preset = self._store_read(self._store_key())
        assert preset is not None

        preset.forward()
        # ok = preset.forward()
        # if not ok:
        # preset = ChartPreset(preset.exetime(), self._symbol, self._frequency)
        # self._store_write(self._store_key(), preset)

        return preset.render()

    def _function_backward(self) -> io.BytesIO:
        preset = self._store_read(self._store_key())
        assert preset is not None

        preset.backward()

        # ok = preset.backward()
        # if not ok:
        # preset = ChartPreset(preset.exstime(), self._symbol, self._frequency)
        # self._store_write(self._store_key(), preset)

        return preset.render()

    def _function_randomDate(self) -> io.BytesIO:
        pass

    # def _function_inspect(self) -> Dict[str, str]:
    def _function_inspect(self) -> str:
        preset = self._store_read(self._store_key())
        if preset is None:
            return ""
            # return {}

        x = request.args.get("x")
        y = request.args.get("y")

        ax = request.args.get("ax") if request.args.get("ax") != "" else None
        ay = request.args.get("ay") if request.args.get("ay") != "" else None

        if x is None or y is None:
            return ""
            # return {}

        info = preset.inspect(x, y, ax=ax, ay=ay)
        assert info is not None

        return "\n".join([f"{k}: {v}" for k, v in info.items()])
        # return info

    def _function_quote(self) -> Dict[str, Any]:
        preset = self._store_read(self._store_key())
        if preset is None:
            return {}

        return preset.quote()


    def response(self) -> Any:
        if self._function == "simple":
            buf = self._function_simple()
        elif self._function == "slice":
            buf = self._function_slice()
        elif self._function == "forward":
            buf = self._function_forward()
        elif self._function == "backward":
            buf = self._function_backward()
        elif self._function == "inspect":
            return self._function_inspect()
        elif self._function == "quote":
            return self._function_quote()
        elif self._function == "randomDate":
            pass

        # return send_file(buf, mimetype="image/png", cache_timeout=-1)
        return base64.b64encode(buf.getvalue()).decode("utf-8")

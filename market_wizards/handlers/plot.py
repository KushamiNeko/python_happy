import io
import re
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple, Union

import pandas as pd
from flask import request, send_file

from fun.chart.cache import QuotesCache
from fun.chart.preset import ChartPreset
from fun.data.source import HOURLY, DAILY, WEEKLY, MONTHLY, FREQUENCY

# import fun.trading.indicator as ind
# from fun.chart.static import StaticChart
# from fun.trading.agent import Agent
# from fun.trading.source import Barchart, DataSource, Yahoo
# from fun.trading.transaction import FuturesTransaction


# class DataCache:
# def __init__(self, df: pd.DataFrame, stime: datetime, etime: datetime):
# self._df = df

# self.time_slice(stime, etime)
# self._make_chart()

# @property
# def exstime(self) -> datetime:
# return self._df.index[0].to_pydatetime()

# @property
# def exetime(self) -> datetime:
# return self._df.index[-1].to_pydatetime()

# @property
# def stime(self) -> datetime:
# return self._stime

# @property
# def etime(self) -> datetime:
# return self._etime

# @property
# def slice(self) -> pd.DataFrame:
# return self._df.loc[self._stime : self._etime]

# @property
# def chart(self) -> StaticChart:
# return self._chart

# def time_slice(self, stime: datetime, etime: datetime) -> None:
# s = self._df.loc[stime:etime]

# self._sindex = self._df.index.get_loc(s.index[0])
# self._eindex = self._df.index.get_loc(s.index[-1])

# self._index_time()

# def _make_chart(self) -> None:
# self._chart = StaticChart(self.slice, chart_size="m")

# def _index_time(self) -> None:
# self._stime = self._df.index[self._sindex]
# self._etime = self._df.index[self._eindex]

# def forward(self) -> Optional[StaticChart]:
# if self._eindex + 1 >= len(self._df.index) or self._sindex + 1 >= self._eindex:
# return None

# self._sindex += 1
# self._eindex += 1

# self._index_time()
# self._make_chart()

# return self.chart

# def backward(self) -> Optional[StaticChart]:
# if self._sindex - 1 <= 0 or self._eindex - 1 <= self._sindex:
# return None

# self._sindex -= 1
# self._eindex -= 1

# self._index_time()
# self._make_chart()

# return self.chart


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
            # for k in cls._store.keys():
            # if symbol in k:
            cls._store.pop(k)

    def __init__(self):
        # date = request.args.get("date")
        date = request.args.get("time")
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
            "refresh",
            "forward",
            "backward",
            "inspect",
            "quote",
            # "randomDate",
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

        print(self._store)

    def _store_key(self) -> str:
        return f"{self._symbol}_{self._frequency}"

    def _function_refresh(self) -> io.BytesIO:
        # self._store_clear_symbol(self._symbol)

        # preset = ChartPreset(self._date, self._symbol, self._frequency)
        # self._store_write(self._store_key(), preset)

        preset = self._store_read(
            self._store_key(),
            dtime=self._date,
            time_sliced=True,
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
        # print(self._store_key())
        preset = self._store_read(self._store_key())
        assert preset is not None

        preset.forward()
        # ok = preset.forward()
        # if not ok:
        # preset = ChartPreset(preset.exetime(), self._symbol, self._frequency)
        # self._store_write(self._store_key(), preset)

        return preset.render()

    def _function_backward(self) -> io.BytesIO:
        # print(self._store_key())
        preset = self._store_read(self._store_key())
        assert preset is not None

        preset.backward()

        # ok = preset.backward()
        # if not ok:
        # preset = ChartPreset(preset.exstime(), self._symbol, self._frequency)
        # self._store_write(self._store_key(), preset)

        return preset.render()

    # def _function_inspect(self) -> Dict[str, str]:
    #     cache = self._cache_store_read(self._cache_key())
    #     if cache is None:
    #         # return ""
    #         return {}

    #     chart = cache.chart

    #     assert chart is not None

    #     x = request.args.get("x")
    #     y = request.args.get("y")

    #     if x is None or y is None:
    #         # return ""
    #         return {}

    #     n = chart.to_data_coordinates(x, y)
    #     if n is None:
    #         # return ""
    #         return {}

    #     nx, ny = n

    #     rn = 2

    #     info = {
    #         "time": cache.slice.index[int(nx)].to_pydatetime().strftime("%Y-%m-%d"),
    #         "price": f"{round(ny, rn):,}",
    #         "open": f"{round(cache.slice.iloc[nx]['open'], rn):,}",
    #         "high": f"{round(cache.slice.iloc[nx]['high'], rn):,}",
    #         "low": f"{round(cache.slice.iloc[nx]['low'], rn):,}",
    #         "close": f"{round(cache.slice.iloc[nx]['close'], rn):,}",
    #         "volume": f"{round(cache.slice.iloc[nx].get('volume', 0), rn):,}",
    #         "open interest": f"{round(cache.slice.iloc[nx].get('openinterest', 0), rn):,}",
    #     }

    #     # return "\n".join([f"{k}: {v}" for k, v in info.items()])
    #     return info

    # def _function_quote(self) -> str:
    #     cache = self._cache_store_read(self._cache_key())
    #     if cache is None:
    #         return ""

    #     return cache.slice.index[-1].to_pydatetime().strftime("%Y%m%d")

    def response(self) -> Any:
        if self._function == "simple":
            buf = self._function_simple()
        elif self._function == "refresh":
            buf = self._function_refresh()
        elif self._function == "forward":
            buf = self._function_forward()
        elif self._function == "backward":
            buf = self._function_backward()
        elif self._function == "inspect":
            return ""
            # v = self._function_inspect()
            # return v
        elif self._function == "quote":
            return ""
            # v = self._function_quote()
            # return v
        # elif self._function == "randomDate":
        # pass

        return send_file(buf, mimetype="image/png", cache_timeout=-1)

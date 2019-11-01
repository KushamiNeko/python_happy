import io
import re
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple, Union

import pandas as pd
from flask import request, send_file

import fun.trading.indicator as ind
from fun.chart.static import StaticChart
from fun.trading.agent import Agent
from fun.trading.source import Barchart, DataSource, Yahoo
from fun.trading.transaction import FuturesTransaction


class DataCache:
    def __init__(self, df: pd.DataFrame, stime: datetime, etime: datetime):
        self._df = df

        self.time_slice(stime, etime)
        self._make_chart()

    @property
    def exstime(self) -> datetime:
        return self._df.index[0].to_pydatetime()

    @property
    def exetime(self) -> datetime:
        return self._df.index[-1].to_pydatetime()

    @property
    def stime(self) -> datetime:
        return self._stime

    @property
    def etime(self) -> datetime:
        return self._etime

    @property
    def slice(self) -> pd.DataFrame:
        return self._df.loc[self._stime : self._etime]

    @property
    def chart(self) -> StaticChart:
        return self._chart

    def time_slice(self, stime: datetime, etime: datetime) -> None:
        s = self._df.loc[stime:etime]

        self._sindex = self._df.index.get_loc(s.index[0])
        self._eindex = self._df.index.get_loc(s.index[-1])

        self._index_time()

    def _make_chart(self) -> None:
        self._chart = StaticChart(self.slice, chart_size="m")

    def _index_time(self) -> None:
        self._stime = self._df.index[self._sindex]
        self._etime = self._df.index[self._eindex]

    def forward(self) -> Optional[StaticChart]:
        if self._eindex + 1 >= len(self._df.index) or self._sindex + 1 >= self._eindex:
            return None

        self._sindex += 1
        self._eindex += 1

        self._index_time()
        self._make_chart()

        return self.chart

    def backward(self) -> Optional[StaticChart]:
        if self._sindex - 1 <= 0 or self._eindex - 1 <= self._sindex:
            return None

        self._sindex -= 1
        self._eindex -= 1

        self._index_time()
        self._make_chart()

        return self.chart


class PlotHandler:

    _cache_store: Dict[str, DataCache] = {}

    @classmethod
    def _cache_store_write(cls, key: str, cache: DataCache) -> None:
        cls._cache_store[key] = cache

    @classmethod
    def _cache_store_read(cls, key: str) -> Optional[DataCache]:
        return cls._cache_store.get(key, None)

    @classmethod
    def _cache_store_clear_symbol(cls, symbol: str) -> None:
        ks = []
        for k in cls._cache_store.keys():
            if symbol in k:
                ks.append(k)

        for k in ks:
            cls._cache_store.pop(k)

    def __init__(self, path: str):
        pattern = r"/practice/([a-zA-Z0-9]+)/(h|d|w|m)/(simple|refresh|forward|backward|time|inspect)*/*(\d{8}|\d{14})*/*(records)*/*(\d+)*"

        match = re.match(pattern, path)
        if not match:
            raise ValueError(f"unknown path: {path}")

        self._symbol = match.group(1)
        self._frequency = match.group(2)
        self._function = match.group(3)

        assert self._frequency in ("h", "d", "w", "m")
        assert self._function in (
            "simple",
            "refresh",
            "forward",
            "backward",
            "time",
            "inspect",
        )

        dtime = match.group(4)

        self._show_records = match.group(5) is not None
        self._version = match.group(6) if match.group(6) is not None else "1"

        if self._function == "time" and dtime is None:
            raise ValueError(f"invalid datetime: {dtime}")

        self._stime, self._etime = self._time_range(dtime)

    def _time_range(self, dtime: Union[str, datetime]) -> Tuple[datetime, datetime]:
        assert type(dtime) in (str, datetime)

        e_time: datetime

        if type(dtime) is str:
            if re.match(r"^\d{8}$", dtime):
                e_time = datetime.strptime(dtime, r"%Y%m%d")
            elif re.match(r"^\d{14}$", dtime):
                e_time = datetime.strptime(dtime, r"%Y%m%d%H%M%S")
            else:
                raise ValueError(f"invalid datetime: {dtime}")
        elif type(dtime) is datetime:
            e_time = dtime
        else:
            raise ValueError(f"invalid datetime: {dtime}")

        assert e_time is not None

        s_time: datetime

        if self._frequency == "h":
            s_time = e_time - timedelta(days=15)
        elif self._frequency == "d":
            s_time = e_time - timedelta(days=365)
        elif self._frequency == "w":
            s_time = e_time - timedelta(days=365 * 4)
        elif self._frequency == "m":
            s_time = e_time - timedelta(days=368 * 18)
        else:
            raise ValueError(f"invalid frequency: {self._frequency}")

        return s_time, e_time

    def _extensive_time(self) -> Tuple[datetime, datetime]:
        ex_stime = self._stime - timedelta(days=500)
        ex_etime = self._etime + timedelta(days=500)

        return ex_stime, ex_etime

    def _read_chart_data(self) -> DataCache:
        print("network")

        src: DataSource

        if re.match(r"^[a-zA-Z]+$", self._symbol):
            src = Yahoo()
        elif re.match(r"^[a-zA-Z]+[0-9]+$", self._symbol):
            src = Barchart()
        else:
            raise ValueError(f"invalid symbol: {self._symbol}")

        ex_stime, ex_etime = self._extensive_time()

        df = src.read(
            start=ex_stime, end=ex_etime, symbol=self._symbol, frequency=self._frequency
        )

        df = ind.my_simple_moving_average(df)
        df = ind.my_bollinger_bands(df)

        cache = DataCache(df, self._stime, self._etime)
        self._cache_store_write(self._cache_key(), cache)

        return cache

    def _cache_key(self) -> str:
        return f"{self._symbol}_{self._frequency}"

    def _read_records(self) -> Optional[List[FuturesTransaction]]:
        ts = None
        if self._show_records:
            m = re.match(r"^([a-z]+)(?:[fghjkmnquvxz][0-9]+)?$", self._symbol)
            assert m is not None
            symbol = m.group(1)

            agent = Agent("aa")
            ts = agent.read_all_records(symbol, self._version)

        return ts

    def _render_chart(self, chart: StaticChart) -> io.BytesIO:
        ts = self._read_records()

        buf = io.BytesIO()
        chart.futures_price(buf, records=ts)
        buf.seek(0)

        return buf

    def _function_refresh(self) -> io.BytesIO:
        self._cache_store_clear_symbol(self._symbol)
        cache = self._read_chart_data()
        return self._render_chart(cache.chart)

    def _function_simple(self) -> io.BytesIO:
        cache = self._cache_store_read(self._cache_key())
        if cache is None:
            cache = self._read_chart_data()

        return self._render_chart(cache.chart)

    def _function_forward(self) -> io.BytesIO:
        cache = self._cache_store_read(self._cache_key())
        assert cache is not None

        chart = cache.forward()
        if chart is None:
            self._stime, self._etime = self._time_range(cache.exetime)
            cache = self._read_chart_data()
            chart = cache.chart

        return self._render_chart(chart)

    def _function_backward(self) -> io.BytesIO:
        cache = self._cache_store_read(self._cache_key())
        assert cache is not None

        chart = cache.backward()
        if chart is None:
            self._stime, self._etime = self._time_range(cache.exstime)
            cache = self._read_chart_data()
            chart = cache.chart

        return self._render_chart(chart)

    def _function_inspect(self) -> Dict[str, str]:
        cache = self._cache_store_read(self._cache_key())
        if cache is None:
            # return ""
            return {}

        chart = cache.chart

        assert chart is not None

        x = request.args.get("x")
        y = request.args.get("y")

        if x is None or y is None:
            # return ""
            return {}

        n = chart.to_data_coordinates(x, y)
        if n is None:
            # return ""
            return {}

        nx, ny = n

        rn = 2

        info = {
            "time": cache.slice.index[int(nx)].to_pydatetime().strftime("%Y-%m-%d"),
            "price": f"{round(ny, rn):,}",
            "open": f"{round(cache.slice.iloc[nx]['open'], rn):,}",
            "high": f"{round(cache.slice.iloc[nx]['high'], rn):,}",
            "low": f"{round(cache.slice.iloc[nx]['low'], rn):,}",
            "close": f"{round(cache.slice.iloc[nx]['close'], rn):,}",
            "volume": f"{round(cache.slice.iloc[nx].get('volume', 0), rn):,}",
            "open interest": f"{round(cache.slice.iloc[nx].get('openinterest', 0), rn):,}",
        }

        # return "\n".join([f"{k}: {v}" for k, v in info.items()])
        return info

    def _function_time(self) -> str:
        cache = self._cache_store_read(self._cache_key())
        if cache is None:
            return ""

        return cache.slice.index[-1].to_pydatetime().strftime("%Y%m%d")

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
            v = self._function_inspect()
            return v
        elif self._function == "time":
            v = self._function_time()
            return v

        return send_file(buf, mimetype="image/png", cache_timeout=-1)

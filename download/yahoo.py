import os
import re
from datetime import datetime, timezone
from typing import Iterable

import requests

from fun.utils import colors, pretty
from processor import Processor


class YahooProcessor(Processor):
    def __init__(self) -> None:
        super().__init__()

        self._symbols = [
            "^vix",
            "^vxn",
            "^sml",
            "^ovx",
            "^gvz",
            "^hsi",
            "^n225",
            "^gspc",
            "ezu",
            "eem",
            "fxi",
            "hyg",
            "emb",
            "iyr",
            "rem",
            "near",
            "shv",
            "lqd",
        ]

        self._datetime_start = [
            datetime.strptime("19900101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("20000101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("19890101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("20070101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("20100101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("19860101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("19650101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("19270101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("20000101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("20030101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("20040101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("20070101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("20070101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("20000101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("20070101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("20130101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("20070101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("20020101", "%Y%m%d").replace(tzinfo=timezone.utc),
        ]

    def _urls(self) -> Iterable[str]:
        assert len(self._symbols) == len(self._datetime_start)

        for i, symbol in enumerate(self._symbols):
            dtime = self._datetime_start[i]

            pretty.color_print(colors.PAPER_CYAN_300, f"downloading: {symbol}")

            yield (
                f"https://finance.yahoo.com/quote/{requests.utils.quote(symbol)}/history?"
                + f"period1={int(dtime.timestamp())}&period2={int(datetime.utcnow().timestamp())}&interval=1d&filter=history&frequency=1d"
            )

    def rename(self) -> None:
        for fs in os.listdir(self._src):
            src = ""
            tar = ""

            match = re.match(r"(\^(\w+)).csv", fs)
            if match is not None:
                if match.group(1).lower() in self._symbols:
                    symbol = match.group(2).lower()
                    if symbol == "n225":
                        symbol = "nikk"
                    elif symbol == "gspc":
                        symbol = "spx"

                    src = os.path.join(self._src, fs)
                    tar = os.path.join(self._tar, "yahoo", f"{symbol}.csv")

                    assert os.path.exists(os.path.dirname(tar))
            else:
                symbol = os.path.splitext(fs)[0].lower()
                if symbol in self._symbols:
                    src = os.path.join(self._src, fs)
                    tar = os.path.join(self._tar, "yahoo", f"{symbol}.csv")

            assert src != ""
            assert tar != ""

            pretty.color_print(
                colors.PAPER_DEEP_PURPLE_200, f"move file: {src} => {tar}",
            )

            os.rename(src, tar)

    def check(self) -> None:
        pass

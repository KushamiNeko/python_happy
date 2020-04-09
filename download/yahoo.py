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
        ]

        self._datetime_start = [
            datetime.strptime("19900101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("20000101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("19890101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("20070101", "%Y%m%d").replace(tzinfo=timezone.utc),
            datetime.strptime("20100101", "%Y%m%d").replace(tzinfo=timezone.utc),
        ]

    def _urls(self) -> Iterable[str]:
        for i, symbol in enumerate(self._symbols):
            dtime = self._datetime_start[i]

            pretty.color_print(colors.PAPER_CYAN_300, f"downloading: {symbol}")

            yield (
                f"https://finance.yahoo.com/quote/{requests.utils.quote(symbol)}/history?"
                + f"period1={int(dtime.timestamp())}&period2={int(datetime.utcnow().timestamp())}&interval=1d&filter=history&frequency=1d"
            )

    def rename(self) -> None:
        for fs in os.listdir(self._src):
            match = re.match(r"(\^(\w+)).csv", fs)
            if match is not None:
                if match.group(1).lower() in self._symbols:
                    symbol = match.group(2).lower()
                    src = os.path.join(self._src, fs)
                    tar = os.path.join(self._tar, "yahoo", f"{symbol}.csv")

                    assert os.path.exists(os.path.dirname(tar))

                    pretty.color_print(
                        colors.PAPER_DEEP_PURPLE_200, f"move file: {src} => {tar}",
                    )

                    os.rename(src, tar)

    def check(self) -> None:
        pass

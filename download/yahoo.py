import os
import re
from datetime import datetime, timedelta, timezone
from typing import Iterable

import requests
from fun.utils import colors, pretty
from happy.download.processor import Processor


class YahooProcessor(Processor):
    def __init__(self) -> None:
        super().__init__()

        pretty.color_print(
            colors.PAPER_BROWN_300, f"Yahoo Processor",
        )

        self._symbols = {
            "^vix": "19900101",
            "^vxn": "20000101",
            "^sml": "19890101",
            "^rut": "19880101",
            "^dji": "19860101",
            "^ovx": "20070101",
            "^gvz": "20100101",
            "^hsi": "19860101",
            "^n225": "19650101",
            "^gspc": "19270101",
            "^ixic": "19710101",
            "^nya": "19650101",
            "^ndx": "19850101",
            "^ndxe": "20060101",
            "ezu": "20000101",
            "eem": "20030101",
            "fxi": "20040101",
            "hyg": "20070101",
            "emb": "20070101",
            "iyr": "20000101",
            "rem": "20070101",
            "near": "20130101",
            "shv": "20070101",
            "lqd": "20020101",
            # "jpyusd=x": "19970101",
            # "eurusd=x": "20040101",
            # "jpy=x": "19970101",
            # "eur=x": "20040101",
        }

    def _urls(self) -> Iterable[str]:
        for symbol, time in self._symbols.items():
            dtime = datetime.strptime(time, "%Y%m%d").replace(tzinfo=timezone.utc)
            pretty.color_print(colors.PAPER_CYAN_300, f"downloading: {symbol}")

            yield (
                f"https://finance.yahoo.com/quote/{requests.utils.quote(symbol)}/history?"
                + f"period1={int(dtime.timestamp())}&"
                + f"period2={int((datetime.utcnow() + timedelta(days=2)).timestamp())}&"
                + f"interval=1d&filter=history&frequency=1d"
            )

    def download(self) -> None:
        super().download()

        if self._download_count != len(self._symbols):
            pretty.color_print(
                colors.PAPER_RED_400, f"download operation miss some files"
            )

    def rename(self) -> None:

        symbol_table = {
            "n225": "nikk",
            "gspc": "spx",
            "ixic": "compq",
            "ndxe": "ndxew",
            "jpyusd=x": "jpyusd",
            "eurusd=x": "eurusd",
            "jpy=x": "usdjpy",
            "eur=x": "usdeur",
        }

        for fs in os.listdir(self._src):
            src = ""
            tar = ""

            match = re.match(r"(\^(\w+)).csv", fs)
            if match is not None:
                if match.group(1).lower() in self._symbols.keys():
                    symbol = match.group(2).lower()
                    symbol = symbol_table.get(symbol, symbol)

                    # if symbol == "n225":
                    #     symbol = "nikk"
                    # elif symbol == "gspc":
                    #     symbol = "spx"
                    # elif symbol == "ixic":
                    #     symbol = "compq"

                    src = os.path.join(self._src, fs)
                    tar = os.path.join(self._tar, "yahoo", f"{symbol}.csv")

                    assert os.path.exists(os.path.dirname(tar))
            else:
                symbol = os.path.splitext(fs)[0].lower()
                if symbol not in self._symbols.keys():
                    continue

                if symbol in self._symbols.keys():
                    src = os.path.join(self._src, fs)
                    tar = os.path.join(self._tar, "yahoo", f"{symbol}.csv")

            assert src != ""
            assert tar != ""

            pretty.color_print(
                colors.PAPER_DEEP_PURPLE_200, f"move file: {src} => {tar}",
            )

            os.rename(src, tar)
            self._rename_count += 1

        pretty.color_print(
            colors.PAPER_LIGHT_GREEN_A200, f"rename {self._rename_count} files"
        )

        if self._download_count != self._rename_count:
            pretty.color_print(
                colors.PAPER_RED_400, f"rename operation miss some downloaded files"
            )

    def check(self) -> None:
        pass

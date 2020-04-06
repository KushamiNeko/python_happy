import os
from typing import Iterable

from fun.utils import colors, pretty
from processor import Processor


class InvestingProcessor(Processor):
    def __init__(self) -> None:
        super().__init__()

        self._symbols = [
            "vstx",
            "jniv",
        ]

    def _urls(self) -> Iterable[str]:
        for url in [
            r"https://www.investing.com/indices/stoxx-50-volatility-vstoxx-eur-historical-data",
            r"https://www.investing.com/indices/nikkei-volatility-historical-data",
        ]:

            yield url

    def _rename(self) -> None:

        files = [
            "STOXX 50 Volatility VSTOXX EUR Historical Data.csv",
            "Nikkei Volatility Historical Data.csv",
        ]

        for fs in os.listdir(self._src):
            symbol: str
            if fs == files[0]:
                symbol = "vstx"
            elif fs == files[1]:
                symbol = "jniv"
            else:
                continue

            src = os.path.join(self._src, fs)
            tar = os.path.join(self._tar, "investing.com", f"{symbol}.csv")

            assert os.path.exists(os.path.dirname(tar))

            pretty.color_print(
                f"move file: {src} => {tar}", colors.PAPER_DEEP_PURPLE_200
            )
            # os.rename(src, tar)

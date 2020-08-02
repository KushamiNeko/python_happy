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
            r"https://www.investing.com/indices/nikkei-volatility-historical-data",
            r"https://www.investing.com/indices/stoxx-50-volatility-vstoxx-eur-historical-data",
            r"https://www.investing.com/indices/hsi-volatility-historical-data",
            r"https://www.investing.com/indices/cboe-china-etf-volatility-historical-data",
        ]:

            pretty.color_print(
                colors.PAPER_CYAN_300,
                f"downloading: {url.split('/')[-1].split('-')[0]}",
            )

            yield url

    def rename(self) -> None:

        table = {
            "Nikkei Volatility Historical Data.csv": "jniv",
            "STOXX 50 Volatility VSTOXX EUR Historical Data.csv": "vstx",
            "HSI Volatility Historical Data.csv": "vhsi",
            "CBOE China Etf Volatility Historical Data.csv": "vxfxi",
        }

        for fs in os.listdir(self._src):
            symbol = table.get(fs, None)
            if symbol is None:
                continue

            src = os.path.join(self._src, fs)
            tar = os.path.join(self._tar, "investing.com", f"{symbol}.csv")

            assert os.path.exists(os.path.dirname(tar))

            pretty.color_print(
                colors.PAPER_DEEP_PURPLE_200, f"move file: {src} => {tar}"
            )

            os.rename(src, tar)

    def check(self) -> None:
        pass

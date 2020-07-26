from typing import Iterable

from processor import Processor


class StockChartsProcessor(Processor):
    def __init__(self) -> None:
        super().__init__()

        self._symbols = [
            "$rvx",
            # "$tyvix",
            "$vle",
            "$nahilo",
            "$nyhilo",
            "$spxhilo",
            "$ndxhilo",
            "$nikk",
            "$hsi",
            "ezu",
            "eem",
            "fxi",
            # "!ryratmm",
        ]

    def _urls(self) -> Iterable[str]:
        for symbol in self._symbols:
            yield f"https://stockcharts.com/h-hd/?{symbol}"

    def rename(self) -> None:
        pass

    def check(self) -> None:
        pass

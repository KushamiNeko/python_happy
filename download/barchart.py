import os
import re
from datetime import datetime
from typing import Iterable, NewType, Optional

from fun.futures.contract import (
    ALL_CONTRACT_MONTHS,
    CONTRACT_MONTHS,
    EVEN_CONTRACT_MONTHS,
    FINANCIAL_CONTRACT_MONTHS,
)
from fun.utils import colors, pretty
from processor import Processor

BARCHART_PAGE = NewType("BARCHART_PAGE", int)
HISTORICAL_PAGE = BARCHART_PAGE(0)
INTERACTIVE_PAGE = BARCHART_PAGE(1)


class BarchartProcessor(Processor):
    def __init__(
        self,
        start_year: Optional[int] = None,
        end_year: Optional[int] = None,
        page: BARCHART_PAGE = HISTORICAL_PAGE,
    ) -> None:
        super().__init__()

        assert page in (HISTORICAL_PAGE, INTERACTIVE_PAGE)

        self._page = page

        if start_year is None or end_year is None:
            self._start = datetime.now().year

            if datetime.now().month > 10:
                self._end = datetime.now().year + 1
            else:
                self._end = datetime.now().year
        else:
            self._start = start_year
            self._end = end_year

        pretty.color_print(
            colors.PAPER_BROWN_300,
            f"Barchart Processor\nstart year: {self._start}, end year: {self._end}",
        )

        self._symbols = [
            "es",
            "nq",
            "qr",
            "fx",
            "nl",
            "np",
            "no",
            "zn",
            "ge",
            "gg",
            "tj",
            "dx",
            "e6",
            "j6",
            "cl",
            "gc",
        ]

    def _urls(self) -> Iterable[str]:
        months: CONTRACT_MONTHS
        for symbol in self._symbols:
            if symbol == "cl":
                months = ALL_CONTRACT_MONTHS
            elif symbol == "gc":
                months = EVEN_CONTRACT_MONTHS
            else:
                months = FINANCIAL_CONTRACT_MONTHS

            for y in range(self._start, self._end + 1):
                for m in months:
                    code = f"{symbol}{m}{y%100:02}"

                    pretty.color_print(colors.PAPER_CYAN_300, f"downloading: {code}")

                    if self._page == HISTORICAL_PAGE:
                        yield f"https://www.barchart.com/futures/quotes/{code}/historical-download"
                    elif self._page == INTERACTIVE_PAGE:
                        yield f"https://www.barchart.com/futures/quotes/{code}/interactive-chart"
                    else:
                        raise ValueError("unknown barchart page")

                input()

    def rename(self) -> None:
        for fs in os.listdir(self._src):
            match = re.match(
                r"^([\w\d]{5})_([^_-]+)(?:-[^_-]+)*_[^_-]+-[^_-]+-\d{2}-\d{2}-\d{4}.csv$",
                fs,
            )
            if match is None:
                match = re.match(
                    r"^([\w\d]{5})_[^_]+_[^_]+_[^_]+_([^_]+)(?:_[^_]+)*_\d{2}_\d{2}_\d{4}.csv$",
                    fs,
                )

                if match is None:
                    continue

            if match is not None:
                code = match.group(1).lower()

                src = os.path.join(self._src, fs)
                tar = os.path.join(self._tar, "continuous", code[:2], f"{code}.csv")

                assert os.path.exists(os.path.dirname(tar))

                pretty.color_print(
                    colors.PAPER_DEEP_PURPLE_300, f"move file: {src} => {tar}"
                )

                os.rename(src, tar)

    def check(self) -> None:
        months: CONTRACT_MONTHS
        for symbol in self._symbols:
            if symbol == "cl":
                months = ALL_CONTRACT_MONTHS
            elif symbol == "gc":
                months = EVEN_CONTRACT_MONTHS
            else:
                months = FINANCIAL_CONTRACT_MONTHS

            for y in range(self._start, self._end + 1):
                for m in months:
                    code = f"{symbol}{m}{y%100:02}"

                    tar = os.path.join(self._tar, "continuous", code[:2], f"{code}.csv")

                    if not os.path.exists(tar):
                        pretty.color_print(
                            colors.PAPER_PINK_300, f"missing files: {tar}"
                        )

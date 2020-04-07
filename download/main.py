import argparse
import re
from datetime import datetime
from typing import Any, Dict, List, cast, Tuple

from barchart import BarchartProcessor
from stockcharts import StockChartsProcessor
from fun.utils import colors, pretty
from investing import InvestingProcessor
from processor import Processor
from yahoo import YahooProcessor


def args_parse() -> Dict[str, Any]:

    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--operations",
        metavar="",
        nargs="*",
        default=["download", "rename"],
        choices=["download", "rename", "check"],
        help="operations",
    )

    parser.add_argument(
        "--years",
        metavar="",
        nargs="?",
        # const=f"{datetime.now().year}",
        # default=f"{datetime.now().year}",
        type=str,
        help="years",
    )

    args = vars(parser.parse_args())

    assert args.get("operations") is not None
    # assert args.get("years") is not None
    # assert re.match(r"^(\d{4})(?:(?:\-|\~)(\d{4}))*$", years) is not None

    pretty.color_print(
        colors.PAPER_ORANGE_200,
        f"operations input: {', '.join(cast(List[str],args.get('operations')))}",
    )

    pretty.color_print(colors.PAPER_ORANGE_200, f"years input: {args.get('years')}")

    return args


def parse_years_input(years: str) -> Tuple[int, int]:
    match = re.match(r"^(\d{4})(?:(?:\-|\~)(\d{4}))*$", years)

    assert match is not None

    start = match.group(1)
    end = match.group(2)

    if end is None or end == "":
        end = start

    return int(start), int(end)


if __name__ == "__main__":

    args = args_parse()

    ops = args.get("operations")
    assert ops is not None
    assert len(ops) != 0

    years = args.get("years", None)

    start = None
    end = None
    if years is not None:
        start, end = parse_years_input(years)

    ps = [
        BarchartProcessor(start_year=start, end_year=end),
        YahooProcessor(),
        InvestingProcessor(),
        StockChartsProcessor(),
    ]

    for p in ps:
        if "download" in ops:
            p.download()
        if "rename" in ops:
            p.rename()
        if "check" in ops:
            p.check()

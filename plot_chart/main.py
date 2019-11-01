import argparse
import os
import re
import time
from datetime import datetime
from multiprocessing import Process
from typing import List, Optional, cast

import pandas as pd

import fun.trading.indicator as ind
from fun.chart.static import StaticChart
from fun.trading.agent import Agent
from fun.trading.source import AlphaVantage, Barchart, DataSource, Yahoo
from fun.utils import colors, pretty


def plot_chart(
    symbol: str, year: int, show_records: bool, outdir: Optional[str], version: int
) -> None:

    src: DataSource
    chart_type: str
    f: str

    match = re.match(r"^([a-zA-Z]+)([fghjkmnquvxz][0-9]+)?$", symbol)
    assert match is not None
    assert match.group(1) is not None

    if match.group(2) is not None:
        src = Barchart()
        chart_type = "f"
    else:
        src = Yahoo()
        chart_type = "f"

    assert chart_type in ("f", "s")

    e = datetime.strptime(f"{year+1}0101", "%Y%m%d")

    agent = Agent("aa")
    ts = agent.read_records(match.group(1), year, version)
    if not show_records:
        ts = None

    ps: List[Process] = []

    for freq in ("d", "w"):
        s: datetime
        if freq == "d":
            s = datetime.strptime(f"{year}0101", "%Y%m%d")
        if freq == "w":
            s = datetime.strptime(f"{year-3}0101", "%Y%m%d")

        df = src.read(s, e, symbol, freq)

        df = ind.my_simple_moving_average(df)
        if chart_type == "s":
            df = ind.my_simple_moving_average_extend(df)

        df = ind.my_bollinger_bands(df)

        c = StaticChart(df[s:e])

        path = f"{year}_{match.group(1)}_{freq}.png"
        if outdir is not None:
            assert os.path.exists(outdir)
            path = os.path.join(outdir, path)

        args = (path, ts)

        p = None

        if chart_type == "f":
            p = Process(target=c.futures_price, args=args)
        if chart_type == "s":
            p = Process(target=c.stocks_price, args=args)

        assert p is not None

        p.start()
        ps.append(p)

    for p in ps:
        p.join()


def main() -> None:

    parser = argparse.ArgumentParser()

    parser.add_argument("--symbols", metavar="", nargs="+", type=str, help="symbols")

    parser.add_argument("--year", metavar="", type=str, help="the year of the chart")

    parser.add_argument(
        "--version",
        metavar="",
        type=int,
        nargs="?",
        const=1,
        default=1,
        help="the version of the records",
    )

    parser.add_argument("--outdir", metavar="", type=str, help="output folder")

    parser.add_argument(
        "--records",
        metavar="",
        type=bool,
        nargs="?",
        const=True,
        default=False,
        help="whether to show trading records on the chart",
    )

    args = vars(parser.parse_args())

    assert args.get("symbols") is not None
    assert args.get("year") is not None
    assert args.get("version") is not None
    assert args.get("records") is not None

    symbols = cast(str, args.get("symbols"))
    year = cast(str, args.get("year"))
    version = cast(int, args.get("version"))
    show_records = args.get("records", False)
    outdir = args.get("outdir")

    for symbol in symbols:
        match = re.match(r"^([a-zA-Z]+)([fghjkmnquvxz][0-9]+)?$", symbol)
        if match is None:
            pretty.color_print(colors.PAPER_RED_400, f"invaid symbol: {symbol}")
            exit(1)

    start: str
    end: str

    match = re.match(r"^(\d{4})(?:-|~)?(\d{4})?$", year)
    if match is None:
        pretty.color_print(colors.PAPER_RED_400, f"invaid year: {year}")
        exit(1)
    else:
        start = match.group(1)
        end = match.group(2)

    assert start is not None

    if version < 0:
        pretty.color_print(colors.PAPER_RED_400, f"invalid version: {version}")
        exit(1)

    assert version >= 0

    pretty.color_print(colors.PAPER_INDIGO_300, f"symbols: {', '.join(symbols)}")
    pretty.color_print(colors.PAPER_INDIGO_300, f"year: {year}")
    pretty.color_print(colors.PAPER_INDIGO_300, f"version: {version}")
    pretty.color_print(colors.PAPER_INDIGO_300, f"records: {show_records}")
    pretty.color_print(colors.PAPER_INDIGO_300, f"outdir: {outdir}")

    pretty.color_print(colors.PAPER_AMBER_300, "chart plotting start...")
    process_start = time.time()

    ps: List[Process] = []

    for symbol in symbols:
        if end is None:
            p = Process(
                target=plot_chart,
                args=(symbol, int(start), show_records, outdir, version),
            )
            p.start()
            ps.append(p)
        else:
            for i in range(int(start), int(end) + 1):
                p = Process(
                    target=plot_chart, args=(symbol, i, show_records, outdir, version)
                )
                p.start()
                ps.append(p)

    for p in ps:
        p.join()

    process_end = time.time()
    length = process_end - process_start

    pretty.color_print(colors.PAPER_AMBER_300, "chart plotting completed!!!")
    pretty.color_print(colors.PAPER_AMBER_300, f"processing time: {length} seconds")


if __name__ == "__main__":
    main()

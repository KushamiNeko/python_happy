from __future__ import annotations

import argparse
import os
import re

import cv2
import numpy as np

import config
from chart import Charts
from cover import Cover


def main():

    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--symbols",
        metavar="",
        type=str,
        nargs="+",
        help="symbols to compare",
    )

    parser.add_argument(
        "--year",
        metavar="",
        type=str,
        help="year of the chart",
    )

    parser.add_argument(
        "--period",
        metavar="",
        type=str,
        help="chart period",
    )

    parser.add_argument(
        "--records",
        metavar="",
        type=bool,
        nargs="?",
        const=True,
        default=False,
        help="show records",
    )

    args = vars(parser.parse_args())

    symbols = args.get("symbols", None)
    if symbols is None:
        print("invalid symbols")
        exit(1)

    if len(symbols) < 2:
        print("need at least 2 symbols")
        exit(1)

    regex = re.compile(r"\d{4}", re.MULTILINE)

    y = args.get("year", None)
    if y is None or not regex.match(y):
        print("invalid year")
        exit(1)

    regex = re.compile("h|d|w|m", re.MULTILINE)

    p = args.get("period", None)
    if p is None or not regex.match(p):
        print("invalid period")
        exit(1)

    records = args.get("records", False)

    charts = Charts(symbols, y, p, records=records)
    cover = Cover(charts.studying.image.shape, config.COVER_COLOR)

    cv2.namedWindow("Chart")
    cv2.setWindowTitle("Chart", os.path.basename(charts.studying.file_path))
    cv2.setMouseCallback("Chart", Cover.draw, cover)

    while True:
        k = cv2.waitKey(1) & 0xFF

        if k == 27:
            break

        if k >= 49 and k <= 57:
            i = k - 49

            if i >= charts.length:
                i = charts.length - 1

            charts.set_studying_with_index(i)
            cv2.setWindowTitle("Chart",
                               os.path.basename(charts.studying.file_path))

        studying_symbol = charts.studying.symbol

        new_period = None

        if k == 100:
            new_period = "d"
        elif k == 119:
            new_period = "w"
        elif k == 109:
            # new_period = "m"
            pass
        elif k == 104:
            # new_period = "h"
            pass

        if new_period:
            charts = Charts(symbols,
                            charts.studying.year,
                            new_period,
                            records=records)

        new_year = None

        if k == 44:
            new_year = charts.studying.year - 1
        if k == 46:
            new_year = charts.studying.year + 1

        if new_year:
            if new_year < config.START_YEAR:
                new_year = config.START_YEAR
            elif new_year > config.END_YEAR:
                new_year = config.END_YEAR

            charts = Charts(symbols,
                            new_year,
                            charts.studying.period,
                            records=records)

        if new_period or new_year:
            charts.set_studying_with_symbol(studying_symbol)
            cv2.setWindowTitle("Chart",
                               os.path.basename(charts.studying.file_path))

        if cv2.getWindowProperty("Chart", cv2.WND_PROP_VISIBLE) < 1:
            break

        display = np.zeros(charts.studying.image.shape, np.uint8)
        cv2.subtract(charts.studying.image, cover.image, display)

        cv2.imshow("Chart", display)

    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()

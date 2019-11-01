import os

import cv2

import config
import utils


class Chart:
    def __init__(self, symbol, year, period, file_path, image):
        self._symbol = symbol
        self._year = year
        self._period = period
        self._file_path = file_path
        self._image = image

    @property
    def symbol(self):
        return self._symbol

    @property
    def year(self):
        return int(self._year)

    @property
    def period(self):
        return self._period

    @property
    def file_path(self):
        return self._file_path

    @property
    def image(self):
        return self._image


class Charts:
    def __init__(self, symbols, year, period, records=False):

        if len(symbols) == 0:
            raise ValueError("empty symbols")

        self._symbols = symbols
        self._year = year
        self._period = period
        self._records = records

        self._charts = []
        self._studying = None

        self._get_charts()

        if records:
            self._get_records

    @property
    def length(self):
        return len(self._charts)

    @property
    def studying(self):
        return self._studying

    def set_studying_with_index(self, index):
        self._studying = self._charts[index]

    def set_studying_with_symbol(self, symbol):
        for chart in self._charts:
            if chart.symbol == symbol:
                self._studying = chart

    def _get_charts(self):

        for i, symbol in enumerate(self._symbols):
            path = utils.full_path(config.ROOT, symbol, self._year,
                                   self._period)
            if not os.path.exists(path):
                raise ValueError("invalid symbol: {}".format(symbol))

            chart = cv2.imread(path)
            chart = cv2.resize(chart, config.SIZE)

            self._charts.append(
                Chart(symbol, self._year, self._period, path, chart))

        self._studying = self._charts[0]

    def _get_records(self):
        for symbol in self._symbols:
            s = utils.full_symbol_name(symbol)
            p = utils.full_period(self._period)

            records_root = os.path.join(config.ROOT_RECORDS, s, p)

            if not os.path.exists(records_root):
                continue

            files = os.listdir(records_root)

            files.sort()

            for f in files:
                if "{}_{}_{}".format(self._year, s, self._period) in f:
                    path = os.path.join(records_root, f)

                    chart = cv2.imread(path)
                    chart = cv2.resize(chart, config.SIZE)

                    self._charts.append(
                        Chart(symbol, self._year, self._period, path, chart))

import subprocess
import re

INTERACTIVE = r"https://www.barchart.com/futures/quotes/%s/interactive-chart"
HISTORICAL = r"https://www.barchart.com/futures/quotes/%s/historical-download"

HISTORICAL_PATTERN = (
    r"^([\w\d]{5})_([^_-]+)(?:-[^_-]+)*_[^_-]+-[^_-]+-\d{2}-\d{2}-\d{4}.csv$"
)
INTERACTIVE_PATTERN = (
    r"^([\w\d]{5})_[^_]+_[^_]+_[^_]+_([^_]+)(?:_[^_]+)*_\d{2}_\d{2}_\d{4}.csv$"
)

INVESTING_VSTX = (
    r"https://www.investing.com/indices/stoxx-50-volatility-vstoxx-eur-historical-data"
)

INVESTING_JNIV = r"https://www.investing.com/indices/nikkei-volatility-historical-data"

YAHOO = r"https://finance.yahoo.com/quote/%5EVIX/history?period1=631152000&period2=1585267200&interval=1d&filter=history&frequency=1d"

from barchart import BarchartProcessor
from investing import InvestingProcessor
from processor import Processor
from yahoo import YahooProcessor

if __name__ == "__main__":
    p: Processor

    p = BarchartProcessor()
    p.process()

    p = YahooProcessor()
    p.process()

    p = InvestingProcessor()
    p._rename()

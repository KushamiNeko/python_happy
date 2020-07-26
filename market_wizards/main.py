from flask import Flask
from flask_cors import cross_origin

from handlers.chart import ChartHandler
from handlers.trade import TradeHandler

app = Flask(__name__)


@app.route("/")
def welcome():
    return "welcome to the market wizards charts reader api"


@app.route("/service/chart", methods=["GET"])
@cross_origin(allow_headers=["Content-Type"])
def chart():
    try:
        return ChartHandler().response()
    except (ValueError, IndexError, NotImplementedError) as err:
        return {"error": f"{type(err)}: {err}"}


@app.route("/service/trade/order", methods=["GET", "POST", "DELETE"])
@cross_origin(allow_headers=["Content-Type"])
def trade_order():
    return TradeHandler().response_order()


@app.route("/service/trade/statistic", methods=["GET"])
@cross_origin(allow_headers=["Content-Type"])
def trade_statistic():
    return TradeHandler().response_statistic()


if __name__ == "__main__":
    app.run(debug=True, threaded=True)

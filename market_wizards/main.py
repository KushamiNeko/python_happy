from flask import Flask
from flask_cors import cross_origin

from handlers.chart import ChartHandler
from handlers.trade import TradeHandler

app = Flask(__name__)


@app.route("/")
def welcome():
    return "welcome to the market wizards charts reader api"


# @app.route("/view/practice")
# def practice_view():
# return minify.minifyWebString(render_template("views/practice/view.html"))


@app.route("/service/chart", methods=["GET"])
@cross_origin(allow_headers=["Content-Type"])
def chart():
    return ChartHandler().response()


@app.route("/service/trade", methods=["GET", "POST"])
@cross_origin(allow_headers=["Content-Type"])
def trade():
    return TradeHandler().response()


if __name__ == "__main__":
    app.run(debug=True, threaded=True)

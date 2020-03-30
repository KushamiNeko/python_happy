from flask import Flask
from flask_cors import cross_origin

from handlers.plot import PlotHandler

app = Flask(__name__)


@app.route("/")
def welcome():
    return "welcome to the market wizards charts reader api"


# @app.route("/view/practice")
# def practice_view():
# return minify.minifyWebString(render_template("views/practice/view.html"))


@app.route("/service/chart")
@cross_origin(allow_headers=["Content-Type"])
def plot():
    return PlotHandler().response()


if __name__ == "__main__":
    app.run(debug=True, threaded=True)

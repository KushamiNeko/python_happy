from flask import Flask, render_template, request

from fun.utils import minify
from handlers.plot import PlotHandler

app = Flask(__name__)


@app.route("/")
def welcome():
    return "welcome to the market wizards charts reader api"


@app.route("/view/practice")
def practice_view():
    return minify.minifyWebString(render_template("views/practice/view.html"))
    # return render_template("views/practice/view.html")


@app.route("/practice/<path:params>")
def plot(params: str):
    return PlotHandler(request.path).response()


if __name__ == "__main__":
    app.run(debug=True)

from flask import Flask, render_template, request
from flask_cors import cross_origin

# from fun.utils import minify
from handlers.plot import PlotHandler

app = Flask(__name__)


@app.route("/")
def welcome():
    return "welcome to the market wizards charts reader api"


# @app.route("/view/practice")
# def practice_view():
    # return minify.minifyWebString(render_template("views/practice/view.html"))
    # return render_template("views/practice/view.html")


@app.route("/service/chart")
# @app.route("/service/plot/practice")
@cross_origin(allow_headers=['Content-Type'])
def plot():
    print("plot")
    return PlotHandler().response()


if __name__ == "__main__":
    app.run(debug=True, threaded=True)
    # app.run(debug=True)

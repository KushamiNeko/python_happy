from flask import Flask, render_template, request

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
def plot():
    print("plot")
    # print(request.args.get("user"))
    return PlotHandler().response()
    # return "hello world"


if __name__ == "__main__":
    app.run(debug=True, threaded=True)
    # app.run(debug=True)

import os

import config


def full_path(root, symbol, year, period):
    s = full_symbol_name(symbol)
    p = full_period(period)

    return os.path.join(root, s, p, "{}_{}_{}.png".format(year, s, period))


def full_symbol_name(symbol):
    if symbol == "rus":
        return config.RUS
    elif symbol == "spx":
        return config.SPX
    else:
        raise ValueError("invalid symbol: {}".format(symbol))


def full_period(period):
    if period == "h":
        return "hourly"
    elif period == "d":
        return "daily"
    elif period == "w":
        return "weekly"
    elif period == "m":
        return "monthly"
    else:
        raise ValueError("invalid period: {}".format(period))

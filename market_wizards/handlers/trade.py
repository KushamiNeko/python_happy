# import io
# import base64
# import re
import os

# from datetime import datetime, timedelta
from typing import Any, cast

# import pandas as pd
from flask import request, send_file

from fun.trading.agent import TradingAgent

# from fun.data.source import HOURLY, DAILY, WEEKLY, MONTHLY, FREQUENCY


class TradeHandler:
    def _new_record(self) -> None:
        root = os.path.join(
            cast(str, os.getenv("HOME")), "Documents", "database", "testing", "json"
        )

        entity = request.get_json()
        agent = TradingAgent(root=root, new_user=True)
        ts = agent.new_record(entity["book"], entity, new_book=True)

        print(ts)

    def response(self) -> Any:
        print(request.method)
        if request.method == "POST":
            self._new_record()
        return "hello"

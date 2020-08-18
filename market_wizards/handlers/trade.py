import os
import re
from typing import Any, Dict, List, cast, Tuple

from flask import request
from fun.trading.agent import TradingAgent

_ROOT = os.path.join(
    cast(str, os.getenv("HOME")), "Documents", "database", "testing", "json"
)


class TradeHandler:
    def _long_short_trading_adjustment(
        self,
        agent: TradingAgent,
        entity: Dict[str, str],
        allow_negative_leverage: bool = False,
    ) -> Dict[str, str]:
        # agent = TradingAgent(root=_ROOT, new_user=True)

        title = entity["book"]
        # side = entity["side"]
        account = entity["account"]
        # book = f"{title}_{side}"
        book = f"{title}_{account}"

        entity["book"] = book

        # open_leverage = agent.open_positions_leverage(title=book)
        # if open_leverage is None:
        #     open_leverage = 0

        # if side == "short":
        #     open_leverage *= -1
        #     if entity["operation"] == "+":
        #         entity["operation"] = "-"
        #     else:
        #         entity["operation"] = "+"

        # if not allow_negative_leverage:
        #     leverage = float(f"{entity['operation']}{entity['leverage']}")
        #     if (side == "long" and open_leverage + leverage < 0) or (
        #         side == "short" and open_leverage + leverage > 0
        #     ):
        #         raise ValueError("invalid leverage")

        return entity

    def _long_short_entity_adjustment(
        self, entities: List[Dict[str, str]]
    ) -> List[Dict[str, str]]:
        # for entity in entities:
        #     if entity["side"] == "short":
        #         if entity["operation"] == "-":
        #             entity["operation"] = "+"
        #         else:
        #             entity["operation"] = "-"

        return entities

    def _new_market_order(self) -> Dict[str, str]:
        entity = request.get_json()
        agent = TradingAgent(root=_ROOT, new_user=True)

        # title = entity["book"]
        # side = entity["side"]
        # book = f"{title}_{side}"

        # open_leverage = agent.open_positions_leverage(title=book)
        # if open_leverage is None:
        #     open_leverage = 0

        # if side == "short":
        #     open_leverage *= -1
        #     if entity["operation"] == "+":
        #         entity["operation"] = "-"
        #     else:
        #         entity["operation"] = "+"

        # leverage = float(f"{entity['operation']}{entity['leverage']}")
        # if (side == "long" and open_leverage + leverage < 0) or (
        #     side == "short" and open_leverage + leverage > 0
        # ):
        #     raise ValueError("invalid leverage")

        entity = self._long_short_trading_adjustment(agent=agent, entity=entity)

        # ts = agent.new_record(book, entity, new_book=True)
        ts = agent.new_record(entity["book"], entity, new_book=True)

        return ts.to_entity()

    def _new_stop_order(self) -> Dict[str, List[Dict[str, str]]]:
        entity = request.get_json()
        agent = TradingAgent(root=_ROOT, new_user=True)

        entity = self._long_short_trading_adjustment(agent=agent, entity=entity)

        agent.new_order(entity)

        # return {"data": [o.to_entity() for o in agent.read_orders()]}
        return self._read_stop_orders()

    def _delete_stop_order(self) -> Dict[str, List[Dict[str, str]]]:
        index = request.args.get("index")
        if index is None or index == "":
            raise ValueError("invalid order index")

        if re.match(r"^\d+$", index) is None:
            raise ValueError("invalid order index")

        assert index is not None and len(index) > 0

        agent = TradingAgent(root=_ROOT, new_user=True)
        agent.delete_order(int(index))

        return self._read_stop_orders()

    def _read_stop_orders(self) -> Dict[str, List[Dict[str, str]]]:
        agent = TradingAgent(root=_ROOT, new_user=True)
        entities = [o.to_entity() for o in agent.read_orders()]

        entities = self._long_short_entity_adjustment(entities)

        return {"data": entities}
        # return {"data": [o.to_entity() for o in agent.read_orders()]}

    def _statistic(self) -> Dict[str, str]:
        pass

    def response_order(self) -> Any:

        if request.method == "POST":

            order = request.args.get("order")
            assert order in ("market", "stop")

            if order == "market":
                return self._new_market_order()
            elif order == "stop":
                return self._new_stop_order()
            else:
                raise ValueError(f"invalid order type {order}")

        elif request.method == "GET":
            return self._read_stop_orders()

        elif request.method == "DELETE":
            return self._delete_stop_order()

        else:
            return "invalid method"

    def response_statistic(self) -> Any:
        function = request.args.get("function")
        assert function in ("books", "statistic")

        if function == "books":
            agent = TradingAgent(root=_ROOT, new_user=True)
            books = agent.books()
            if books is None or len(books) == 0:
                return {"data": []}
            else:
                return {"data": [b.to_entity()["title"] for b in books]}

        elif function == "statistic":
            titles = request.args.get("titles", None)
            assert titles is not None

            titles = titles.split(",")
            agent = TradingAgent(root=_ROOT, new_user=True)
            return agent.read_statistic(titles)

        else:
            return "invalid function"

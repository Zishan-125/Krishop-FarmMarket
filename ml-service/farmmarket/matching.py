"""Demand matching: optimal assignment of farmer lots to buyer orders.

Maximises total farmer-and-buyer surplus net of freight and spoilage using the Hungarian
algorithm (scipy.optimize.linear_sum_assignment). Hard constraints: same crop, quality
grade >= buyer minimum, quantity coverage >= `min_fill`. Returns the matches plus the
unmatched lots/orders so the UI can show unmet demand (a signal for what to plant next).
"""
import numpy as np
from scipy.optimize import linear_sum_assignment

from . import config
from .geo import road_km

GRADE_RANK = {"C": 1, "B": 2, "A": 3}
INFEASIBLE = 1e9


def match(lots: list[dict], orders: list[dict], min_fill: float = 0.5) -> dict:
    if not lots or not orders:
        return {"matches": [], "unmatched_lots": [l["id"] for l in lots],
                "unmatched_orders": [o["id"] for o in orders], "total_surplus": 0.0}
    L, O = len(lots), len(orders)
    cost = np.full((L, O), INFEASIBLE)
    detail = {}
    for i, lot in enumerate(lots):
        for j, od in enumerate(orders):
            if lot["crop"] != od["crop"]:
                continue
            if GRADE_RANK.get(lot.get("grade", "B"), 2) < GRADE_RANK.get(od.get("min_grade", "C"), 1):
                continue
            qty = min(lot["quantity_kg"], od["quantity_kg"])
            if qty < min_fill * od["quantity_kg"]:
                continue
            km = road_km(lot["coords"], od["coords"]) if "coords" in lot and "coords" in od else 0.0
            freight = km * config.COST_PER_KM_PER_KG
            transit_days = km / config.AVG_SPEED_KMH / 24
            shelf = config.SHELF_LIFE_DAYS[lot["crop"]]
            spoil = min(0.95, (transit_days / shelf) ** 1.5 * 0.35)
            # buyer pays up to bid; farmer needs >= ask. Surplus is bid - ask (trade gain)
            # minus real costs. Negative => no deal.
            unit_surplus = od["bid_per_kg"] * (1 - spoil) - lot["ask_per_kg"] - freight
            if unit_surplus <= 0:
                continue
            total = unit_surplus * qty
            cost[i, j] = -total
            detail[(i, j)] = {"qty": qty, "km": round(km, 1), "freight": round(freight, 2),
                              "unit_surplus": round(unit_surplus, 2), "total_surplus": round(total, 2),
                              "price": round((od["bid_per_kg"] + lot["ask_per_kg"]) / 2, 2)}
    rows, cols = linear_sum_assignment(cost)
    matches, used_l, used_o = [], set(), set()
    for i, j in zip(rows, cols):
        if cost[i, j] >= INFEASIBLE:
            continue
        d = detail[(i, j)]
        used_l.add(i); used_o.add(j)
        matches.append({"lot_id": lots[i]["id"], "order_id": orders[j]["id"],
                        "crop": lots[i]["crop"], "settle_price_per_kg": d["price"], **{k: d[k] for k in ("qty", "km", "freight", "unit_surplus", "total_surplus")}})
    return {
        "matches": matches,
        "unmatched_lots": [lots[i]["id"] for i in range(L) if i not in used_l],
        "unmatched_orders": [orders[j]["id"] for j in range(O) if j not in used_o],
        "total_surplus": round(sum(m["total_surplus"] for m in matches), 2),
    }

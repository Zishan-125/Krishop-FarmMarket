"""Fair-price engine on real national prices.

Because the dataset has no market location, every hub sees the same national price: shipping can never
create price arbitrage by itself (it only costs freight). What the data DOES support, and what this module
optimises, is TIMING and QUALITY:
  net(day) = price(day) * quality * (1 - spoilage(day)) - freight
  * `day 0` is the latest observed level; later days use the selected forecast model.
  * The farmer's ask is floored by a data-driven price floor (P20 of the last year) and, if given, the
    farmer's own cost of production + 10%.
  * Seasonality and the retail/wholesale spread give context on how much better another month would be."""
import json
import os
from functools import lru_cache

from . import analytics, config, forecast
from .geo import road_km


def _spoil(crop, days_wait, transit_h):
    shelf = config.SHELF_LIFE_DAYS[crop]
    return min(0.95, (((days_wait) + transit_h / 24) / shelf) ** 1.5 * 0.35)


@lru_cache(maxsize=1)
def _uplift():
    p = os.path.join(config.MODEL_DIR, "uplift.json")
    return json.load(open(p)) if os.path.exists(p) else {}


def timing_enabled(crop: str) -> tuple[bool, str]:
    """'Wait' advice is only given for crops where the point-in-time replay showed a positive average gain whose
    95% interval excludes zero. Otherwise the app says sell now, because the evidence does not support waiting.
    (The gate is chosen on the same two-year replay it is reported on, so treat the gain as somewhat optimistic.)"""
    r = _uplift().get("crops", {}).get(crop)
    if not r:
        return False, "no replay evidence yet (run python -m farmmarket.uplift)"
    if r["mean_uplift_pct"] > 0 and r["ci95_pct"][0] > 0:
        return True, f"replay: {r['mean_uplift_pct']:+.2f}% average gain (95% CI {r['ci95_pct'][0]} to {r['ci95_pct'][1]})"
    return False, f"replay shows no reliable gain from waiting ({r['mean_uplift_pct']:+.2f}%, 95% CI {r['ci95_pct'][0]} to {r['ci95_pct'][1]}), so the app advises selling today"


def choose(crop, prices, lows, transit_h=0.0, freight=0.0, quality=1.0, gate=1.0, highs=None, allow_wait=True):
    """Pure decision rule. prices/lows: index 0 = price today, i = forecast i days ahead.
    Returns (options, best). Waiting must beat selling now by more than 25% of that day's error band."""
    opts = []
    highs = highs or prices
    for d, (p, lo, hi) in enumerate(zip(prices, lows, highs)):
        loss = _spoil(crop, d, transit_h)
        net = lambda v: v * gate * quality * (1 - loss) - freight
        opts.append({"wait_days": d, "gross_price": float(p), "spoilage_pct": round(loss * 100, 1),
                     "net_per_kg": float(net(p)), "net_per_kg_low": float(net(lo)), "net_per_kg_high": float(net(hi))})
    base = opts[0]
    best = max(opts, key=lambda o: o["net_per_kg"])
    if best["wait_days"] > 0 and (not allow_wait or best["net_per_kg"] - base["net_per_kg"] < (best["gross_price"] - best["net_per_kg_low"]) * 0.25):
        best = base
    return opts, best


def recommend(crop, origin_hub, quantity_kg, quality_factor=1.0, destination_hub=None, cost_per_kg=None,
              horizon=14, price_type="wholesale"):
    fc = forecast.forecast(crop, price_type, horizon)
    km = road_km(config.HUBS[origin_hub], config.HUBS[destination_hub or origin_hub])
    freight = km * config.COST_PER_KM_PER_KG
    transit_h = km / config.AVG_SPEED_KMH
    gate = 1 - config.FARM_GATE_DISCOUNT
    prices = [fc["last_price"]] + [x["price"] for x in fc["forecast"]]
    lows = [fc["last_price"]] + [x["low"] for x in fc["forecast"]]
    dates = [fc["data_through"]] + [x["date"] for x in fc["forecast"]]
    highs = [fc["last_price"]] + [x["high"] for x in fc["forecast"]]
    allowed, why = timing_enabled(crop)
    opts, best = choose(crop, prices, lows, transit_h, freight, quality_factor, gate, highs, allow_wait=allowed)
    for o, d in zip(opts, dates):
        o["date"] = d
        for k in ("gross_price", "net_per_kg", "net_per_kg_low", "net_per_kg_high"):
            o[k] = round(o[k], 2)
    best = opts[best["wait_days"]]
    base = opts[0]
    floor_market = analytics.price_floor(crop, price_type)
    floor_cost = round(cost_per_kg * 1.10, 2) if cost_per_kg else None
    # The ask follows the market; only the farmer's own cost (+10%) can lift it. The 365-day P20 is a reference
    # level, used to flag when today's price is unusually low (hold if the crop stores well).
    ask = max(floor_cost or 0, round(best["gross_price"] * quality_factor * 0.97, 2))
    depressed = fc["last_price"] < floor_market
    seas = analytics.seasonality(crop, price_type)
    spr = analytics.spread(crop)
    uplift = best["net_per_kg"] - base["net_per_kg"]
    return {
        "crop": crop, "price_type": price_type, "origin_hub": origin_hub, "destination_hub": destination_hub or origin_hub,
        "quantity_kg": quantity_kg, "quality_factor": quality_factor, "model": fc["model"],
        "data_through": fc["data_through"], "data_stale_days": fc["stale_days"], "last_obs_warning": fc["last_obs_warning"], "backtest": fc["backtest"],
        "floor": {"market_p20_365d": floor_market, "cost_based": floor_cost, "price_is_depressed": depressed,
                  "shelf_life_days": config.SHELF_LIFE_DAYS[crop]},
        "recommended_ask_per_kg": ask, "best": best, "baseline_sell_now": base,
        "uplift_per_kg": round(uplift, 2), "extra_income_total": round(uplift * quantity_kg, 2),
        "action": "sell_now" if best["wait_days"] == 0 else "hold_then_sell",
        "seasonality": {"best_month": seas["best_month"], "best_index": seas["best_index"], "worst_month": seas["worst_month"], "swing_pct": seas["swing_pct"]},
        "retail_context": {"wholesale_share_pct": spr["wholesale_share_pct"], "margin_per_kg": spr["margin_per_kg"]},
        "freight_per_kg": round(freight, 2), "options": opts,
        "timing": {"wait_advice_enabled": allowed, "evidence": why},
        "caveat": "Wholesale price is used as a farm-gate proxy. Prices are national (the dataset has no market location).",
    }

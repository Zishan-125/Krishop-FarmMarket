"""Descriptive market analytics computed directly from the real data."""
import numpy as np
import pandas as pd

from . import forecast

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def seasonality(crop: str, price_type: str = "wholesale") -> dict:
    """Monthly price index (1.00 = typical level): price / centred 365-day mean, averaged by calendar month.
    Needs a full year around each point, so the first/last ~6 months of data are excluded."""
    s = forecast.series(crop, price_type)
    ratio = (s / s.rolling(365, center=True, min_periods=300).mean()).dropna()
    by_m = ratio.groupby(ratio.index.month).agg(["mean", "std", "count"])
    idx = [round(float(by_m.loc[m, "mean"]), 3) if m in by_m.index else None for m in range(1, 13)]
    vals = [(v, i) for i, v in enumerate(idx) if v is not None]
    best, worst = max(vals), min(vals)
    return {"crop": crop, "price_type": price_type, "index": dict(zip(MONTHS, idx)),
            "best_month": MONTHS[best[1]], "best_index": best[0], "worst_month": MONTHS[worst[1]], "worst_index": worst[0],
            "swing_pct": round((best[0] / worst[0] - 1) * 100, 1)}


def spread(crop: str) -> dict:
    """Retail vs wholesale: the share of the consumer price visible at wholesale level."""
    w, r = forecast.series(crop, "wholesale"), forecast.series(crop, "retail")
    j = pd.concat([w, r], axis=1, keys=["w", "r"]).dropna()
    j["share"] = j.w / j.r
    last = j.tail(90)
    yearly = j.groupby(j.index.year).share.mean()
    return {"crop": crop, "wholesale_90d": round(float(last.w.mean()), 2), "retail_90d": round(float(last.r.mean()), 2),
            "margin_per_kg": round(float((last.r - last.w).mean()), 2),
            "wholesale_share_pct": round(float(last.share.mean()) * 100, 1),
            "share_by_year_pct": {int(y): round(float(v) * 100, 1) for y, v in yearly.items()}}


def volatility(crop: str, price_type: str = "wholesale") -> dict:
    s = forecast.series(crop, price_type).tail(365)
    ret = np.log(s).diff(7).dropna()
    return {"cv_365d_pct": round(float(s.std() / s.mean()) * 100, 1), "weekly_move_p90_pct": round(float(np.exp(ret.abs().quantile(0.9)) - 1) * 100, 1)}


def price_floor(crop: str, price_type: str = "wholesale", q: float = 0.2) -> float:
    """Data-driven floor: the 20th percentile of the last 365 days. Selling below it means selling at a
    price the market only touched ~1 day in 5."""
    return round(float(forecast.series(crop, price_type).tail(365).quantile(q)), 2)

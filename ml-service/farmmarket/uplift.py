"""Measured impact: what would the timing rule have earned on the last two years of REAL prices?

Replay (point-in-time): every 7 days over the last `years` years, use only data available at that date to produce
the forecast, apply the same decision rule the app uses (sell now vs hold up to 14 days), and compare the REALISED
price net of spoilage with simply selling on the origin date. Quality grading is not measurable here (the dataset
has no grade information), so this isolates the TIMING effect. Wholesale prices are used as the farm-gate proxy."""
import json
import os

import numpy as np
import pandas as pd

from . import config, fair_price, forecast


def replay(crop: str, years: float = 2.0, step: int = 7, H: int = 14, price_type: str = "wholesale") -> dict:
    s = forecast.series(crop, price_type)
    last_origin = len(s) - 1 - H
    first_origin = max(500, len(s) - 1 - int(years * 365))
    rows = []
    for o in range(first_origin, last_origin + 1, step):
        hist = s.iloc[: o + 1]
        _, meta, pred, q80 = forecast.predict_path(hist, crop, price_type, H)
        prices = [float(hist.iloc[-1])] + [float(x) for x in pred]
        lows = [prices[0]] + [float(p * (1 - q)) for p, q in zip(pred, q80)]
        _, best = fair_price.choose(crop, prices, lows)
        w = best["wait_days"]
        spoil = lambda d: fair_price._spoil(crop, d, 0.0)
        realised = float(s.iloc[o + w]) * (1 - spoil(w))
        base = float(s.iloc[o])
        oracle = max(float(s.iloc[o + d]) * (1 - spoil(d)) for d in range(0, H + 1))
        rows.append({"origin": str(s.index[o].date()), "wait": w, "realised": realised, "base": base, "oracle": oracle})
    d = pd.DataFrame(rows)
    gain = d.realised / d.base - 1
    d["diff100"] = (d.realised - d.base) * 100          # taka per 100 kg versus selling on the decision date
    q = lambda x: {k: round(float(np.quantile(x, v)) * 100, 2) for k, v in (("p5", .05), ("p25", .25), ("p50", .5), ("p75", .75), ("p95", .95))}
    holds = d[d.wait > 0]
    def ex(r):
        return {"decision_date": r.origin, "wait_days": int(r.wait), "price_on_decision_date": round(float(r.base), 2),
                "realised_price_after_spoilage": round(float(r.realised), 2), "difference_bdt_per_100kg": round(float(r.diff100), 0)}
    examples = ({"best": ex(holds.loc[holds.diff100.idxmax()]), "worst": ex(holds.loc[holds.diff100.idxmin()]),
                 "median_hold": ex(holds.iloc[(holds.diff100 - holds.diff100.median()).abs().argmin():][:1].iloc[0])} if len(holds) else {})
    rng = np.random.default_rng(7)
    boots = [gain.sample(len(gain), replace=True, random_state=int(rng.integers(1e9))).mean() for _ in range(500)]
    return {"crop": crop, "n_origins": int(len(d)), "mean_uplift_pct": round(float(gain.mean()) * 100, 2),
            "ci95_pct": [round(float(np.quantile(boots, .025)) * 100, 2), round(float(np.quantile(boots, .975)) * 100, 2)],
            "hold_rate_pct": round(float((d.wait > 0).mean()) * 100, 1), "win_rate_when_holding_pct": round(float((gain[d.wait > 0] > 0).mean()) * 100, 1) if (d.wait > 0).any() else None,
            "gain_pct_quantiles_all_decisions": q(gain), "gain_pct_quantiles_when_holding": q(gain[d.wait > 0]) if len(holds) else None,
            "mean_difference_bdt_per_100kg": round(float(d.diff100.mean()), 0), "mean_price_on_decision_dates": round(float(d.base.mean()), 2),
            "n_hold_decisions": int(len(holds)), "examples": examples,
            "oracle_ceiling_pct": round(float((d.oracle / d.base - 1).mean()) * 100, 2),
            "period": [d.origin.iloc[0], d.origin.iloc[-1]], "model": meta["selected"] if meta else "naive"}


def finalize(out: dict) -> dict:
    """Add the effect of the app's gating (wait advice only where replay shows a reliable gain)."""
    eff = []
    for crop, r in out["crops"].items():
        on = r["mean_uplift_pct"] > 0 and r["ci95_pct"][0] > 0
        r["wait_advice_enabled"] = on
        r["policy_uplift_pct"] = r["mean_uplift_pct"] if on else 0.0
        eff.append(r["policy_uplift_pct"])
    out["average_uplift_pct"] = round(float(np.mean([v["mean_uplift_pct"] for v in out["crops"].values()])), 2)
    out["average_policy_uplift_pct"] = round(float(np.mean(eff)), 2)
    return out


def main():
    out = {"method": __doc__.strip().split("\n\n")[0], "crops": {}}
    for crop in config.CROPS:
        r = replay(crop)
        out["crops"][crop] = r
        print(crop, r, flush=True)
    finalize(out)
    out["note"] = ("Timing effect only (grade effects are not measurable from this data). Prices move slowly, so the rule mostly "
                   "recommends selling immediately; waiting is only advised for crops where the replay shows a reliable gain. "
                   "Wholesale price is a farm-gate proxy; a modest or zero average uplift is the honest result.")
    json.dump(out, open(os.path.join(config.MODEL_DIR, "uplift.json"), "w"), indent=1)
    print("average uplift % (ungated / as shipped):", out["average_uplift_pct"], out["average_policy_uplift_pct"])


if __name__ == "__main__":
    main()

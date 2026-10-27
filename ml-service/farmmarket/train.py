"""Evaluate candidate models on the real data and write models/metrics.json (run after loading new data):
    python -m farmmarket.train            # ~1-3 minutes (Prophet dominates)
"""
import json
import os
import sys
import time

from . import config, data_sources, forecast


def main(n_origins=10):
    os.makedirs(config.MODEL_DIR, exist_ok=True)
    out = {"trained_at": time.strftime("%Y-%m-%d %H:%M:%S"), "data_quality": data_sources.quality_report(), "horizon": 14, "series": {}}
    for crop in config.CROPS:
        for pt in config.PRICE_TYPES:
            s = forecast.series(crop, pt)
            bt = forecast.backtest(s, H=14, n_origins=n_origins)
            models = {k: v for k, v in bt.items() if not k.startswith("_")}
            best = min(models, key=lambda k: models[k]["mape_mean"])
            nv = models["naive"]["mape_mean"]
            out["series"][f"{crop}|{pt}"] = {
                "crop": crop, "price_type": pt, "selected": best, "models": models,
                "skill_vs_naive_pct": round((1 - models[best]["mape_mean"] / nv) * 100, 1) if nv else 0.0}
            print(f"{crop:14s}{pt:10s} best={best:8s} " + " ".join(f"{k}={v['mape_mean']}%" for k, v in models.items()), flush=True)
    json.dump(out, open(os.path.join(config.MODEL_DIR, "metrics.json"), "w"), indent=1)
    forecast._selection.cache_clear()
    print("wrote models/metrics.json")


if __name__ == "__main__":
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 10)

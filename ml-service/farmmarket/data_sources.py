"""Real data loading + cleaning.

market_ml_dataset_final.csv cleaning rules (all counted in `quality_report`):
  * keep unit == kg (drops 2 'pcs' chilli rows that are not comparable)
  * price <= 0 treated as missing (4 retail chilli rows)
  * daily reindex per (crop, price_type); gaps forward-filled up to 7 days, longer gaps stay missing
The weather columns are same-day observed national means; the dataset itself warns they are not
available at prediction time, so they are NOT used as forecast features."""
import os
import numpy as np
import pandas as pd
import requests

from . import config

_REV = {v[0]: k for k, v in config.CROP_MAP.items()}


def load_raw() -> pd.DataFrame:
    df = pd.read_csv(config.PRICE_CSV, parse_dates=["date"])
    df["unit"] = df["unit"].str.lower()
    return df


def load_prices() -> pd.DataFrame:
    """Long frame: date, crop, price_type, price (BDT/kg), pmin, pmax; daily, gap-filled <=7d."""
    df = load_raw()
    df = df[df.unit == "kg"].copy()
    df["crop"] = df["crop"].map(_REV)
    df = df.dropna(subset=["crop"])
    df.loc[df.avg_price_bdt <= 0, "avg_price_bdt"] = np.nan
    out = []
    for (crop, pt), g in df.groupby(["crop", "price_type"]):
        g = g.drop_duplicates("date").set_index("date").sort_index()
        idx = pd.date_range(g.index.min(), g.index.max(), freq="D")
        s = g.reindex(idx)
        s["price"] = s.avg_price_bdt.ffill(limit=7)
        s["pmin"] = s.min_price_bdt.ffill(limit=7)
        s["pmax"] = s.max_price_bdt.ffill(limit=7)
        s = s.dropna(subset=["price"])
        out.append(pd.DataFrame({"date": s.index, "crop": crop, "price_type": pt, "price": s.price.values,
                                 "pmin": s.pmin.values, "pmax": s.pmax.values}))
    return pd.concat(out, ignore_index=True)


def quality_report() -> dict:
    raw = load_raw()
    clean = load_prices()
    return {
        "raw_rows": int(len(raw)), "non_kg_rows_dropped": int((raw.unit != "kg").sum()),
        "zero_price_rows_treated_missing": int(((raw.unit == "kg") & (raw.avg_price_bdt <= 0)).sum()),
        "clean_daily_rows": int(len(clean)),
        "date_range": [str(raw.date.min().date()), str(raw.date.max().date())],
        "market_location_available": bool(raw.market_location_available.any()),
        "series": int(clean.groupby(["crop", "price_type"]).ngroups),
    }


def world_bank_indicator(country="BGD", indicator="FP.CPI.TOTL.ZG", timeout=8):
    """Latest value of a World Bank indicator (default: CPI inflation %). None if offline."""
    try:
        url = f"https://api.worldbank.org/v2/country/{country}/indicator/{indicator}"
        r = requests.get(url, params={"format": "json", "per_page": 10}, timeout=timeout)
        r.raise_for_status()
        for row in r.json()[1]:
            if row["value"] is not None:
                return {"year": row["date"], "value": row["value"], "indicator": indicator}
    except Exception:
        return None
    return None


def weather_forecast(lat, lon, timeout=8):
    """5-day forecast summary from OpenWeatherMap. None without key/network."""
    key = os.getenv("OPENWEATHER_API_KEY")
    if not key:
        return None
    try:
        r = requests.get("https://api.openweathermap.org/data/2.5/forecast",
                         params={"lat": lat, "lon": lon, "appid": key, "units": "metric"}, timeout=timeout)
        r.raise_for_status()
        items = r.json()["list"]
        return {"rain_mm_5d": round(sum(i.get("rain", {}).get("3h", 0) for i in items), 1),
                "max_temp_c": max(i["main"]["temp_max"] for i in items),
                "min_temp_c": min(i["main"]["temp_min"] for i in items)}
    except Exception:
        return None

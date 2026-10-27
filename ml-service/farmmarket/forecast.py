"""Price forecasting on the real AgriPriceBD series, with honest rolling-origin evaluation.

For each (crop, price_type) three candidates are backtested: naive (last value), damped-trend ETS
and Prophet. `python -m farmmarket.train` scores them over many past forecast origins, picks the
best per series and stores empirical 80% error bands, so every forecast reports the error it
actually achieved on unseen data (and its skill versus the naive baseline)."""
import json
import logging
import os
from functools import lru_cache

import numpy as np
import pandas as pd

from . import config, data_sources

log = logging.getLogger("farmmarket.forecast")
logging.getLogger("cmdstanpy").setLevel(logging.ERROR)
logging.getLogger("prophet").setLevel(logging.ERROR)

MAX_H = 30


@lru_cache(maxsize=1)
def _all() -> pd.DataFrame:
    return data_sources.load_prices()


def reload_prices():
    _all.cache_clear()
    _cache.clear()
    _selection.cache_clear()


def series(crop: str, price_type: str = "wholesale") -> pd.Series:
    df = _all()
    s = df[(df.crop == crop) & (df.price_type == price_type)].sort_values("date")
    if len(s) < 120:
        raise ValueError(f"not enough history for {crop}/{price_type}")
    return pd.Series(s.price.values, index=pd.DatetimeIndex(s.date), name=f"{crop}/{price_type}")


# ---------- candidate models: f(train: Series, H) -> np.ndarray(H) ----------
def m_naive(train, H):
    return np.repeat(float(train.iloc[-1]), H)


def m_ets(train, H):
    from statsmodels.tsa.holtwinters import ExponentialSmoothing
    fit = ExponentialSmoothing(train.values[-730:], trend="add", damped_trend=True).fit()
    return np.asarray(fit.forecast(H))


def m_prophet(train, H):
    from prophet import Prophet
    m = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False,
                changepoint_prior_scale=0.05)
    m.fit(pd.DataFrame({"ds": train.index, "y": train.values}))
    return m.predict(m.make_future_dataframe(periods=H)).yhat.tail(H).values


def m_seasonal(train, H, shrink=0.5):
    """Naive level adjusted by the learned month-of-year index (computed from the training window only,
    so no leakage), shrunk 50% toward 1 to avoid over-trusting a 3-5 year seasonal estimate."""
    if len(train) < 800:
        return m_naive(train, H)
    ratio = (train / train.rolling(365, center=True, min_periods=300).mean()).dropna()
    idx = ratio.groupby(ratio.index.month).mean()
    last = float(train.iloc[-1])
    cur = idx.get(train.index[-1].month, 1.0)
    dates = pd.date_range(train.index[-1] + pd.Timedelta(days=1), periods=H)
    out = []
    for d in dates:
        r = float(np.clip(idx.get(d.month, 1.0) / cur, 0.7, 1.4))
        out.append(last * (1 + shrink * (r - 1)))
    return np.array(out)


@lru_cache(maxsize=1)
def _weather() -> pd.DataFrame:
    """National daily observed weather from the dataset. Only values up to the forecast origin are ever used."""
    raw = data_sources.load_raw()
    w = raw.groupby("date")[["temperature_mean_c", "precipitation_mm_day", "relative_humidity_pct"]].mean()
    return w.reindex(pd.date_range(w.index.min(), w.index.max())).ffill()


def _feat(price: pd.Series, w: pd.DataFrame) -> pd.DataFrame:
    """Features known at time t: past price moves + weather observed up to t (never future weather)."""
    lp = np.log(price)
    f = pd.DataFrame(index=price.index)
    for k in (1, 7, 30):
        f[f"ret{k}"] = lp - lp.shift(k)
    f["dev90"] = lp - np.log(price.rolling(90, min_periods=30).mean())
    f["msin"] = np.sin(2 * np.pi * price.index.dayofyear / 365.25)
    f["mcos"] = np.cos(2 * np.pi * price.index.dayofyear / 365.25)
    ww = w.reindex(price.index).ffill()
    f["rain7"] = ww.precipitation_mm_day.rolling(7, min_periods=3).sum()
    f["rain30"] = ww.precipitation_mm_day.rolling(30, min_periods=10).sum()
    f["temp7"] = ww.temperature_mean_c.rolling(7, min_periods=3).mean()
    f["hum7"] = ww.relative_humidity_pct.rolling(7, min_periods=3).mean()
    return f


def m_gbm_weather(train, H, with_weather=True):
    """Direct multi-horizon gradient boosting on log(price[t+h]/price[t]) using price lags, season and
    LAGGED observed weather only (everything known at the forecast origin)."""
    from sklearn.ensemble import HistGradientBoostingRegressor
    F = _feat(train, _weather())
    if not with_weather:
        F = F[[c for c in F.columns if c not in ("rain7", "rain30", "temp7", "hum7")]]
    lp = np.log(train)
    Hm = 14
    rows_X, rows_y = [], []
    for h in range(1, Hm + 1):
        y = lp.shift(-h) - lp
        d = F.assign(h=h, y=y).dropna().iloc[::3]
        rows_X.append(d.drop(columns="y")); rows_y.append(d.y)
    X, y = pd.concat(rows_X), pd.concat(rows_y)
    if len(X) < 500:
        return m_naive(train, H)
    m = HistGradientBoostingRegressor(max_iter=80, learning_rate=0.05, max_depth=4, min_samples_leaf=40, l2_regularization=1.0, random_state=7)
    m.fit(X, y)
    last = F.iloc[[-1]]
    out = []
    for h in range(1, H + 1):
        x = last.assign(h=min(h, Hm))
        out.append(float(train.iloc[-1] * np.exp(np.clip(m.predict(x[X.columns])[0], -0.5, 0.5))))
    return np.array(out)


def m_gbm_noweather(train, H):
    return m_gbm_weather(train, H, with_weather=False)


MODELS = {"naive": m_naive, "seasonal_naive": m_seasonal, "ets": m_ets, "prophet": m_prophet,
          "gbm_no_weather": m_gbm_noweather, "gbm_lagged_weather": m_gbm_weather}


def backtest(s: pd.Series, H=14, n_origins=10, step=75, models=MODELS) -> dict:
    """Rolling-origin evaluation. Returns per-model MAPE by horizon and 80th-pct abs % error."""
    ends = [len(s) - H - 1 - i * step for i in range(n_origins)]
    ends = [e for e in ends if e > 400]
    errs = {k: [] for k in models}
    for e in ends:
        train, actual = s.iloc[: e + 1], s.iloc[e + 1: e + 1 + H].values
        for k, f in models.items():
            try:
                p = f(train, H)
            except Exception as ex:  # a failing candidate is simply not eligible
                log.warning("%s failed: %s", k, ex)
                continue
            errs[k].append(np.abs(p - actual) / np.maximum(actual, 1e-6))
    out = {}
    for k, v in errs.items():
        if not v:
            continue
        a = np.vstack(v)
        out[k] = {"mape_by_h": (a.mean(0) * 100).round(2).tolist(),
                  "mape_mean": round(float(a.mean() * 100), 2),
                  "q80_by_h": np.quantile(a, 0.8, axis=0).round(4).tolist(), "origins": len(v)}
    out["_n_origins"] = len(ends)
    return out


@lru_cache(maxsize=1)
def _selection() -> dict:
    p = os.path.join(config.MODEL_DIR, "metrics.json")
    return json.load(open(p)) if os.path.exists(p) else {}


def _meta(crop, pt):
    return _selection().get("series", {}).get(f"{crop}|{pt}")


_cache: dict = {}


def forecast(crop: str, price_type: str = "wholesale", horizon: int = 14) -> dict:
    horizon = max(1, min(horizon, MAX_H))
    key = (crop, price_type, horizon)
    if key not in _cache:
        _cache[key] = _forecast(crop, price_type, horizon)
    return _cache[key]


def predict_path(s: pd.Series, crop: str, pt: str, horizon: int):
    """Point path + 80% error fractions using ONLY the data in `s` (so it can be replayed at past origins)."""
    meta = _meta(crop, pt)
    model = meta["selected"] if meta else "naive"
    pred = MODELS[model](s, horizon)
    q80 = list(meta["models"][model]["q80_by_h"]) if meta else [0.10] * 14
    q80 = q80 + [q80[-1] * np.sqrt((h + 1) / 14) for h in range(14, horizon)]
    return model, meta, np.asarray(pred), q80


def _forecast(crop, pt, horizon):
    s = series(crop, pt)
    model, meta, pred, q80 = predict_path(s, crop, pt, horizon)
    dates = pd.date_range(s.index[-1] + pd.Timedelta(days=1), periods=horizon)
    last = float(s.iloc[-1])
    cur = float(s.tail(7).mean())
    prev = float(s.iloc[-8:-1].median())
    jump = last / prev - 1
    warn = (f"Last observation ({last:g}) is {jump * 100:+.0f}% versus the prior week's median ({prev:g}); verify it before relying on a forecast anchored to it."
            if abs(jump) > 0.15 else None)
    return {
        "crop": crop, "price_type": pt, "model": model, "horizon_days": horizon,
        "data_through": str(s.index[-1].date()),
        "stale_days": int((pd.Timestamp.today().normalize() - s.index[-1]).days),
        "last_price": round(last, 2), "current_level_7d": round(cur, 2), "last_obs_warning": warn,
        "expected_change_7d_pct": round(float(pred[:7].mean() / last - 1) * 100, 2),
        "backtest": ({"mape_1d": meta["models"][model]["mape_by_h"][0], "mape_7d": meta["models"][model]["mape_by_h"][6],
                      "mape_14d": meta["models"][model]["mape_by_h"][13], "naive_mape_14d": meta["models"]["naive"]["mape_by_h"][13],
                      "skill_vs_naive_pct": meta["skill_vs_naive_pct"], "origins": meta["models"][model]["origins"]} if meta else None),
        "history": [{"date": str(d.date()), "price": round(float(p), 2)} for d, p in s.tail(90).items()],
        "forecast": [{"date": str(d.date()), "price": round(float(p), 2), "low": round(float(p * (1 - q)), 2), "high": round(float(p * (1 + q)), 2)}
                     for d, p, q in zip(dates, pred, q80)],
    }

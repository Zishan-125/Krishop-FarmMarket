from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

from . import __version__, advisor, analytics, config, data_sources, digital_twin, fair_price, forecast, grading, logistics, matching

app = FastAPI(title="FarmMarket ML Service", version=__version__)


def _check(hub=None, crop=None, price_type=None):
    if hub is not None and hub not in config.HUBS:
        raise HTTPException(422, f"hub must be one of {list(config.HUBS)}")
    if crop is not None and crop not in config.CROPS:
        raise HTTPException(422, f"crop must be one of {config.CROPS}")
    if price_type is not None and price_type not in config.PRICE_TYPES:
        raise HTTPException(422, f"price_type must be one of {config.PRICE_TYPES}")


@app.get("/health")
def health():
    return {"status": "ok", "version": __version__}


@app.get("/meta")
def meta():
    sel = forecast._selection()
    return {"hubs": {h: {"lat": c[0], "lon": c[1]} for h, c in config.HUBS.items()},
            "crops": {k: v[1] for k, v in config.CROP_MAP.items()}, "price_types": config.PRICE_TYPES,
            "data_quality": data_sources.quality_report(), "models_trained_at": sel.get("trained_at")}


@app.get("/forecast")
def get_forecast(crop: str, price_type: str = "wholesale", horizon: int = Query(14, ge=1, le=30)):
    _check(crop=crop, price_type=price_type)
    return forecast.forecast(crop, price_type, horizon)


@app.get("/insights")
def insights(crop: str, price_type: str = "wholesale"):
    """Everything descriptive about a crop from the real data: seasonality, retail/wholesale spread, volatility, floor."""
    _check(crop=crop, price_type=price_type)
    return {"crop": crop, "seasonality": analytics.seasonality(crop, price_type), "spread": analytics.spread(crop),
            "volatility": analytics.volatility(crop, price_type), "price_floor_p20": analytics.price_floor(crop, price_type)}


@app.get("/market-snapshot")
def snapshot():
    """One row per crop: latest wholesale/retail level, 7-day outlook, spread, backtest error, best month."""
    rows = []
    for crop in config.CROPS:
        f = forecast.forecast(crop, "wholesale", 7)
        sp = analytics.spread(crop)
        rows.append({"crop": crop, "name": config.CROP_MAP[crop][1], "wholesale": f["last_price"], "last_obs_warning": f["last_obs_warning"],
                     "retail_90d": sp["retail_90d"], "wholesale_share_pct": sp["wholesale_share_pct"],
                     "expected_change_7d_pct": f["expected_change_7d_pct"], "model": f["model"],
                     "mape_14d": (f["backtest"] or {}).get("mape_14d"), "best_month": analytics.seasonality(crop)["best_month"]})
    return {"crops": rows, "data_through": f["data_through"], "stale_days": f["stale_days"], "macro": data_sources.world_bank_indicator()}


@app.get("/model-report")
def model_report():
    r = forecast._selection()
    if not r:
        raise HTTPException(404, "run `python -m farmmarket.train` first")
    return r


def _json_report(name):
    import json, os
    path = os.path.join(config.MODEL_DIR, name)
    if not os.path.exists(path):
        raise HTTPException(404, f"{name} not generated yet")
    return json.load(open(path, encoding="utf-8"))


@app.get("/uplift-report")
def uplift_report():
    return _json_report("uplift.json")


@app.get("/vision-report")
def vision_report():
    return _json_report("vision_metrics.json")


@app.post("/data/reload")
def reload_data():
    """Call after appending new rows to the price CSV (then run `python -m farmmarket.train` to refresh model selection)."""
    forecast.reload_prices()
    return data_sources.quality_report()


@app.get("/disease-catalog")
def disease_catalog():
    return grading.catalog()


class FairPriceReq(BaseModel):
    crop: str
    origin_hub: str
    destination_hub: str | None = None
    quantity_kg: float = Field(gt=0)
    quality_factor: float = Field(1.0, gt=0, le=1.2)
    cost_per_kg: float | None = Field(None, gt=0)
    price_type: str = "wholesale"


@app.post("/fair-price")
def fair(r: FairPriceReq):
    _check(r.origin_hub, r.crop, r.price_type)
    if r.destination_hub:
        _check(r.destination_hub)
    return fair_price.recommend(r.crop, r.origin_hub, r.quantity_kg, r.quality_factor, r.destination_hub, r.cost_per_kg, price_type=r.price_type)


class MatchReq(BaseModel):
    lots: list[dict]
    orders: list[dict]
    min_fill: float = 0.5


@app.post("/match")
def do_match(r: MatchReq):
    return matching.match(r.lots, r.orders, r.min_fill)


@app.post("/grade")
async def grade(file: UploadFile = File(...)):
    data = await file.read()
    if len(data) > 8_000_000:
        raise HTTPException(413, "image too large (8MB max)")
    try:
        return grading.grade_image(data)
    except Exception:
        raise HTTPException(422, "could not read image")


class DispatchReq(BaseModel):
    depot: dict
    stops: list[dict]
    w_time: float = 1.0
    w_co2: float = 0.5


@app.post("/dispatch")
def dispatch(r: DispatchReq):
    if not r.stops or len(r.stops) > 25:
        raise HTTPException(422, "1-25 stops required")
    return logistics.optimise(r.depot, r.stops, r.w_time, r.w_co2)


class AdviceReq(BaseModel):
    context: dict
    lang: str = "bn"


@app.post("/advice")
def advice(r: AdviceReq):
    return advisor.advise(r.context, r.lang)


class TwinEvent(BaseModel):
    kind: str
    payload: dict = {}


class SensorReq(BaseModel):
    crop: str
    temp_c: float
    humidity: float = Field(ge=0, le=100)


@app.post("/twin/{batch_id}/event")
def twin_event(batch_id: str, e: TwinEvent):
    return digital_twin.append(batch_id, e.kind, e.payload)


@app.post("/twin/{batch_id}/sensor")
def twin_sensor(batch_id: str, s: SensorReq):
    _check(crop=s.crop)
    return digital_twin.sensor(batch_id, s.crop, s.temp_c, s.humidity)


@app.get("/twin/{batch_id}")
def twin_get(batch_id: str):
    h = digital_twin.history(batch_id)
    if not h:
        raise HTTPException(404, "unknown batch")
    return {"verification": digital_twin.verify(batch_id), "events": h}

import io, os, sys, tempfile
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
os.environ["TWIN_DB"] = os.path.join(tempfile.mkdtemp(), "t.sqlite")

from PIL import Image
from fastapi.testclient import TestClient

from farmmarket import analytics, data_sources, digital_twin, fair_price, logistics, matching, config
from farmmarket.api import app

c = TestClient(app)


def test_real_data_loaded_and_cleaned():
    q = data_sources.quality_report()
    assert q["raw_rows"] == 17752 and q["series"] == 10 and q["market_location_available"] is False
    assert q["non_kg_rows_dropped"] == 2 and q["zero_price_rows_treated_missing"] == 4
    p = data_sources.load_prices()
    assert (p.price > 0).all() and p.date.max() == data_sources.load_prices().date.max()


def test_forecast_real_series_with_empirical_band_and_backtest():
    r = c.get("/forecast", params={"crop": "garlic", "horizon": 7}).json()
    assert r["data_through"] == "2025-06-04" and r["stale_days"] > 0
    assert all(f["low"] <= f["price"] <= f["high"] for f in r["forecast"])
    assert r["backtest"]["origins"] >= 5 and r["backtest"]["mape_14d"] < 40


def test_unknown_crop_rejected():
    assert c.get("/forecast", params={"crop": "tomato"}).status_code == 422


def test_seasonality_and_spread_sane():
    s = analytics.seasonality("cucumber")
    assert len(s["index"]) == 12 and s["best_index"] > s["worst_index"]
    sp = analytics.spread("garlic")
    assert 0 < sp["wholesale_share_pct"] <= 100 and sp["margin_per_kg"] >= 0


def test_fair_price_floor_and_quality_scaling():
    a = fair_price.recommend("chickpea", "Sylhet", 500, cost_per_kg=60)
    assert a["recommended_ask_per_kg"] >= a["floor"]["cost_based"] == 66.0   # cost*1.1
    b = fair_price.recommend("chickpea", "Sylhet", 500, quality_factor=0.7)
    assert b["best"]["net_per_kg"] < a["best"]["net_per_kg"]
    assert a["uplift_per_kg"] >= 0


def test_matching_respects_constraints_and_optimises():
    d, ct = config.HUBS["Dhaka"], config.HUBS["Chattogram"]
    lots = [{"id": "L1", "crop": "garlic", "quantity_kg": 100, "ask_per_kg": 90, "grade": "A", "coords": d},
            {"id": "L2", "crop": "garlic", "quantity_kg": 100, "ask_per_kg": 90, "grade": "C", "coords": ct},
            {"id": "L3", "crop": "chickpea", "quantity_kg": 100, "ask_per_kg": 70, "grade": "A", "coords": d}]
    orders = [{"id": "O1", "crop": "garlic", "quantity_kg": 100, "bid_per_kg": 120, "min_grade": "A", "coords": ct}]
    m = matching.match(lots, orders)
    assert [x["lot_id"] for x in m["matches"]] == ["L1"] and set(m["unmatched_lots"]) == {"L2", "L3"}


def test_logistics_not_worse_than_naive():
    stops = [{"name": n, "coords": c_, "drop_kg": 100} for n, c_ in config.HUBS.items() if n != "Dhaka"]
    r = logistics.optimise({"name": "Dhaka", "coords": config.HUBS["Dhaka"]}, stops)
    assert r["transit_hours"] <= r["naive"]["transit_hours"] + 1e-6 and r["route"][0] == "depot"


def test_twin_chain_detects_tampering():
    digital_twin.append("B1", "harvest", {"farm": "x"})
    assert digital_twin.sensor("B1", "green_chilli", 25.0, 60)["breach"]
    assert digital_twin.verify("B1")["valid"]
    import sqlite3
    con = sqlite3.connect(config.TWIN_DB)
    con.execute("UPDATE events SET payload='{\"farm\":\"evil\"}' WHERE kind='harvest'"); con.commit()
    assert not digital_twin.verify("B1")["valid"]


def test_disease_catalog_matches_plantvillage_labels():
    cat = c.get("/disease-catalog").json()["classes"]
    assert len(cat) == 38 and sum(v["n_images"] for v in cat.values()) == 54303
    assert cat["31"]["label"] == "Tomato___Late_blight" and cat["31"]["grade"] == "C"


def test_grading_baseline():
    img = Image.new("RGB", (200, 200), (230, 30, 30))
    b = io.BytesIO(); img.save(b, "PNG")
    r = c.post("/grade", files={"file": ("a.png", b.getvalue(), "image/png")}).json()
    assert r["grade"] in "ABC" and r["backend"] in ("hsv-baseline", "plantvillage-classifier")
    if r["backend"] == "hsv-baseline":
        assert r["fallback_reason"]


def test_trained_vision_model_shipped_with_metrics():
    import json
    m = json.load(open(os.path.join(config.MODEL_DIR, "vision_metrics.json")))
    assert m["n_classes"] == 38 and m["test_accuracy"] > 0.85 and os.path.exists(os.path.join(config.MODEL_DIR, "grader.joblib"))


def test_wait_advice_only_where_replay_supports_it():
    from farmmarket.fair_price import timing_enabled
    assert timing_enabled("garlic")[0] and not timing_enabled("cucumber")[0]
    assert fair_price.recommend("cucumber", "Dhaka", 100)["best"]["wait_days"] == 0


def test_uplift_report_endpoint():
    r = c.get("/uplift-report").json()
    assert set(r["crops"]) == set(config.CROPS) and "average_policy_uplift_pct" in r


def test_advice_template_bn():
    r = c.post("/advice", json={"context": {"crop": "garlic", "wait_days": 0, "ask_per_kg": 90, "grade": "A", "expected_change_7d_pct": 1.2, "low": 80, "high": 100}, "lang": "bn"}).json()
    assert r["source"] == "template" and "আজই" in r["text"] and "রসুন" in r["text"]
    assert r["text"].count("।") == 3 and "৯০" in r["text"] and "৮০" in r["text"] and "১০০" in r["text"] and not any(ch.isdigit() and ch in "0123456789" for ch in r["text"])   # Bengali numerals; ask, range
    r = c.post("/advice", json={"context": {"crop": "garlic", "wait_days": 5}, "lang": "bn"}).json()
    assert "৫" in r["text"] or "5" in r["text"]


def test_gemini_path_and_fallback(monkeypatch):
    from farmmarket import advisor
    ctx = {"crop": "garlic", "wait_days": 0, "ask_per_kg": 90, "grade": "A", "expected_change_7d_pct": 1.2, "low": 80, "high": 100}
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    class R:
        def __init__(self, text): self.text = text
        def raise_for_status(self): pass
        def json(self): return {"candidates": [{"content": {"parts": [{"text": self.text}]}}]}
    seen = {}
    def ok(url, json=None, headers=None, timeout=None):
        seen["url"], seen["key"] = url, headers["x-goog-api-key"]
        return R("Ask 90 per kg. Sell today. Range 80 to 100.")
    monkeypatch.setattr(advisor.requests, "post", ok)
    r = advisor.advise(ctx, "en")
    assert r["source"] == "llm" and seen["key"] == "test-key" and config.GEMINI_MODEL in seen["url"]
    monkeypatch.setattr(advisor.requests, "post", lambda *a, **k: R("only one sentence"))
    assert advisor.advise(ctx, "en")["source"] == "template"          # malformed reply -> template
    def boom(*a, **k): raise RuntimeError("network down")
    monkeypatch.setattr(advisor.requests, "post", boom)
    assert advisor.advise(ctx, "bn")["source"] == "template"          # error -> template

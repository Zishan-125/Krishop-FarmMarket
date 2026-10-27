"""Optional ML service boundary.

The checked-in service intentionally provides a deterministic baseline so local
development works without datasets or paid APIs. Install Prophet and replace
the baseline implementation when real historical data is available.
"""

from datetime import date, timedelta
import math
from fastapi import FastAPI, File, UploadFile

app = FastAPI(title="KriShop ML Service", version="0.1.0")


def forecast(crop: str, hub: str, horizon: int):
    horizon = min(90, max(7, horizon))
    seed = sum(ord(char) for char in f"{crop}:{hub}")
    base = 45 + seed % 45
    points = []
    for index in range(horizon):
        value = round(base + math.sin((index + seed) / 8) * 4 + index * 0.08, 2)
        points.append({
            "date": (date.today() + timedelta(days=index)).isoformat(),
            "yhat": value,
            "lower": round(value - 7, 2),
            "upper": round(value + 7, 2),
        })
    best = max(points, key=lambda point: point["yhat"])
    return {
        "crop": crop,
        "hub": hub,
        "horizon": horizon,
        "points": points,
        "best_time_to_sell": best["date"],
        "best_hub_to_sell": hub,
        "mape": None,
        "model": "offline-seasonal-baseline",
        "warning": "Estimate only. Train Prophet with validated historical data before production use.",
    }


@app.get("/health")
def health():
    return {"status": "ok", "mode": "offline-baseline"}


@app.get("/forecast")
def get_forecast(crop: str = "tomato", hub: str = "Dhaka-Karwan Bazar", horizon: int = 30):
    return forecast(crop, hub, horizon)


@app.post("/grade")
async def grade_image(image: UploadFile = File(...)):
    return {
        "available": False,
        "filename": image.filename,
        "message": "No trained grading model is connected. Upload accepted, inference unavailable.",
        "model": None,
    }

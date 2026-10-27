"""Produce grading from a photo -> grade (A/B/C), ripeness, disease flag, price multiplier.

Two backends:
  1. Learned: if models/grader.pt exists (trained with train_vision.py on PlantVillage
     + your ripeness photos) it is used via torch.
  2. Baseline (default, no GPU, no weights): HSV colour statistics. Fast and explainable
     but NOT a substitute for the trained model - it is flagged in the response.
"""
import io
import json
import os
import numpy as np
from PIL import Image

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "grader.pt")
CATALOG_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "disease_catalog.json")


def catalog() -> dict:
    """38 PlantVillage classes derived from plantvillage_image_labels.csv -> {label_id: {label, crop, healthy, grade}}."""
    with open(CATALOG_PATH, encoding="utf-8") as f:
        return json.load(f)
GRADE_MULT = {"A": 1.00, "B": 0.88, "C": 0.70}


def _baseline(img: Image.Image) -> dict:
    img = img.convert("RGB").resize((160, 160))
    hsv = np.asarray(img.convert("HSV")).reshape(-1, 3).astype(float)
    h, s, v = hsv[:, 0] * 360 / 255, hsv[:, 1] / 255, hsv[:, 2] / 255
    produce = (s > 0.25) & (v > 0.2)          # ignore background/whites/blacks
    if produce.sum() < 200:
        return {"error": "no produce detected - retake photo on a plain background"}
    hp, sp, vp = h[produce], s[produce], v[produce]
    red = ((hp < 20) | (hp > 340)).mean()
    green = ((hp >= 70) & (hp <= 160)).mean()
    yellow = ((hp >= 40) & (hp < 70)).mean()
    brown = ((hp >= 15) & (hp < 40) & (vp < 0.45)).mean()   # dark orange-brown = rot/lesion
    dark = (vp < 0.22).mean()
    spotty = float(np.std(vp))
    disease = brown * 1.5 + dark * 1.2 + max(0.0, spotty - 0.22)
    ripeness = "ripe" if red > 0.45 else ("turning" if red + yellow > 0.35 else "unripe")
    if disease > 0.35:
        grade = "C"
    elif disease > 0.15 or ripeness == "unripe" and green > 0.8:
        grade = "B"
    else:
        grade = "A"
    return {"grade": grade, "ripeness": ripeness, "disease_score": round(float(disease), 3),
            "diseased": bool(disease > 0.25), "backend": "hsv-baseline",
            "colour_share": {"red": round(float(red), 3), "green": round(float(green), 3),
                             "yellow": round(float(yellow), 3), "brown": round(float(brown), 3)}}


_bundle = None
MIN_CONFIDENCE = 0.30
JOBLIB_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "grader.joblib")


def _learned(data: bytes):
    """Classifier trained on real PlantVillage images (scripts/train_vision_lite.py). Returns None if unavailable."""
    global _bundle
    if _bundle is None:
        if not os.path.exists(JOBLIB_PATH):
            return None
        import joblib
        _bundle = joblib.load(JOBLIB_PATH)
    from .vision_features import features
    m = _bundle["model"]
    x = features(data).reshape(1, -1)
    if "nn" in _bundle:
        dist = float(_bundle["nn"].kneighbors(_bundle["scaler"].transform(x))[0].mean())
        if dist > _bundle["ood_threshold"]:
            return {"ood": True, "distance": round(dist, 2)}
    p = m.predict_proba(x)[0]
    order = np.argsort(p)[::-1][:3]
    cls = catalog()["classes"]
    by_label = {v["label"]: v for v in cls.values()}
    top = [{"label": m.classes_[i], "prob": round(float(p[i]), 3)} for i in order]
    c = by_label[top[0]["label"]]
    return {"grade": c["grade"], "diseased": not c["healthy"], "disease": c["disease"], "plant": c["crop"],
            "confidence": top[0]["prob"], "top3": top, "backend": "plantvillage-classifier"}


def grade_image(data: bytes) -> dict:
    """Learned PlantVillage classifier by default; transparent HSV fallback when the model is missing,
    unsure (confidence < MIN_CONFIDENCE) or fails. The response always says which backend produced it."""
    img = Image.open(io.BytesIO(data))
    out, reason = None, None
    try:
        out = _learned(data)
        if out is None:
            reason = "model file not found"
        elif out.get("ood"):
            reason = "image looks unlike PlantVillage leaf photos (out-of-distribution guard)"
            out = None
        elif out["confidence"] < MIN_CONFIDENCE:
            reason = f"low confidence ({out['confidence']}), looks unlike PlantVillage leaves"
            out = None
    except Exception as e:  # never fail a farmer's upload
        reason = f"model error: {type(e).__name__}"
    if out is None:
        out = _baseline(img)
        if "error" not in out:
            out["fallback_reason"] = reason
    else:
        out["ripeness"] = _baseline(img).get("ripeness")
    if "grade" in out:
        out["price_multiplier"] = GRADE_MULT[out["grade"]]
    return out

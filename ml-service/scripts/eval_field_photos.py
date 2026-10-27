"""Evaluate the shipped classifier on YOUR OWN field photos (never used for training).

    python scripts/eval_field_photos.py --dir data/field_photos_test
Reports accuracy over all photos, accuracy among photos the model accepted, and how many were sent to the
transparent HSV fallback by the out-of-distribution guard. Writes models/field_photo_report.json."""
import argparse
import glob
import json
import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from farmmarket import config, grading  # noqa: E402
from farmmarket.vision_features import normalize_label  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True)
    a = ap.parse_args()
    rows, per = [], {}
    for cls in sorted(os.listdir(a.dir)):
        d = os.path.join(a.dir, cls)
        if not os.path.isdir(d):
            continue
        truth = normalize_label(cls)
        for p in glob.glob(os.path.join(d, "*")):
            if not p.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                continue
            r = grading.grade_image(open(p, "rb").read())
            accepted = r.get("backend") == "plantvillage-classifier"
            pred = r["top3"][0]["label"] if accepted else None
            rows.append({"truth": truth, "pred": pred, "accepted": accepted, "correct": accepted and pred == truth})
            s = per.setdefault(truth, {"n": 0, "correct": 0, "accepted": 0}); s["n"] += 1; s["correct"] += int(rows[-1]["correct"]); s["accepted"] += int(accepted)
    if not rows:
        sys.exit("no photos found: expected <dir>/<PlantVillage class>/<image files>")
    n, acc = len(rows), sum(r["accepted"] for r in rows)
    rep = {"evaluated_at": time.strftime("%Y-%m-%d %H:%M:%S"), "n_photos": n, "n_classes": len(per),
           "accuracy_all": round(sum(r["correct"] for r in rows) / n, 3),
           "accepted_by_classifier": acc, "sent_to_fallback": n - acc,
           "accuracy_when_accepted": round(sum(r["correct"] for r in rows) / acc, 3) if acc else None, "per_class": per}
    os.makedirs(config.MODEL_DIR, exist_ok=True)
    json.dump(rep, open(os.path.join(config.MODEL_DIR, "field_photo_report.json"), "w"), indent=1)
    print(json.dumps({k: v for k, v in rep.items() if k != "per_class"}, indent=1))


if __name__ == "__main__":
    main()

"""Train the PlantVillage 38-class classifier used by /grade (CPU only, minutes, no torch).

    python scripts/fetch_plantvillage.py --per-class 200 --out /tmp/pvdata
    python scripts/train_vision_lite.py --data /tmp/pvdata [--extra data/field_photos]

--extra: optional folder of YOUR OWN labelled photos, one sub-folder per PlantVillage class name
(e.g. field_photos/Tomato___healthy/*.jpg). They are added to the training set only, never to the test set.
Writes models/grader.joblib and models/vision_metrics.json (held-out accuracy, macro-F1, per-class recall)."""
import argparse
import glob
import json
import os
import sys
import time

import joblib
import numpy as np
from sklearn.ensemble import ExtraTreesClassifier, HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from farmmarket.vision_features import features, normalize_label  # noqa: E402


def load(root):
    X, y, paths = [], [], []
    for cls in sorted(os.listdir(root)):
        for p in glob.glob(os.path.join(root, cls, "*")):
            try:
                X.append(features(p)); y.append(normalize_label(cls)); paths.append(p)
            except Exception:
                pass
    return np.array(X), np.array(y), paths


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    ap.add_argument("--extra")
    a = ap.parse_args()
    here = os.path.join(os.path.dirname(__file__), "..")
    cat = json.load(open(os.path.join(here, "data", "disease_catalog.json"), encoding="utf-8"))["classes"]
    label_to_id = {v["label"]: int(k) for k, v in cat.items()}
    t = time.time()
    X, y, _ = load(a.data)
    print(f"features {X.shape} in {time.time() - t:.0f}s", flush=True)
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, stratify=y, random_state=7)
    if a.extra and os.path.isdir(a.extra):
        Xe, ye, _ = load(a.extra)
        if len(Xe):
            Xtr, ytr = np.vstack([Xtr, Xe]), np.concatenate([ytr, ye]); print(f"added {len(Xe)} own photos to training")
    cands = {"extra_trees": ExtraTreesClassifier(n_estimators=300, min_samples_leaf=2, n_jobs=-1, random_state=7),
             "hist_gb": HistGradientBoostingClassifier(max_iter=120, learning_rate=0.1, max_leaf_nodes=15, random_state=7)}
    res = {}
    for name, m in cands.items():
        t = time.time(); m.fit(Xtr, ytr); p = m.predict(Xte)
        res[name] = {"accuracy": round(float(accuracy_score(yte, p)), 4), "macro_f1": round(float(f1_score(yte, p, average="macro")), 4), "fit_s": round(time.time() - t)}
        print(name, res[name], flush=True)
    best = max(res, key=lambda k: res[k]["accuracy"])
    model = cands[best]
    pred = model.predict(Xte)
    rep = classification_report(yte, pred, output_dict=True, zero_division=0)
    # Out-of-distribution guard: mean distance to the 5 nearest training images; the threshold is the 99th
    # percentile over held-out PlantVillage images, so unusual inputs (not leaf photos) fall back to the HSV baseline.
    scaler = StandardScaler().fit(Xtr)
    nn = NearestNeighbors(n_neighbors=5).fit(scaler.transform(Xtr))
    ood_thr = float(np.quantile(nn.kneighbors(scaler.transform(Xte))[0].mean(1), 0.99))
    os.makedirs(os.path.join(here, "models"), exist_ok=True)
    joblib.dump({"model": model, "classes": list(model.classes_), "label_to_id": label_to_id, "scaler": scaler, "nn": nn, "ood_threshold": ood_thr}, os.path.join(here, "models", "grader.joblib"), compress=3)
    json.dump({"model": best, "candidates": res, "n_train": int(len(Xtr)), "n_test": int(len(Xte)), "n_classes": int(len(set(y))), "ood_threshold": round(ood_thr, 3),
               "test_accuracy": res[best]["accuracy"], "test_macro_f1": res[best]["macro_f1"],
               "per_class_recall": {k: round(v["recall"], 3) for k, v in rep.items() if k in label_to_id},
               "note": "Random stratified split of a PlantVillage sample. PlantVillage has several photos per leaf on uniform lab backgrounds, so this over-states field accuracy."},
              open(os.path.join(here, "models", "vision_metrics.json"), "w"), indent=1)
    print("saved; best =", best)


if __name__ == "__main__":
    main()

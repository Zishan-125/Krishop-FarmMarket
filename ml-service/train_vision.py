"""OPTIONAL, UNTESTED GPU upgrade (not used by the API): fine-tune MobileNetV3-small on the 38-class PlantVillage dataset -> models/grader.pt.

The attached plantvillage_image_labels.csv holds LABELS ONLY (image_path is empty; images live in
TensorFlow Datasets). This script pulls the images from TFDS ('plant_village', the same 54,303-image
source as the CSV, same label ids) and trains on them.

    pip install torch torchvision tensorflow-datasets tensorflow
    python train_vision.py --epochs 3 --limit 20000        # CPU: use --limit; GPU: omit it

Known limits: PlantVillage is leaf photos on lab backgrounds, so field-photo accuracy is lower than the
reported validation accuracy. It covers tomato, potato, bell pepper and squash; it has no cucumber,
garlic or chickpea classes."""
import argparse
import os

import numpy as np
import torch
from torch import nn
from torchvision import models


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--epochs", type=int, default=3)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--batch", type=int, default=32)
    a = ap.parse_args()
    import tensorflow_datasets as tfds
    ds = tfds.load("plant_village", split="train", as_supervised=True)
    xs, ys = [], []
    for i, (img, lab) in enumerate(tfds.as_numpy(ds)):
        if a.limit and i >= a.limit:
            break
        xs.append(np.asarray(torch.nn.functional.interpolate(torch.from_numpy(img).permute(2, 0, 1)[None].float(), size=(224, 224))[0].byte()))
        ys.append(int(lab))
    X = torch.from_numpy(np.stack(xs)); Y = torch.tensor(ys)
    perm = torch.randperm(len(X)); cut = int(0.9 * len(X)); tr, va = perm[:cut], perm[cut:]
    mean = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1); std = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1)
    norm = lambda b: (b.float() / 255 - mean) / std
    m = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
    m.classifier[-1] = nn.Linear(m.classifier[-1].in_features, 38)
    opt = torch.optim.AdamW(m.parameters(), lr=1e-3)
    for ep in range(a.epochs):
        m.train(); idx = tr[torch.randperm(len(tr))]
        for s in range(0, len(idx), a.batch):
            b = idx[s:s + a.batch]
            opt.zero_grad(); nn.functional.cross_entropy(m(norm(X[b])), Y[b]).backward(); opt.step()
        m.eval()
        with torch.no_grad():
            acc = np.mean([(m(norm(X[va[s:s + 64]])).argmax(1) == Y[va[s:s + 64]]).float().mean().item() for s in range(0, len(va), 64)])
        print(f"epoch {ep + 1}: held-out accuracy {acc:.3f}")
    os.makedirs("models", exist_ok=True)
    torch.save(m, "models/grader.pt")


if __name__ == "__main__":
    main()

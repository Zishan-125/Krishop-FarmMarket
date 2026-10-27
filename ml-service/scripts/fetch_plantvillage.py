"""Download a class-balanced sample of REAL PlantVillage images from the public GitHub mirror
(spMohanty/PlantVillage-Dataset, raw/color) using data/plantvillage_repo_filelist.txt.

    python scripts/fetch_plantvillage.py --per-class 200 --out /tmp/pvdata
Class folder names equal the `disease_label` values in plantvillage_image_labels.csv."""
import argparse
import os
import random
import urllib.parse
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

import requests

BASE = "https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--per-class", type=int, default=200)
    ap.add_argument("--out", default="/tmp/pvdata")
    ap.add_argument("--seed", type=int, default=7)
    a = ap.parse_args()
    here = os.path.dirname(__file__)
    files = open(os.path.join(here, "..", "data", "plantvillage_repo_filelist.txt"), encoding="utf-8").read().splitlines()
    by = defaultdict(list)
    for f in files:
        by[f.split("/")[2]].append(f)
    rnd = random.Random(a.seed)
    todo = []
    for cls, fs in sorted(by.items()):
        rnd.shuffle(fs)
        todo += fs[: a.per_class]

    def get(f):
        dst = os.path.join(a.out, f.split("/", 2)[2])
        if os.path.exists(dst):
            return True
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        for _ in range(3):
            try:
                r = requests.get(BASE + urllib.parse.quote(f), timeout=30)
                if r.status_code == 200 and r.content[:2] == b"\xff\xd8":
                    open(dst, "wb").write(r.content)
                    return True
            except requests.RequestException:
                pass
        return False

    with ThreadPoolExecutor(24) as ex:
        ok = sum(ex.map(get, todo))
    print(f"downloaded {ok}/{len(todo)} images into {a.out}")


if __name__ == "__main__":
    main()

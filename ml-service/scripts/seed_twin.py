"""Idempotent demo seed for the digital twin: gives the seeded lots (B-0a1b2c01..06) a verifiable history.
Batch 03 includes a deliberate cold-chain breach so the Trace tab shows one."""
import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from farmmarket import digital_twin  # noqa: E402

BATCHES = {"B-0a1b2c01": "garlic", "B-0a1b2c02": "garlic", "B-0a1b2c03": "green_chilli",
           "B-0a1b2c04": "chickpea", "B-0a1b2c05": "sweet_pumpkin", "B-0a1b2c06": "cucumber"}

for bid, crop in BATCHES.items():
    if digital_twin.history(bid):
        continue
    t0 = time.time() - 6 * 3600
    digital_twin.append(bid, "harvest_listed", {"crop": crop}, ts=t0)
    for i, (temp, hum) in enumerate([(11, 70), (11, 72), (31 if bid.endswith("03") else 11, 75)]):
        digital_twin.append(bid, "sensor", {"crop": crop, "temp_c": temp, "humidity": hum,
                                            "breach": digital_twin.sensor_breach(crop, temp, hum)}, ts=t0 + (i + 1) * 3600)
print("twin seeded")

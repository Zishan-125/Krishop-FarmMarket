"""Digital twin for produce batches: an append-only, hash-chained event ledger.

Each event stores sha256(prev_hash + canonical_json(payload)); editing any past event
breaks every later hash, so `verify()` proves tamper-evidence. This is a single-writer
hash chain (a blockchain-style integrity log), NOT a distributed consensus ledger -
anchor `head_hash` to a public chain (e.g. a daily Polygon/Ethereum tx) for third-party
verifiability. Includes cold-chain breach detection from sensor readings."""
import hashlib
import json
import sqlite3
import time

from . import config

# Storage limits (deg C) are agronomic assumptions, not from the datasets.
TEMP_LIMITS = {"chickpea": (0, 30), "cucumber": (10, 13), "garlic": (0, 25), "green_chilli": (7, 12), "sweet_pumpkin": (10, 15)}
MAX_HUMIDITY = 92


def _db():
    con = sqlite3.connect(config.TWIN_DB)
    con.execute("""CREATE TABLE IF NOT EXISTS events(
        id INTEGER PRIMARY KEY AUTOINCREMENT, batch_id TEXT, ts REAL, kind TEXT,
        payload TEXT, prev_hash TEXT, hash TEXT)""")
    con.execute("CREATE INDEX IF NOT EXISTS ix_batch ON events(batch_id)")
    return con


def _h(prev, kind, ts, payload):
    blob = json.dumps({"k": kind, "t": ts, "p": payload}, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256((prev + blob).encode()).hexdigest()


def append(batch_id: str, kind: str, payload: dict, ts: float | None = None) -> dict:
    ts = ts or time.time()
    con = _db()
    try:
        row = con.execute("SELECT hash FROM events WHERE batch_id=? ORDER BY id DESC LIMIT 1", (batch_id,)).fetchone()
        prev = row[0] if row else "GENESIS"
        hsh = _h(prev, kind, ts, payload)
        con.execute("INSERT INTO events(batch_id,ts,kind,payload,prev_hash,hash) VALUES(?,?,?,?,?,?)",
                    (batch_id, ts, kind, json.dumps(payload, sort_keys=True), prev, hsh))
        con.commit()
    finally:
        con.close()
    return {"batch_id": batch_id, "kind": kind, "hash": hsh, "prev_hash": prev}


def sensor_breach(crop: str, temp_c: float, humidity: float) -> bool:
    lo, hi = TEMP_LIMITS.get(crop, (0, 30))
    return temp_c > hi or temp_c < lo or humidity > MAX_HUMIDITY


def sensor(batch_id: str, crop: str, temp_c: float, humidity: float) -> dict:
    breach = sensor_breach(crop, temp_c, humidity)
    ev = append(batch_id, "sensor", {"crop": crop, "temp_c": temp_c, "humidity": humidity, "breach": breach})
    return {**ev, "breach": breach}


def history(batch_id: str) -> list[dict]:
    con = _db()
    try:
        rows = con.execute("SELECT ts,kind,payload,prev_hash,hash FROM events WHERE batch_id=? ORDER BY id", (batch_id,)).fetchall()
    finally:
        con.close()
    return [{"ts": r[0], "kind": r[1], "payload": json.loads(r[2]), "prev_hash": r[3], "hash": r[4]} for r in rows]


def verify(batch_id: str) -> dict:
    ev = history(batch_id)
    prev = "GENESIS"
    for i, e in enumerate(ev):
        if e["prev_hash"] != prev or _h(prev, e["kind"], e["ts"], e["payload"]) != e["hash"]:
            return {"batch_id": batch_id, "valid": False, "broken_at": i, "events": len(ev)}
        prev = e["hash"]
    breaches = sum(1 for e in ev if e["kind"] == "sensor" and e["payload"].get("breach"))
    return {"batch_id": batch_id, "valid": True, "events": len(ev), "head_hash": prev,
            "cold_chain_breaches": breaches,
            "freshness_score": max(0, 100 - breaches * 15) if ev else None}

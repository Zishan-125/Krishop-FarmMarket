"""Perishable-aware multi-stop dispatch: nearest-neighbour seed + 2-opt, minimising a
weighted blend of transit time and CO2 (km * emission factor * load), with a hard
penalty for arriving after a stop's shelf-life deadline. Distances are road-adjusted
haversine; swap `road_km` for a satellite/OSRM road matrix when available."""
import itertools

from . import config
from .geo import road_km


def _legs(order, pts):
    return [(order[i], order[i + 1]) for i in range(len(order) - 1)]


def _score(order, pts, stops, w_time, w_co2, load_kg):
    t = co2 = penalty = 0.0
    load = load_kg
    for a, b in _legs(order, pts):
        km = road_km(pts[a], pts[b])
        hours = km / config.AVG_SPEED_KMH
        t += hours
        co2 += km * config.CO2_KG_PER_KM * (0.6 + 0.4 * load / max(load_kg, 1))  # lighter truck, less CO2
        load -= stops.get(b, {}).get("drop_kg", 0)
        dl = stops.get(b, {}).get("deadline_h")
        if dl is not None and t > dl:
            penalty += (t - dl) * 50
    return w_time * t + w_co2 * co2 + penalty, t, co2, penalty


def optimise(depot: dict, stops: list[dict], w_time: float = 1.0, w_co2: float = 0.5) -> dict:
    """depot: {name, coords}; stops: [{name, coords, drop_kg, deadline_h?}]"""
    pts = {"depot": tuple(depot["coords"])}
    smap = {}
    for s in stops:
        pts[s["name"]] = tuple(s["coords"]); smap[s["name"]] = s
    load = sum(s.get("drop_kg", 0) for s in stops)
    names = [s["name"] for s in stops]

    def total(o): return _score(o, pts, smap, w_time, w_co2, load)[0]

    naive = ["depot"] + names
    cur, left = ["depot"], set(names)
    while left:  # nearest neighbour
        nxt = min(left, key=lambda n: road_km(pts[cur[-1]], pts[n]))
        cur.append(nxt); left.remove(nxt)
    improved = True
    while improved:  # 2-opt (depot fixed at start, open route)
        improved = False
        for i, j in itertools.combinations(range(1, len(cur)), 2):
            cand = cur[:i] + cur[i:j + 1][::-1] + cur[j + 1:]
            if total(cand) + 1e-9 < total(cur):
                cur, improved = cand, True
    s_opt, t_opt, c_opt, p_opt = _score(cur, pts, smap, w_time, w_co2, load)
    s_nv, t_nv, c_nv, _ = _score(naive, pts, smap, w_time, w_co2, load)
    return {
        "route": cur, "transit_hours": round(t_opt, 2), "co2_kg": round(c_opt, 2),
        "deadline_penalty": round(p_opt, 2),
        "naive": {"route": naive, "transit_hours": round(t_nv, 2), "co2_kg": round(c_nv, 2)},
        "co2_saved_pct": round((1 - c_opt / c_nv) * 100, 1) if c_nv else 0.0,
        "time_saved_pct": round((1 - t_opt / t_nv) * 100, 1) if t_nv else 0.0,
    }

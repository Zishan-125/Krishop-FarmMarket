from math import radians, sin, cos, asin, sqrt

ROAD_FACTOR = 1.3  # road distance ~ 1.3x great-circle


def haversine_km(a, b):
    la1, lo1, la2, lo2 = map(radians, (a[0], a[1], b[0], b[1]))
    h = sin((la2 - la1) / 2) ** 2 + cos(la1) * cos(la2) * sin((lo2 - lo1) / 2) ** 2
    return 6371.0 * 2 * asin(sqrt(h))


def road_km(a, b):
    return haversine_km(a, b) * ROAD_FACTOR

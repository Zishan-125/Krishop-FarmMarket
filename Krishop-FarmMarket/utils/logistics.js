import { distanceKm } from "@/utils/matching";

export function planRoute(stops = []) {
    const ordered = [...stops].filter((stop) => Number.isFinite(stop.lat) && Number.isFinite(stop.lng)).sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
    const distance = ordered.slice(1).reduce((total, stop, index) => total + (distanceKm(ordered[index], stop) || 0), 0);
    return {
        stops: ordered,
        distanceKm: Number(distance.toFixed(2)),
        estimatedMinutes: Math.ceil(distance * 2.2),
        estimatedCo2Kg: Number((distance * 0.18).toFixed(2)),
        method: "deadline-first haversine fallback",
        warning: "Road routing and emissions are estimated because no routing provider is configured.",
    };
}

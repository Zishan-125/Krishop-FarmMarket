import { MARKET_CONFIG } from "@/config/market";

function hash(value) {
    return [...value].reduce((total, character) => total + character.charCodeAt(0), 0);
}

export function buildFallbackForecast({ crop = "tomato", hub = MARKET_CONFIG.hubs[0].name, horizon = 30 } = {}) {
    const days = Math.min(90, Math.max(7, Number(horizon) || 30));
    const seed = hash(`${crop}:${hub}`);
    const base = 45 + (seed % 45);
    const points = Array.from({ length: days }, (_, index) => {
        const seasonal = Math.sin((index + seed) / 8) * 4;
        const trend = index * 0.08;
        const value = Number((base + seasonal + trend).toFixed(2));
        return {
            date: new Date(Date.now() + index * 86400000).toISOString().slice(0, 10),
            yhat: value,
            lower: Number((value - 7).toFixed(2)),
            upper: Number((value + 7).toFixed(2)),
        };
    });
    const best = points.reduce((current, point) => point.yhat > current.yhat ? point : current, points[0]);
    return {
        crop,
        hub,
        horizon: days,
        points,
        bestTimeToSell: best.date,
        bestHubToSell: hub,
        mape: null,
        model: "offline-seasonal-baseline",
        warning: "Estimate only. No trained forecasting service is connected.",
    };
}

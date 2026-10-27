// Keep in sync with ml-service/farmmarket/config.py (the service also validates).
export const CROPS = ["chickpea", "cucumber", "garlic", "green_chilli", "sweet_pumpkin"];
export const PRICE_TYPES = ["wholesale", "retail"];
export const HUBS = ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Sylhet"];
export const GRADES = ["A", "B", "C"];

const BASE = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

export class MlError extends Error {
    constructor(message, status) { super(message); this.status = status; }
}

export async function ml(path, { method = "GET", body, form, timeout = 30000 } = {}) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    try {
        const res = await fetch(`${BASE}${path}`, {
            method,
            body: form ?? (body ? JSON.stringify(body) : undefined),
            headers: form || !body ? undefined : { "Content-Type": "application/json" },
            signal: ctrl.signal,
            cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new MlError(data.detail || "ML service error", res.status);
        return data;
    } catch (e) {
        if (e instanceof MlError) throw e;
        throw new MlError("Pricing service is offline", 503);
    } finally {
        clearTimeout(t);
    }
}

export function mlFail(e) {
    const status = e.status || 500;
    return Response.json({ message: e.message || "Unexpected error" }, { status });
}

export function oneOf(value, list) {
    return list.includes(value) ? value : null;
}

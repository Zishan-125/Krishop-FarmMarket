import { NextResponse } from "next/server";
import { MARKET_CONFIG } from "@/config/market";
import { buildFallbackForecast } from "@/utils/forecast";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const crop = searchParams.get("crop") || "tomato";
    const hub = searchParams.get("hub") || MARKET_CONFIG.hubs[0].name;
    const horizon = searchParams.get("horizon") || "30";
    if (!MARKET_CONFIG.crops.includes(crop.toLowerCase())) return NextResponse.json({ message: "Unsupported crop" }, { status: 400 });
    if (process.env.ML_SERVICE_URL) {
        try {
            const response = await fetch(`${process.env.ML_SERVICE_URL}/forecast?crop=${encodeURIComponent(crop)}&hub=${encodeURIComponent(hub)}&horizon=${horizon}`, { signal: AbortSignal.timeout(2500) });
            if (response.ok) return NextResponse.json(await response.json());
        } catch (error) {
            console.warn("Forecast service unavailable; using offline fallback", error.message);
        }
    }
    return NextResponse.json(buildFallbackForecast({ crop, hub, horizon }));
}

import { NextResponse } from "next/server";
import connect from "@/utils/db";
import { MarketPrice } from "@/Model/MarketPrice";

export async function GET(request) {
    try {
        await connect();
        const { searchParams } = new URL(request.url);
        const filter = {};
        if (searchParams.get("crop")) filter.crop = new RegExp(searchParams.get("crop"), "i");
        if (searchParams.get("location")) filter.location = new RegExp(searchParams.get("location"), "i");
        const prices = await MarketPrice.find(filter).sort({ observedOn: -1 }).limit(100).lean();
        return NextResponse.json({ items: prices, sourceType: "observed", forecastAvailable: false });
    } catch (error) {
        console.error("Market price lookup failed", error);
        return NextResponse.json({ message: "Market price data is unavailable" }, { status: 500 });
    }
}

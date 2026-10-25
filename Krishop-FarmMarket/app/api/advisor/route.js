import { NextResponse } from "next/server";
import { buildFallbackForecast } from "@/utils/forecast";

function fallbackAdvice({ crop, language, forecast }) {
    const date = forecast.bestTimeToSell;
    if (language === "bn") return { answer: `${crop} বিক্রির জন্য ${date} তারিখের কাছাকাছি সময়টি এই অনুমানের মধ্যে ভালো হতে পারে। এটি নিশ্চিত মূল্য নয়; স্থানীয় বাজারদর, মান এবং আবহাওয়া যাচাই করুন।`, citations: ["KriShop offline forecast baseline"] };
    return { answer: `The offline estimate suggests monitoring ${crop} around ${date}. This is not a guaranteed price; confirm local market rates, quality, and weather before selling.`, citations: ["KriShop offline forecast baseline"] };
}

export async function POST(request) {
    try {
        const body = await request.json();
        const crop = String(body.crop || "tomato").trim().toLowerCase();
        const language = body.language === "bn" ? "bn" : "en";
        const forecast = body.forecast || buildFallbackForecast({ crop, hub: body.hub, horizon: 30 });
        if (process.env.LLM_API_URL && process.env.LLM_API_KEY) {
            try {
                const response = await fetch(process.env.LLM_API_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.LLM_API_KEY}` }, body: JSON.stringify({ crop, language, forecast }) });
                if (response.ok) return NextResponse.json(await response.json());
            } catch (error) {
                console.warn("Advisor provider unavailable; using grounded fallback", error.message);
            }
        }
        return NextResponse.json(fallbackAdvice({ crop, language, forecast }));
    } catch {
        return NextResponse.json({ message: "Advisor request is invalid" }, { status: 400 });
    }
}

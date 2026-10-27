import { ml, mlFail, oneOf, CROPS } from "@/utils/farmmarket";

// GET /api/farmmarket/snapshot            -> all crops
// GET /api/farmmarket/snapshot?crop=garlic -> descriptive insights (seasonality, spread, volatility) for one crop
export async function GET(req) {
    const raw = new URL(req.url).searchParams.get("crop");
    try {
        if (!raw) return Response.json(await ml("/market-snapshot"));
        const crop = oneOf(raw, CROPS);
        if (!crop) return Response.json({ message: "valid crop required" }, { status: 422 });
        return Response.json(await ml(`/insights?crop=${crop}`));
    } catch (e) { return mlFail(e); }
}

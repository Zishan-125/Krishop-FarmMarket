import { ml, mlFail, oneOf, CROPS, PRICE_TYPES } from "@/utils/farmmarket";

export async function GET(req) {
    const q = new URL(req.url).searchParams;
    const crop = oneOf(q.get("crop"), CROPS), pt = oneOf(q.get("priceType") || "wholesale", PRICE_TYPES);
    const horizon = Math.min(Math.max(parseInt(q.get("horizon") || "14", 10) || 14, 1), 30);
    if (!crop || !pt) return Response.json({ message: "valid crop and priceType required" }, { status: 422 });
    try {
        return Response.json(await ml(`/forecast?crop=${crop}&price_type=${pt}&horizon=${horizon}`));
    } catch (e) { return mlFail(e); }
}

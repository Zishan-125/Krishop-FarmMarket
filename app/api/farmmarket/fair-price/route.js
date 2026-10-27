import { ml, mlFail, oneOf, CROPS, HUBS } from "@/utils/farmmarket";

export async function POST(req) {
    const b = await req.json().catch(() => ({}));
    const crop = oneOf(b.crop, CROPS), hub = oneOf(b.originHub, HUBS);
    const dest = b.destinationHub ? oneOf(b.destinationHub, HUBS) : null;
    const qty = Number(b.quantityKg), q = Number(b.qualityFactor ?? 1);
    const cost = b.costPerKg ? Number(b.costPerKg) : null;
    if (!crop || !hub || (b.destinationHub && !dest) || !(qty > 0) || !(q > 0 && q <= 1.2) || (cost !== null && !(cost > 0)))
        return Response.json({ message: "crop, originHub, quantityKg>0, qualityFactor in (0,1.2] required; destinationHub/costPerKg optional" }, { status: 422 });
    try {
        return Response.json(await ml("/fair-price", { method: "POST", body: { crop, origin_hub: hub, destination_hub: dest, quantity_kg: qty, quality_factor: q, cost_per_kg: cost } }));
    } catch (e) { return mlFail(e); }
}

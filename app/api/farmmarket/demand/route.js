import connect from "@/utils/db";
import { withAuth } from "@/utils/withAuth";
import { DemandOrder } from "@/Model/DemandOrder";
import { oneOf, CROPS, HUBS, GRADES } from "@/utils/farmmarket";

export async function GET(req) {
    await connect();
    const crop = oneOf(new URL(req.url).searchParams.get("crop"), CROPS);
    return Response.json(await DemandOrder.find({ status: "open", ...(crop && { crop }) }).sort({ createdAt: -1 }).limit(100).lean());
}

export const POST = withAuth(async (req) => {
    const b = await req.json().catch(() => ({}));
    const crop = oneOf(b.crop, CROPS), hub = oneOf(b.hub, HUBS), minGrade = oneOf(b.minGrade, GRADES) || "C";
    const qty = Number(b.quantityKg), bid = Number(b.bidPerKg);
    if (!crop || !hub || !(qty > 0) || !(bid >= 0))
        return Response.json({ message: "crop, hub, quantityKg>0, bidPerKg>=0 required" }, { status: 422 });
    await connect();
    return Response.json(await DemandOrder.create({ buyer: req.user.id, crop, hub, quantityKg: qty, bidPerKg: bid, minGrade }), { status: 201 });
});

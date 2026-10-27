import connect from "@/utils/db";
import { withAuth } from "@/utils/withAuth";
import { ProduceLot } from "@/Model/ProduceLot";
import { DemandOrder } from "@/Model/DemandOrder";
import { ml, mlFail, oneOf, CROPS } from "@/utils/farmmarket";

// Returns RECOMMENDED matches (optimal assignment). It does not mutate listings; a human confirms.
export const POST = withAuth(async (req) => {
    const b = await req.json().catch(() => ({}));
    const crop = oneOf(b.crop, CROPS);
    await connect();
    try {
        const meta = await ml("/meta");
        const xy = (h) => [meta.hubs[h].lat, meta.hubs[h].lon];
        const [lots, orders] = await Promise.all([
            ProduceLot.find({ status: "open", ...(crop && { crop }) }).limit(200).lean(),
            DemandOrder.find({ status: "open", ...(crop && { crop }) }).limit(200).lean(),
        ]);
        const result = await ml("/match", {
            method: "POST",
            body: {
                lots: lots.map((l) => ({ id: String(l._id), crop: l.crop, quantity_kg: l.quantityKg, ask_per_kg: l.askPerKg, grade: l.grade, coords: xy(l.hub), batch_id: l.batchId })),
                orders: orders.map((o) => ({ id: String(o._id), crop: o.crop, quantity_kg: o.quantityKg, bid_per_kg: o.bidPerKg, min_grade: o.minGrade, coords: xy(o.hub) })),
            },
        });
        return Response.json(result);
    } catch (e) { return mlFail(e); }
});

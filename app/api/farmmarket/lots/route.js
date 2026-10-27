import { randomUUID } from "crypto";
import connect from "@/utils/db";
import { withAuth } from "@/utils/withAuth";
import { ProduceLot } from "@/Model/ProduceLot";
import { ml, oneOf, CROPS, HUBS, GRADES } from "@/utils/farmmarket";

export async function GET(req) {
    await connect();
    const crop = oneOf(new URL(req.url).searchParams.get("crop"), CROPS);
    const lots = await ProduceLot.find({ status: "open", ...(crop && { crop }) }).sort({ createdAt: -1 }).limit(100).lean();
    return Response.json(lots);
}

export const POST = withAuth(async (req) => {
    if (!["vendor", "admin"].includes(req.user.role))
        return Response.json({ message: "Only farmers (vendor role) can list produce" }, { status: 403 });
    const b = await req.json().catch(() => ({}));
    const crop = oneOf(b.crop, CROPS), hub = oneOf(b.hub, HUBS), grade = oneOf(b.grade, GRADES) || "B";
    const qty = Number(b.quantityKg), ask = Number(b.askPerKg);
    if (!crop || !hub || !(qty > 0) || !(ask >= 0))
        return Response.json({ message: "crop, hub, quantityKg>0, askPerKg>=0 required" }, { status: 422 });
    await connect();
    const lot = await ProduceLot.create({ farmer: req.user.id, crop, hub, quantityKg: qty, askPerKg: ask, grade, batchId: "B-" + randomUUID().slice(0, 8) });
    // best-effort: start the batch's digital twin; the listing must not fail if the service is down
    ml(`/twin/${lot.batchId}/event`, { method: "POST", body: { kind: "harvest_listed", payload: { crop, hub, quantityKg: qty, grade } }, timeout: 5000 }).catch(() => {});
    return Response.json(lot, { status: 201 });
});

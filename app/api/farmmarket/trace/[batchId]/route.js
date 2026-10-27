import { ml, mlFail } from "@/utils/farmmarket";

export async function GET(_req, { params }) {
    const { batchId } = await params;
    if (!/^B-[a-f0-9]{8}$/.test(batchId)) return Response.json({ message: "invalid batch id" }, { status: 422 });
    try { return Response.json(await ml(`/twin/${batchId}`)); } catch (e) { return mlFail(e); }
}

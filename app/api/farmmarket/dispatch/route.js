import { withAuth } from "@/utils/withAuth";
import { ml, mlFail } from "@/utils/farmmarket";

export const POST = withAuth(async (req) => {
    const b = await req.json().catch(() => ({}));
    try { return Response.json(await ml("/dispatch", { method: "POST", body: b })); } catch (e) { return mlFail(e); }
});

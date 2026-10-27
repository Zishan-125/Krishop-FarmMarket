import { ml, mlFail } from "@/utils/farmmarket";

export async function GET() {
    try { return Response.json(await ml("/meta")); } catch (e) { return mlFail(e); }
}

import { ml, mlFail } from "@/utils/farmmarket";

// Measured, point-in-time replay of the timing rule on the last 2 years of real prices.
export async function GET() {
    try { return Response.json(await ml("/uplift-report")); } catch (e) { return mlFail(e); }
}

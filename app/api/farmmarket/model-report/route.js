import { ml, mlFail } from "@/utils/farmmarket";

// Backtest evidence: every candidate model's error on unseen data, per series.
export async function GET() {
    try { return Response.json(await ml("/model-report")); } catch (e) { return mlFail(e); }
}

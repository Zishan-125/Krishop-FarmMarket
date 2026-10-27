import { ml, mlFail } from "@/utils/farmmarket";

export async function POST(req) {
    const b = await req.json().catch(() => ({}));
    if (!b.context || typeof b.context !== "object") return Response.json({ message: "context required" }, { status: 422 });
    try { return Response.json(await ml("/advice", { method: "POST", body: { context: b.context, lang: b.lang || "bn" } })); } catch (e) { return mlFail(e); }
}

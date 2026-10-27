import { ml, mlFail } from "@/utils/farmmarket";

export async function POST(req) {
    const incoming = await req.formData().catch(() => null);
    const file = incoming?.get("file");
    if (!file || typeof file === "string") return Response.json({ message: "image file required" }, { status: 422 });
    if (!file.type.startsWith("image/")) return Response.json({ message: "only images allowed" }, { status: 415 });
    if (file.size > 8_000_000) return Response.json({ message: "image too large (8MB max)" }, { status: 413 });
    const form = new FormData();
    form.append("file", file, file.name || "upload.jpg");
    try { return Response.json(await ml("/grade", { method: "POST", form })); } catch (e) { return mlFail(e); }
}

import { NextResponse } from "next/server";
import connect from "@/utils/db";
import { BuyerDemand } from "@/Model/BuyerDemand";
import { parseDemandInput } from "@/utils/validation";
import { requireRole } from "@/utils/withAuth";

export const PATCH = requireRole("admin", "buyer")(async (request, { params }) => {
    try {
        await connect();
        const { id } = await params;
        const demand = await BuyerDemand.findOne({ _id: id, ...(request.user.role === "admin" ? {} : { buyer: request.user.id }) });
        if (!demand) return NextResponse.json({ message: "Demand not found" }, { status: 404 });
        const updates = parseDemandInput(await request.json());
        Object.assign(demand, updates);
        await demand.save();
        return NextResponse.json(demand);
    } catch (error) {
        const invalid = /required|invalid|must|Unsupported|after/.test(error.message);
        if (!invalid) console.error("Demand update failed", error);
        return NextResponse.json({ message: invalid ? error.message : "Unable to update demand" }, { status: invalid ? 400 : 500 });
    }
});

export const DELETE = requireRole("admin", "buyer")(async (request, { params }) => {
    await connect();
    const { id } = await params;
    const demand = await BuyerDemand.findOneAndDelete({ _id: id, ...(request.user.role === "admin" ? {} : { buyer: request.user.id }) });
    if (!demand) return NextResponse.json({ message: "Demand not found" }, { status: 404 });
    return NextResponse.json({ message: "Demand cancelled" });
});

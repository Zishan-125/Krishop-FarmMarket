import { NextResponse } from "next/server";
import connect from "@/utils/db";
import { BuyerDemand } from "@/Model/BuyerDemand";
import { parseDemandInput } from "@/utils/validation";
import { requireRole, withAuth } from "@/utils/withAuth";
import { escapeRegex } from "@/utils/query";

export const GET = withAuth(async (request) => {
    try {
        await connect();
        const { searchParams } = new URL(request.url);
        const filter = { status: searchParams.get("status") || "open" };
        if (searchParams.get("crop")) filter.crop = new RegExp(escapeRegex(searchParams.get("crop")), "i");
        if (searchParams.get("district")) filter.district = searchParams.get("district");
        if (request.user.role === "buyer") filter.buyer = request.user.id;
        const demands = await BuyerDemand.find(filter).populate("buyer", "username").sort({ createdAt: -1 }).limit(50).lean();
        return NextResponse.json({ items: demands });
    } catch (error) {
        console.error("Demand lookup failed", error);
        return NextResponse.json({ message: "Unable to load demands" }, { status: 500 });
    }
});

export const POST = requireRole("admin", "buyer")(async (request) => {
    try {
        await connect();
        const demand = await BuyerDemand.create({ ...parseDemandInput(await request.json()), buyer: request.user.id });
        return NextResponse.json(demand, { status: 201 });
    } catch (error) {
        const invalid = /required|invalid|must|Unsupported|after/.test(error.message);
        if (!invalid) console.error("Demand creation failed", error);
        return NextResponse.json({ message: invalid ? error.message : "Unable to create demand" }, { status: invalid ? 400 : 500 });
    }
});

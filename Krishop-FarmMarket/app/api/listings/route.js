import { NextResponse } from "next/server";
import connect from "@/utils/db";
import { ProduceListing } from "@/Model/ProduceListing";
import { parseListingInput } from "@/utils/validation";
import { requireRole, withAuth } from "@/utils/withAuth";

export async function GET(request) {
    try {
        await connect();
        const { searchParams } = new URL(request.url);
        const filter = { status: "active" };
        if (searchParams.get("crop")) filter.crop = new RegExp(searchParams.get("crop"), "i");
        if (searchParams.get("location")) filter.location = new RegExp(searchParams.get("location"), "i");
        const page = Math.max(1, Number(searchParams.get("page")) || 1);
        const limit = Math.min(30, Math.max(1, Number(searchParams.get("limit")) || 12));
        const [items, total] = await Promise.all([
            ProduceListing.find(filter).populate("seller", "username").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            ProduceListing.countDocuments(filter),
        ]);
        return NextResponse.json({ items, page, limit, total });
    } catch (error) {
        console.error("Listing search failed", error);
        return NextResponse.json({ message: "Unable to load listings" }, { status: 500 });
    }
}

export const POST = requireRole("admin", "vendor", "farmer")(async (request) => {
    try {
        await connect();
        const listing = await ProduceListing.create({ ...parseListingInput(await request.json()), seller: request.user.id });
        return NextResponse.json(listing, { status: 201 });
    } catch (error) {
        const status = error.message.includes("required") || error.message.includes("must") || error.message.includes("Unsupported") ? 400 : 500;
        if (status === 500) console.error("Listing creation failed", error);
        return NextResponse.json({ message: status === 400 ? error.message : "Unable to create listing" }, { status });
    }
});

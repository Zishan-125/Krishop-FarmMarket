import { NextResponse } from "next/server";
import connect from "@/utils/db";
import { ProduceListing } from "@/Model/ProduceListing";
import { parseListingInput } from "@/utils/validation";
import { requireRole, withAuth } from "@/utils/withAuth";
import { MarketPrice } from "@/Model/MarketPrice";
import { escapeRegex } from "@/utils/query";

export async function GET(request) {
    try {
        await connect();
        const { searchParams } = new URL(request.url);
        const filter = { status: "active" };
        if (searchParams.get("crop")) filter.crop = new RegExp(escapeRegex(searchParams.get("crop")), "i");
        if (searchParams.get("location")) filter.location = new RegExp(escapeRegex(searchParams.get("location")), "i");
        if (searchParams.get("district")) filter.district = searchParams.get("district");
        if (searchParams.get("grade")) filter.grade = searchParams.get("grade");
        if (Number.isFinite(Number(searchParams.get("minPrice")))) filter.askingPrice = { ...filter.askingPrice, $gte: Number(searchParams.get("minPrice")) };
        if (Number.isFinite(Number(searchParams.get("maxPrice")))) filter.askingPrice = { ...filter.askingPrice, $lte: Number(searchParams.get("maxPrice")) };
        const page = Math.max(1, Number(searchParams.get("page")) || 1);
        const limit = Math.min(30, Math.max(1, Number(searchParams.get("limit")) || 12));
        const [items, total] = await Promise.all([
            ProduceListing.find(filter).populate("seller", "username").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            ProduceListing.countDocuments(filter),
        ]);
        const crops = [...new Set(items.map((item) => item.crop))];
        const references = await MarketPrice.aggregate([
            { $match: { crop: { $in: crops } } },
            { $group: { _id: "$crop", referencePrice: { $avg: "$price" }, source: { $first: "$source" } } },
        ]);
        const referenceMap = new Map(references.map((item) => [item._id.toLowerCase(), item]));
        const enrichedItems = items.map((item) => {
            const reference = referenceMap.get(item.crop.toLowerCase());
            if (!reference) return { ...item, fairPrice: null };
            const ratio = item.askingPrice / reference.referencePrice;
            const label = ratio < 0.9 ? "Underpriced" : ratio > 1.1 ? "Overpriced" : "Fair";
            return { ...item, fairPrice: { label, referencePrice: reference.referencePrice, source: reference.source } };
        });
        return NextResponse.json({ items: enrichedItems, page, limit, total });
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

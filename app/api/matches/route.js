import { NextResponse } from "next/server";
import connect from "@/utils/db";
import { BuyerDemand } from "@/Model/BuyerDemand";
import { ProduceListing } from "@/Model/ProduceListing";
import { scoreListingAgainstDemand } from "@/utils/matching";
import { withAuth } from "@/utils/withAuth";
import { escapeRegex } from "@/utils/query";

export const GET = withAuth(async (request) => {
    try {
        await connect();
        const { searchParams } = new URL(request.url);
        const demandId = searchParams.get("demandId");
        const listingId = searchParams.get("listingId");
        const demand = demandId ? await BuyerDemand.findById(demandId).lean() : null;
        const listing = listingId ? await ProduceListing.findById(listingId).populate("seller", "username").lean() : null;
        if (demandId && (!demand || (request.user.role !== "admin" && demand.buyer.toString() !== request.user.id))) return NextResponse.json({ message: "Demand not found" }, { status: 404 });
        if (listingId && !listing) return NextResponse.json({ message: "Listing not found" }, { status: 404 });
        if (demand && listing) return NextResponse.json({ matches: [{ listing, demand, ...scoreListingAgainstDemand(listing, demand) }] });
        if (demand) {
            const listings = await ProduceListing.find({ status: "active", crop: new RegExp(`^${escapeRegex(demand.crop)}$`, "i") }).populate("seller", "username").limit(100).lean();
            const matches = listings.map((candidate) => ({ listing: candidate, demand, ...scoreListingAgainstDemand(candidate, demand) })).filter((match) => match.score > 0).sort((a, b) => b.score - a.score);
            return NextResponse.json({ matches });
        }
        if (listing) {
            const demands = await BuyerDemand.find({ status: "open", crop: new RegExp(`^${escapeRegex(listing.crop)}$`, "i") }).populate("buyer", "username").limit(100).lean();
            const matches = demands.map((candidate) => ({ listing, demand: candidate, ...scoreListingAgainstDemand(listing, candidate) })).filter((match) => match.score > 0).sort((a, b) => b.score - a.score);
            return NextResponse.json({ matches });
        }
        return NextResponse.json({ message: "Provide demandId or listingId" }, { status: 400 });
    } catch (error) {
        console.error("Matching failed", error);
        return NextResponse.json({ message: "Unable to calculate matches" }, { status: 500 });
    }
});

import { NextResponse } from "next/server";
import connect from "@/utils/db";
import { ListingOffer } from "@/Model/ListingOffer";
import { ProduceListing } from "@/Model/ProduceListing";
import { parseOfferInput } from "@/utils/validation";
import { requireRole } from "@/utils/withAuth";

export const POST = requireRole("admin", "buyer")(async (request) => {
    try {
        await connect();
        const body = await request.json();
        const listing = await ProduceListing.findById(body.listingId);
        if (!listing || listing.status !== "active") return NextResponse.json({ message: "Active listing not found" }, { status: 404 });
        if (listing.seller.toString() === request.user.id) return NextResponse.json({ message: "You cannot offer on your own listing" }, { status: 400 });
        const offer = await ListingOffer.create({ ...parseOfferInput(body), listing: listing._id, demand: body.demandId || undefined, farmer: listing.seller, buyer: request.user.id });
        return NextResponse.json(offer, { status: 201 });
    } catch (error) {
        const invalid = /required|invalid|must/.test(error.message);
        if (!invalid) console.error("Offer creation failed", error);
        return NextResponse.json({ message: invalid ? error.message : "Unable to create offer" }, { status: invalid ? 400 : 500 });
    }
});

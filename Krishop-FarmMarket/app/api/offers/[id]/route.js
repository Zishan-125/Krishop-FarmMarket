import { NextResponse } from "next/server";
import connect from "@/utils/db";
import { ListingOffer } from "@/Model/ListingOffer";
import { requireRole } from "@/utils/withAuth";

export const PATCH = requireRole("admin", "farmer", "vendor")(async (request, { params }) => {
    await connect();
    const { id } = await params;
    const offer = await ListingOffer.findOne({ _id: id, ...(request.user.role === "admin" ? {} : { farmer: request.user.id }) });
    if (!offer) return NextResponse.json({ message: "Offer not found" }, { status: 404 });
    const { status } = await request.json();
    if (!["accepted", "rejected"].includes(status)) return NextResponse.json({ message: "Unsupported offer status" }, { status: 400 });
    offer.status = status;
    await offer.save();
    return NextResponse.json(offer);
});

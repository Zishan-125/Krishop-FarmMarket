import mongoose from "mongoose";

const listingOfferSchema = new mongoose.Schema(
    {
        listing: { type: mongoose.Schema.Types.ObjectId, ref: "ProduceListing", required: true },
        demand: { type: mongoose.Schema.Types.ObjectId, ref: "BuyerDemand" },
        farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        quantity: { type: Number, required: true, min: 0.01 },
        price: { type: Number, required: true, min: 0 },
        message: { type: String, trim: true, maxlength: 500 },
        status: { type: String, enum: ["pending", "accepted", "rejected", "withdrawn"], default: "pending" },
    },
    { timestamps: true }
);

listingOfferSchema.index({ listing: 1, buyer: 1, status: 1 });
listingOfferSchema.index({ buyer: 1, createdAt: -1 });

export const ListingOffer =
    mongoose.models.ListingOffer || mongoose.model("ListingOffer", listingOfferSchema);

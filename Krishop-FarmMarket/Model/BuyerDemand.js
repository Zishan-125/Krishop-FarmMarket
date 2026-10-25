import mongoose from "mongoose";

const buyerDemandSchema = new mongoose.Schema(
    {
        crop: { type: String, required: true, trim: true, maxlength: 80 },
        category: { type: String, trim: true, maxlength: 60 },
        grade: { type: String, enum: ["A", "B", "C", "any"], default: "any" },
        quantity: { type: Number, required: true, min: 0.01 },
        unit: { type: String, required: true, enum: ["kg", "ตัน", "piece", "crate", "bag"] },
        targetPrice: { type: Number, required: true, min: 0 },
        priceUnit: { type: String, required: true, enum: ["kg", "ตัน", "piece", "crate", "bag"] },
        deliveryWindow: {
            from: { type: Date, required: true },
            to: { type: Date, required: true },
        },
        location: { type: String, required: true, trim: true, maxlength: 120 },
        district: { type: String, trim: true, maxlength: 80 },
        lat: { type: Number, min: -90, max: 90 },
        lng: { type: Number, min: -180, max: 180 },
        notes: { type: String, trim: true, maxlength: 1000 },
        status: { type: String, enum: ["open", "paused", "fulfilled", "cancelled"], default: "open" },
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

buyerDemandSchema.index({ status: 1, crop: 1, district: 1 });
buyerDemandSchema.index({ buyer: 1, createdAt: -1 });

export const BuyerDemand =
    mongoose.models.BuyerDemand || mongoose.model("BuyerDemand", buyerDemandSchema);

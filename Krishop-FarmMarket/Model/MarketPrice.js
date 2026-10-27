import mongoose from "mongoose";

const marketPriceSchema = new mongoose.Schema(
    {
        crop: { type: String, required: true, trim: true, maxlength: 80 },
        location: { type: String, required: true, trim: true, maxlength: 120 },
        price: { type: Number, required: true, min: 0 },
        unit: { type: String, required: true, enum: ["kg", "ตัน", "piece", "crate", "bag"] },
        observedOn: { type: Date, required: true },
        source: { type: String, required: true, trim: true, maxlength: 160 },
    },
    { timestamps: true }
);

marketPriceSchema.index({ crop: 1, location: 1, observedOn: -1 });

export const MarketPrice =
    mongoose.models.MarketPrice || mongoose.model("MarketPrice", marketPriceSchema);

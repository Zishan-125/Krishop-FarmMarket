import mongoose from "mongoose";

const produceListingSchema = new mongoose.Schema(
    {
        crop: { type: String, required: true, trim: true, maxlength: 80 },
        category: { type: String, required: true, trim: true, maxlength: 60 },
        description: { type: String, trim: true, maxlength: 1000 },
        quantity: { type: Number, required: true, min: 0.01 },
        unit: { type: String, required: true, enum: ["kg", "ตัน", "piece", "crate", "bag"] },
        askingPrice: { type: Number, required: true, min: 0 },
        priceUnit: { type: String, required: true, enum: ["kg", "ตัน", "piece", "crate", "bag"] },
        location: { type: String, required: true, trim: true, maxlength: 120 },
        quality: { type: String, trim: true, maxlength: 60 },
        grade: { type: String, enum: ["A", "B", "C"], default: "B" },
        harvestDate: { type: Date },
        district: { type: String, trim: true, maxlength: 80 },
        lat: { type: Number, min: -90, max: 90 },
        lng: { type: Number, min: -180, max: 180 },
        images: [{ type: String, trim: true, maxlength: 500 }],
        availableFrom: { type: Date },
        imageUrl: { type: String, trim: true, maxlength: 500 },
        status: { type: String, enum: ["active", "paused", "sold"], default: "active" },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

produceListingSchema.index({ status: 1, crop: 1, location: 1 });
produceListingSchema.index({ askingPrice: 1, createdAt: -1 });
produceListingSchema.index({ seller: 1, createdAt: -1 });

export const ProduceListing =
    mongoose.models.ProduceListing ||
    mongoose.model("ProduceListing", produceListingSchema);

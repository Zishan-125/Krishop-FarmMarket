import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
    {
        batchId: { type: String, required: true, unique: true, index: true },
        listing: { type: mongoose.Schema.Types.ObjectId, ref: "ProduceListing", required: true },
        crop: { type: String, required: true, trim: true },
        farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        harvestDate: { type: Date },
        qualityGrade: { type: String, enum: ["A", "B", "C"] },
        status: { type: String, enum: ["harvested", "in_transit", "delivered"], default: "harvested" },
    },
    { timestamps: true },
);

export const Batch = mongoose.models.Batch || mongoose.model("Batch", batchSchema);

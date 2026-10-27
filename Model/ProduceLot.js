import mongoose from "mongoose";
import { CROPS, HUBS, GRADES } from "@/utils/farmmarket";

const lotSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    crop: { type: String, enum: CROPS, required: true },
    hub: { type: String, enum: HUBS, required: true },
    quantityKg: { type: Number, required: true, min: 1 },
    askPerKg: { type: Number, required: true, min: 0 },
    grade: { type: String, enum: GRADES, default: "B" },
    batchId: { type: String, required: true, unique: true },
    status: { type: String, enum: ["open", "matched", "sold"], default: "open" },
    createdAt: { type: Date, default: Date.now },
});
lotSchema.index({ crop: 1, status: 1 });

export const ProduceLot = mongoose.models.ProduceLot || mongoose.model("ProduceLot", lotSchema);

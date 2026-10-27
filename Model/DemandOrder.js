import mongoose from "mongoose";
import { CROPS, HUBS, GRADES } from "@/utils/farmmarket";

const demandSchema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    crop: { type: String, enum: CROPS, required: true },
    hub: { type: String, enum: HUBS, required: true },
    quantityKg: { type: Number, required: true, min: 1 },
    bidPerKg: { type: Number, required: true, min: 0 },
    minGrade: { type: String, enum: GRADES, default: "C" },
    status: { type: String, enum: ["open", "matched", "filled"], default: "open" },
    createdAt: { type: Date, default: Date.now },
});
demandSchema.index({ crop: 1, status: 1 });

export const DemandOrder = mongoose.models.DemandOrder || mongoose.model("DemandOrder", demandSchema);

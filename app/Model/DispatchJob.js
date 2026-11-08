import mongoose from "mongoose";

const dispatchJobSchema = new mongoose.Schema(
    {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "OrderedItems" },
        pickup: { type: String, required: true, trim: true },
        dropoff: { type: String, required: true, trim: true },
        stops: [{ name: String, lat: Number, lng: Number, deadline: Date }],
        distanceKm: { type: Number, min: 0 },
        estimatedMinutes: { type: Number, min: 0 },
        estimatedCo2Kg: { type: Number, min: 0 },
        status: { type: String, enum: ["open", "accepted", "in_transit", "delivered"], default: "open" },
        transporter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true },
);

export const DispatchJob = mongoose.models.DispatchJob || mongoose.model("DispatchJob", dispatchJobSchema);

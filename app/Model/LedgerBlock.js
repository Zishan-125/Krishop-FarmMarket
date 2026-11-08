import mongoose from "mongoose";

const ledgerBlockSchema = new mongoose.Schema(
    {
        batchId: { type: String, required: true, index: true },
        eventType: { type: String, required: true, trim: true },
        payload: { type: mongoose.Schema.Types.Mixed, required: true },
        previousHash: { type: String, required: true },
        hash: { type: String, required: true, unique: true },
        recordedAt: { type: Date, default: Date.now },
    },
    { versionKey: false },
);

export const LedgerBlock = mongoose.models.LedgerBlock || mongoose.model("LedgerBlock", ledgerBlockSchema);

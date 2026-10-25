import crypto from "node:crypto";

export function blockHash({ batchId, eventType, payload, previousHash, recordedAt }) {
    return crypto.createHash("sha256").update(JSON.stringify({ batchId, eventType, payload, previousHash, recordedAt })).digest("hex");
}

export function verifyChain(blocks) {
    let previousHash = "GENESIS";
    for (const block of blocks) {
        const expected = blockHash({
            batchId: block.batchId,
            eventType: block.eventType,
            payload: block.payload,
            previousHash: block.previousHash,
            recordedAt: block.recordedAt,
        });
        if (block.previousHash !== previousHash || block.hash !== expected) return { valid: false, failedBlock: block.hash };
        previousHash = block.hash;
    }
    return { valid: true, failedBlock: null };
}

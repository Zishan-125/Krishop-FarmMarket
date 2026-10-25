import assert from "node:assert/strict";
import { blockHash, verifyChain } from "../utils/ledger.js";

const first = { batchId: "B-1", eventType: "harvested", payload: { crop: "tomato" }, previousHash: "GENESIS", recordedAt: "2026-01-01T00:00:00.000Z" };
first.hash = blockHash(first);
const second = { batchId: "B-1", eventType: "packed", payload: { grade: "A" }, previousHash: first.hash, recordedAt: "2026-01-02T00:00:00.000Z" };
second.hash = blockHash(second);

assert.deepEqual(verifyChain([first, second]), { valid: true, failedBlock: null });
second.payload.grade = "C";
assert.equal(verifyChain([first, second]).valid, false);
console.log("ledger test passed");

import assert from "node:assert/strict";
import { scoreListingAgainstDemand } from "../utils/matching.js";

const result = scoreListingAgainstDemand(
    { crop: "tomato", grade: "A", quantity: 200, askingPrice: 50, district: "Dhaka" },
    { crop: "tomato", grade: "A", quantity: 100, targetPrice: 60, district: "Dhaka", deliveryWindow: {} },
);

assert.equal(result.score, 95);
assert.ok(result.reasons.includes("Crop matches"));
console.log("matching test passed");

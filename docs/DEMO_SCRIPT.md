# 95-second farmer journey (record this yourself; screen + voice)

**Prep:** `docker compose up --build` (or local run), open `http://localhost:3000/farmmarket`, window about 1000 px wide.
Set: Garlic, My hub Sylhet, Buyer hub Dhaka, 500 kg, **cost 60**. Have a *healthy tomato leaf* photo ready (a PlantVillage image works; if you add field photos, use one of those and
quote `models/field_photo_report.json`). Rehearse twice: these are the numbers the build produced, and they change if you change the inputs.

| Time | On screen | Say (about 245 words in total) |
|---|---|---|
| 0:00-0:10 | "My sale" tab | "A garlic farmer in Sylhet usually takes the trader's price on the day. FarmMarket shows what the national market looks like and what to ask." |
| 0:10-0:25 | Upload the leaf photo | "I upload a photo. A classifier trained on 7,552 real PlantVillage images gives grade A, which sets the quality multiplier. The label shows which model produced it." |
| 0:25-0:45 | Recommendation cards + band chart | "Ask 80 taka a kilo. Decision: sell today, net 79.53 after freight to Dhaka. The green band is the 80% range from the model's measured past errors, and the app warns me the last price jumped 21%, so I should verify it." |
| 0:45-1:00 | Slider, then calculator (offer 70) | "What if my grade were 10% better? About 8 taka more per kilo, 4,125 on this lot. A trader offers 70: with my cost of 60, FarmMarket's plan earns 4,765 taka more on 500 kilos, 953 per 100 kilos." |
| 1:00-1:10 | Bangla advice line | "And three short sentences in Bangla: the ask, sell or wait, and the likely range." |
| 1:10-1:25 | Section 4 (replay) / Evidence tab | "Three limits. First, the photo model is trained on lab photos, 90% there; field accuracy is lower and [say the measured field number if you have one, otherwise: not yet measured]. Second, there is no usable weather forecast history, so lagged weather helped on only one of ten price series. Third, the timing gain is small: about 0.8% on garlic, roughly 126 taka per 100 kilos, from a few big wins; every other crop is told to sell today." |
| 1:25-1:35 | Theory of change (README or slide) | "The farmer who sees national prices, season and grade before negotiating keeps more of each kilo. We measured the timing part honestly and it is modest; the larger lever is price transparency at the moment of the deal, which this data cannot yet quantify." |

Say plainly once: prices end June 2025, are national, and wholesale stands in for the farm-gate price; matches are recommendations, not settlement, and the digital twin is a tamper-evident hash chain, not a blockchain.

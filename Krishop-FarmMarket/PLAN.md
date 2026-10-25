# KriShop FarmMarket implementation plan

## Audit baseline

- **Framework:** Next.js 16 App Router, React 19, JavaScript, Tailwind CSS v4.
- **Database:** MongoDB through Mongoose in `utils/db.js`. Existing models include users, catalog products, carts/orders, produce listings, and observed market prices.
- **Authentication:** NextAuth credentials provider with JWT sessions. `utils/withAuth.js` attaches the authenticated session user and provides role checks.
- **Payments:** Existing SSLCommerz sandbox checkout flow in `app/api/checkout`.
- **Roles:** `admin`, `user`, `vendor`, `farmer`, `buyer`.
- **Existing marketplace:** Public listing search and authenticated listing creation. Existing listing fields cover crop, category, quantity, units, asking price, location, quality, availability, image URL, status, and seller.
- **Missing:** Buyer demands, transparent matching, offers/negotiation, reference-price comparison, Bangladesh market configuration, seed data, forecasting service, image grading, advisory, logistics, traceability, and impact analytics.

## Delivery phases

### Phase 1 — Marketplace and demand matching

- Add shared market configuration for Bangladesh crops, districts, hubs, currency, and units.
- Extend `ProduceListing` backward-compatibly with grade, harvest date, district, coordinates, and images.
- Add `BuyerDemand` and `ListingOffer` models with indexes.
- Add validated demand CRUD, offer/negotiation routes, and transparent match scoring.
- Add fair-price classification against the nearest observed `MarketPrice` reference.
- Add demand board, matching panels, improved marketplace filters, and listing offer actions.
- Add an idempotent `npm run seed` script with offline demo users, prices, listings, and demands.

### Phase 2 — Pricing intelligence

- Add `ml-service/` FastAPI service with Prophet-compatible forecast boundary and deterministic synthetic fallback.
- Add cached data download/synthetic generation scripts and forecast endpoint.
- Extend prices API and add price-intelligence UI with forecast uncertainty and source labels.

### Phase 3 — Computer-vision grading

- Add documented FastAPI image-grading boundary with unavailable/demo state.
- Add server proxy and listing image upload/grade UI without claiming untrained accuracy.

### Phase 4 — Regional-language advisor

- Add provider-agnostic server-side advisor with grounded rule-based fallback.
- Add Bangla/English advisory UI and cited source context.

### Phase 5 — Logistics

- Add dispatch model, transporter role, offline haversine/heuristic route fallback, and delivery-job UI.

### Phase 6 — Traceability

- Add batches, sensor readings, hash-chained ledger verification, simulation script, and public trace page.

### Phase 7 — Impact dashboards

- Add farmer income and admin impact metrics based only on persisted records.

## Assumptions

- Phase 1 is usable with no external API keys or Python service.
- Bangladesh hubs and BDT are defaults, but all market taxonomy lives in one config module for later regional swaps.
- Matching is a recommendation, not a guaranteed sale.
- Existing catalog/cart/payment behavior remains intact.

## Phase status

- [x] Step 0 audit and plan
- [x] Phase 1 marketplace and demand matching
- [ ] Phase 2 pricing intelligence
- [ ] Phase 3 computer-vision grading
- [ ] Phase 4 regional-language advisor
- [ ] Phase 5 logistics
- [ ] Phase 6 traceability
- [ ] Phase 7 impact dashboards

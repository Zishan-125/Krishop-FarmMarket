# KriShop

KriShop is a Next.js and MongoDB marketplace for connecting farmers with buyers in Bangladesh. The produce marketplace uses its own listing and observed-price models alongside the existing catalog and checkout.

## Current capabilities

- Credentials authentication with farmer and buyer registration roles.
- Existing product catalog, cart, vendor/admin dashboards, and payment flow.
- Produce listings with crop, quantity, unit, asking price, quality, location, and availability details.
- Public marketplace search by crop and location with bounded pagination.
- Authenticated listing creation for farmers, vendors, and admins.
- Observed market-price API that distinguishes source observations from forecasts.
- Buyer demand board, transparent crop/quantity/price/location matching, offers, and fair-price badges.
- Offline `npm run seed` demo data for users, prices, 105 listings, and buyer demands.
- Responsive empty, loading, success, and failure states.
- Optional offline ML service with forecast, advisor, logistics, and traceability boundaries.
- Price intelligence and regional-language advisor screens with explicit estimate/source labels.
- Hash-chain batch verification API and public traceability route.

Forecasting, image quality classification, LLM assistance, weather, logistics routing, and third-party datasets remain optional. The included ML service uses a clearly labelled deterministic baseline and does not claim trained accuracy or live prices.

## Technology and structure

- Next.js 16 App Router, React 19, JavaScript
- MongoDB with Mongoose
- NextAuth JWT sessions
- Tailwind CSS v4, React Toastify, Axios

Important directories:

- `app/marketplace` and `app/listings/new`: farmer marketplace screens
- `app/api/listings` and `app/api/prices`: marketplace APIs
- `Model/`: Mongoose models, including `ProduceListing` and `MarketPrice`
- `utils/`: database connection, authentication wrapper, and input validation
- `Components/`: shared navigation and existing shopping components

## Local setup

Prerequisites: Node.js 18+ and a MongoDB database.

```bash
npm install
cp .env.example .env.local
# Set MONGO_URI and NEXTAUTH_SECRET in .env.local
npm run dev
```

Open http://localhost:3000. Register as a farmer to publish produce or as a buyer to browse and post demands. Never commit `.env.local`; it is ignored by Git.

To load the offline Phase 1 demo dataset:

```bash
npm run seed
```

Demo accounts use password `KriShopDemo123!`: `farmer@krishop.demo`, `buyer@krishop.demo`, and `admin@krishop.demo`.

To run the optional baseline service:

```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Environment variables

`MONGO_URI`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` are required. Payment and Google OAuth variables are optional and only needed for their existing integrations. `ML_SERVICE_URL`, `LLM_API_URL`, `LLM_API_KEY`, and `OSRM_URL` are optional.

## Data and AI boundaries

`GET /api/prices` returns only persisted observations and labels them with `sourceType: "observed"`. The optional `ml-service/` provides a deterministic forecast baseline and an explicit unavailable response for image grading. To add trained models, provide a documented inference boundary, dataset/label definitions, time-based evaluation, model metadata, and an explicit unavailable state when the service cannot be reached. PlantVillage is suitable for some plant-disease experiments but does not automatically provide fruit-ripeness or market-grade labels.

## Verification

```bash
npm run lint
npm run build
npm run test:unit
```

The build does not require a live database connection. API and authentication flows require a reachable MongoDB instance and valid local environment variables. The changed marketplace files pass ESLint. The full legacy application lint currently reports existing issues in `Components/EditProductPopup.js`, `context/CartContext.js`, and `app/dashboard/user/page.js`; these are outside the marketplace changes.

import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI is required to seed the database");

const crops = ["rice", "potato", "tomato", "onion", "brinjal", "mango", "jute"];
const districts = ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Bogura"];
const hubs = [
    ["Dhaka", 23.7509, 90.393],
    ["Chattogram", 22.3378, 91.8325],
    ["Sylhet", 24.8949, 91.8687],
    ["Rajshahi", 24.3745, 88.6042],
    ["Khulna", 22.8456, 89.5403],
    ["Bogura", 24.851, 89.3711],
];

const client = new MongoClient(uri);
await client.connect();
const db = client.db();
const password = await bcrypt.hash("KriShopDemo123!", 10);

async function user(email, username, role) {
    const result = await db.collection("users").findOneAndUpdate(
        { email },
        { $set: { email, username, role, password, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true, returnDocument: "after" },
    );
    return result;
}

const farmer = await user("farmer@krishop.demo", "Demo Farmer", "farmer");
const buyer = await user("buyer@krishop.demo", "Demo Buyer", "buyer");
await user("admin@krishop.demo", "Demo Admin", "admin");

const farmerId = farmer._id;
const buyerId = buyer._id;
const now = new Date();

await db.collection("marketprices").deleteMany({ source: "KriShop offline demo seed" });
await db.collection("marketprices").insertMany(crops.flatMap((crop, cropIndex) =>
    hubs.map(([location], hubIndex) => ({
        crop,
        location,
        price: 55 + cropIndex * 12 + hubIndex * 3,
        unit: "kg",
        observedOn: new Date(now.getTime() - (hubIndex + 1) * 86400000),
        source: "KriShop offline demo seed",
        createdAt: now,
        updatedAt: now,
    })),
));

await db.collection("producelistings").deleteMany({ seller: farmerId });
await db.collection("producelistings").insertMany(Array.from({ length: 105 }, (_, index) => {
    const crop = crops[index % crops.length];
    const [district, lat, lng] = hubs[index % hubs.length];
    return {
        crop,
        category: "produce",
        description: "Offline demo listing for local marketplace testing.",
        quantity: 100 + (index % 8) * 25,
        unit: "kg",
        askingPrice: 55 + (index % crops.length) * 12 + (index % 4) * 2,
        priceUnit: "kg",
        location: district,
        district,
        lat,
        lng,
        quality: index % 3 === 0 ? "Premium" : "Standard",
        grade: ["A", "B", "C"][index % 3],
        harvestDate: new Date(now.getTime() - (index % 14) * 86400000),
        availableFrom: now,
        status: "active",
        seller: farmerId,
        createdAt: new Date(now.getTime() - index * 3600000),
        updatedAt: now,
    };
}));

await db.collection("buyerdemands").deleteMany({ buyer: buyerId });
await db.collection("buyerdemands").insertMany(crops.slice(0, 5).map((crop, index) => ({
    crop,
    category: "produce",
    grade: index % 2 ? "any" : "A",
    quantity: 200 + index * 50,
    unit: "kg",
    targetPrice: 60 + index * 10,
    priceUnit: "kg",
    deliveryWindow: {
        from: now,
        to: new Date(now.getTime() + 14 * 86400000),
    },
    location: districts[index],
    district: districts[index],
    notes: "Offline demo buyer demand.",
    status: "open",
    buyer: buyerId,
    createdAt: now,
    updatedAt: now,
})));

console.log("Seed complete.");
console.log("Demo accounts: farmer@krishop.demo, buyer@krishop.demo, admin@krishop.demo");
console.log("Demo password: KriShopDemo123!");
console.log("Created 105 listings, 35 market prices, and 5 buyer demands.");
await client.close();

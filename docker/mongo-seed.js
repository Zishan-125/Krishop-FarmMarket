// Seed data for the demo (runs once on first start of the mongo container).
// Logins: farmer@demo.test (vendor) and buyer@demo.test (user), password demo1234. Demo only: change/remove before any real use.
const kdb = db.getSiblingDB("krishop");
const farmer = ObjectId("650000000000000000000001"), buyer = ObjectId("650000000000000000000002");
const pw = "$2b$10$2Qk9tckXe0yQ1VLNxt57N.jTRHnUbXa07Qz83MYa7jU6d6yHr6vlm";
kdb.users.insertMany([
  { _id: farmer, username: "demo_farmer", email: "farmer@demo.test", password: pw, role: "vendor", createdAt: new Date(), updatedAt: new Date() },
  { _id: buyer, username: "demo_buyer", email: "buyer@demo.test", password: pw, role: "user", createdAt: new Date(), updatedAt: new Date() },
]);
// Prices (BDT/kg) sit near the last values in the real dataset (garlic ~82-105, chilli ~42, cucumber ~35, pumpkin ~13, chickpea ~88).
const lots = [
  ["garlic", "Sylhet", 400, 95, "A", "B-0a1b2c01"], ["garlic", "Rajshahi", 250, 90, "B", "B-0a1b2c02"],
  ["green_chilli", "Chattogram", 300, 45, "A", "B-0a1b2c03"], ["chickpea", "Khulna", 500, 88, "A", "B-0a1b2c04"],
  ["sweet_pumpkin", "Rajshahi", 800, 12, "B", "B-0a1b2c05"], ["cucumber", "Dhaka", 350, 33, "B", "B-0a1b2c06"],
];
kdb.producelots.insertMany(lots.map(([crop, hub, q, ask, grade, batchId]) => ({ farmer, crop, hub, quantityKg: q, askPerKg: ask, grade, batchId, status: "open", createdAt: new Date() })));
const orders = [
  ["garlic", "Dhaka", 300, 118, "A"], ["garlic", "Chattogram", 200, 112, "B"], ["green_chilli", "Dhaka", 250, 58, "B"],
  ["chickpea", "Dhaka", 400, 102, "B"], ["sweet_pumpkin", "Dhaka", 700, 17, "C"], ["cucumber", "Chattogram", 300, 52, "B"],
];
kdb.demandorders.insertMany(orders.map(([crop, hub, q, bid, minGrade]) => ({ buyer, crop, hub, quantityKg: q, bidPerKg: bid, minGrade, status: "open", createdAt: new Date() })));
print("FarmMarket demo data seeded");

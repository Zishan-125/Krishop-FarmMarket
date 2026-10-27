import mongoose from "mongoose";

// Cache the connection across hot reloads / serverless invocations. The original
// reconnected on every request, which exhausts Atlas connections under load.
let cached = globalThis._mongoose;
if (!cached) cached = globalThis._mongoose = { conn: null, promise: null };

const connect = async () => {
    if (cached.conn) return cached.conn;
    const uri = process.env.MONGO_URI || process.env.MONGO_DB_URI;
    if (!uri) throw new Error("MONGO_URI is not set");
    if (!cached.promise) cached.promise = mongoose.connect(uri, { bufferCommands: false });
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }
    return cached.conn;
};

export default connect;

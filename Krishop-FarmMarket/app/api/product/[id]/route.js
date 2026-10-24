
import { Product } from "@/Model/Product";
import connect from "@/utils/db";
import { withAuth } from "@/utils/withAuth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const GET = async (req, { params }) => {
    await connect();
    const { id } = await params;
    let data = await Product.findById(id);

    // Fallback for String IDs
    if (!data) {
        const nativeCollection = mongoose.connection.db.collection("products");
        data = await nativeCollection.findOne({ _id: id });
    }

    if (!data) {
        return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
};

export const PUT = withAuth(async (req, { params }) => {
    await connect();
    const { id } = await params;

    let product = await Product.findById(id);
    let isNative = false;

    if (!product) {
        const nativeCollection = mongoose.connection.db.collection("products");
        product = await nativeCollection.findOne({ _id: id });
        isNative = true;
    }

    if (!product) {
        return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    if (req.user.role !== "admin" && product.vendor.toString() !== req.user.id.toString()) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const body = await req.json();



    // Update product fields safely
    delete body._id; // Prevent updating _id


    let updatedProduct;
    if (isNative) {
        const nativeCollection = mongoose.connection.db.collection("products");
        // Mongoose pre-save hooks won't run, but at least we save the data
        if (!body.updatedAt) body.updatedAt = new Date();

        await nativeCollection.updateOne({ _id: id }, { $set: body });
        updatedProduct = await nativeCollection.findOne({ _id: id });
    } else {
        product.set(body);
        updatedProduct = await product.save();
    }

    return NextResponse.json(updatedProduct, { status: 200 });
});

export const DELETE = withAuth(async (req, { params }) => {
    await connect();
    const { id } = await params;

    let product = await Product.findById(id);
    let isNative = false;

    if (!product) {
        const nativeCollection = mongoose.connection.db.collection("products");
        product = await nativeCollection.findOne({ _id: id });
        isNative = true;
    }

    if (!product) {
        return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    if (req.user.role !== "admin" && product.vendor.toString() !== req.user._id.toString()) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    if (isNative) {
        const nativeCollection = mongoose.connection.db.collection("products");
        await nativeCollection.deleteOne({ _id: id });
    } else {
        await Product.findByIdAndDelete(id);
    }

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
});

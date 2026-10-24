
import { Product } from "@/Model/Product";
import connect from "@/utils/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/utils/withAuth";

export const GET = withAuth(async (req) => {
    await connect();
    console.log("Connected to database");
    const data = await Product.find();
    console.log(data);
    return NextResponse.json(data, { status: 200 });
});

export const POST = withAuth(async (req) => {
    if (req.user.role !== "admin" && req.user.role !== "vendor") {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }
    await connect();
    console.log("Connected to database");
    const body = await req.json();
    const newProduct = new Product({ ...body, vendor: req.user.id });
    const savedProduct = await newProduct.save();
    return NextResponse.json(savedProduct, { status: 201 });
});

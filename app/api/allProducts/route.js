
import { Product } from "@/Model/Product";
import connect from "@/utils/db";
import { NextResponse } from "next/server";

export const GET = async (req) => {
    await connect();
    console.log("Connected to database");
    const data = await Product.find({});
    console.log(data);
    return NextResponse.json(data, { status: 200 });
}

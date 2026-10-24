import OrderedItems from "@/Model/CartModel";
import connect from "@/utils/db";
import { withAuth } from "@/utils/withAuth";
import { NextResponse } from "next/server";

export const GET = withAuth(async (request, { params }) => {
    await connect();
    try {
        const { id } = await params;

        // check if the logged in user is the one asking for the orders
        if (request.user.id !== id && request.user.role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const orders = await OrderedItems.find({ userId: id });

        return NextResponse.json({ orders });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching orders', error: error.message }, { status: 500 });
    }
});

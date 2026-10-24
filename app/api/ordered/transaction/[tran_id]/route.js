import OrderedItems from "@/Model/CartModel";
import connect from "@/utils/db";
import { NextResponse } from "next/server";

export const GET = async (request, { params }) => {
    await connect();
    const { tran_id } = await params;

    try {
        const order = await OrderedItems.findOne({ transactionId: tran_id });

        if (!order) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ order });

    } catch (error) {
        console.error('Fetch order error:', error);
        return NextResponse.json({ message: 'Error fetching order' }, { status: 500 });
    }
}

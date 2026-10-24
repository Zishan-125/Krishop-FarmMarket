import OrderedItems from "@/Model/CartModel";
import connect from "@/utils/db";
import { NextResponse } from "next/server";

export const POST = async (request, { params }) => {
    await connect();
    const { tran_id } = await params;

    try {
        await OrderedItems.updateOne(
            { transactionId: tran_id },
            { $set: { status: 'Failed' } }
        );

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/fail`, 303);

    } catch (error) {
        console.error('Payment fail error:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/fail`, 303);
    }
}

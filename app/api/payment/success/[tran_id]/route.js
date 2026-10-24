import OrderedItems from "@/Model/CartModel";
import connect from "@/utils/db";
import { NextResponse } from "next/server";

export const POST = async (request, { params }) => {
    await connect();
    const { tran_id } = await params;

    try {
        const formData = await request.formData();
        const val_id = formData.get('val_id') || '';

        const update = await OrderedItems.updateOne(
            { transactionId: tran_id },
            {
                $set: {
                    status: 'Paid',
                    val_id: val_id
                }
            }
        );

        if (update.modifiedCount > 0) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/success?tran_id=${tran_id}`, 303);
        } else {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/fail`, 303);
        }

    } catch (error) {
        console.error('Payment success error:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/fail`, 303);
    }
}

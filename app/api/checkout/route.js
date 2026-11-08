import OrderedItems from "@/Model/CartModel";
import connect from "@/utils/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const POST = async (request) => {
    await connect();
    try {
        // 1. Verify user session from NextAuth
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new Response(
                JSON.stringify({ message: 'Unauthorized. Please log in to checkout.' }),
                { status: 401 }
            );
        }

        const { items, transactionId } = await request.json();
        const userId = session.user.id; // Securely retrieve userId from session

        if (!items || items.length === 0) {
            return new Response(
                JSON.stringify({ message: 'No items in cart' }),
                { status: 400 }
            );
        }

        // Calculate total amount
        const total_amount = items.reduce((total, item) => total + item.totalPrice, 0);

        const store_id = process.env.STORE_ID || 'testbox';
        const store_passwd = process.env.STORE_PASSWORD || 'qwerty';
        const is_live = false; // Set to true for live mode

        const initURL = is_live ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php' : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

        const formData = new FormData();
        formData.append('store_id', store_id);
        formData.append('store_passwd', store_passwd);
        formData.append('total_amount', total_amount.toString());
        formData.append('currency', 'BDT');
        formData.append('tran_id', transactionId);
        formData.append('success_url', `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/success/${transactionId}`);
        formData.append('fail_url', `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/fail/${transactionId}`); // Fixed typo quote here
        formData.append('cancel_url', `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/fail/${transactionId}`);
        formData.append('ipn_url', `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/ipn`);
        formData.append('shipping_method', 'Courier');
        formData.append('product_name', items.map(item => item.productName).join(', '));
        formData.append('product_category', 'Agricultural');
        formData.append('product_profile', 'general');
        formData.append('cus_name', session.user.name || 'Customer Name');
        formData.append('cus_email', session.user.email || 'customer@example.com');
        formData.append('cus_add1', 'Dhaka');
        formData.append('cus_add2', 'Dhaka');
        formData.append('cus_city', 'Dhaka');
        formData.append('cus_state', 'Dhaka');
        formData.append('cus_postcode', '1000');
        formData.append('cus_country', 'Bangladesh');
        formData.append('cus_phone', '01711111111');
        formData.append('cus_fax', '01711111111');
        formData.append('ship_name', session.user.name || 'Customer Name');
        formData.append('ship_add1', 'Dhaka');
        formData.append('ship_add2', 'Dhaka');
        formData.append('ship_city', 'Dhaka');
        formData.append('ship_state', 'Dhaka');
        formData.append('ship_postcode', '1000');
        formData.append('ship_country', 'Bangladesh');

        const response = await fetch(initURL, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data?.GatewayPageURL) {
            // Save initial order with Pending status using secure session userId
            await OrderedItems.create({
                items,
                userId,
                transactionId,
                status: 'Pending'
            });

            return new Response(
                JSON.stringify({ url: data.GatewayPageURL }),
                { status: 200 }
            );
        } else {
            return new Response(
                JSON.stringify({ message: 'Failed to initiate payment' }),
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Checkout error:', error);
        return new Response(
            JSON.stringify({ message: 'Error during checkout', error: error.message }),
            { status: 500 }
        );
    }
};
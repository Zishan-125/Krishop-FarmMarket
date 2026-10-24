import OrderedItems from "@/Model/CartModel";

export const GET = async (request) => {
    try {
        // Fetch ordered items for the given userId
        const orders = await OrderedItems.find();

        return new Response(
            JSON.stringify({ message: 'Orders fetched successfully', orders }),
            { status: 200 }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ message: 'Error fetching orders', error: error.message }),
            { status: 500 }
        );
    }
}

import OrderedItems from "@/Model/CartModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const GET = async (request) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new Response(
                JSON.stringify({ message: 'Unauthorized' }),
                { status: 401 }
            );
        }

        // Jodi admin hoy, shob order dekhabe. Na hole shudhu tar nijer order gulo fetch korbe.
        let query = {};
        if (session.user.role !== 'admin') {
            query.userId = session.user.id;
        }

        const orders = await OrderedItems.find(query);

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
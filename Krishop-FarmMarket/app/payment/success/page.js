'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import axios from 'axios';
import Link from 'next/link';

const SuccessContent = () => {
    const searchParams = useSearchParams();
    const tran_id = searchParams.get('tran_id');
    const { removeSelectedFromCart } = useCart();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderAndCleanup = async () => {
            if (!tran_id) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/api/ordered/transaction/${tran_id}`);
                const order = response.data.order;

                if (order && order.items && order.items.length > 0) {
                    removeSelectedFromCart(order.items);
                }
            } catch (error) {
                console.error('Error fetching order for cleanup:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderAndCleanup();
    }, [tran_id, removeSelectedFromCart]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
            <h1 className="text-4xl font-bold text-green-700 mb-4">Payment Successful!</h1>
            <p className="text-lg text-gray-700 mb-8">Thank you for your purchase.</p>

            <p className="text-md text-gray-500 mb-8">Transaction ID: {tran_id}</p>
            <Link href="/" className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
                Go to Home
            </Link>
        </div>
    );
};

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}

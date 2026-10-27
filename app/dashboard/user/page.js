'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { ShoppingBag, ArrowUpRight, ReceiptText } from 'lucide-react';

const UserDashboard = () => {
    const [orderedProducts, setOrderedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { data: session, status } = useSession();

    useEffect(() => {
        const fetchOrderedProducts = async () => {
            if (session?.user?.id) {
                setLoading(true);
                try {
                    const response = await axios.get(`/api/ordered/${session.user.id}`);
                    if (response.status === 200) {
                        setOrderedProducts(response.data.orders);
                    } else {
                        console.error('Error fetching ordered products:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error fetching ordered products:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        if (status === 'authenticated') {
            fetchOrderedProducts();
        } else if (status === 'unauthenticated') {
            setLoading(false);
            setOrderedProducts([]);
        }
    }, [status, session]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-gray-600">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your Ordered Products</h1>
                    <p className="text-emerald-100 mt-1 text-sm md:text-base">Track your agricultural orders, check statuses, and review past purchases.</p>
                </div>
                <a 
                    href="/" 
                    className="bg-white text-emerald-800 px-5 py-2.5 rounded-xl text-sm font-semibold shadow hover:bg-emerald-50 transition inline-flex items-center gap-2"
                >
                    Browse Marketplace <ArrowUpRight className="w-4 h-4" />
                </a>
            </div>

            {/* Content Section */}
            {orderedProducts.length > 0 ? (
                <div className="space-y-6">
                    {orderedProducts.map((order) => (
                        <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition hover:shadow-md">
                            {/* Order Header */}
                            <div className="bg-gray-50/70 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold">
                                        <ReceiptText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</span>
                                        <h3 className="text-sm md:text-base font-bold text-gray-900">{order.transactionId}</h3>
                                    </div>
                                </div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    Processed
                                </span>
                            </div>

                            {/* Order Items Table */}
                            <div className="overflow-x-auto p-2 md:p-4">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="py-3 px-4">Product Name</th>
                                            <th className="py-3 px-4">Price</th>
                                            <th className="py-3 px-4">Quantity</th>
                                            <th className="py-3 px-4 text-right">Total Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-sm">
                                        {order.items.map((item) => (
                                            <tr key={item._id} className="hover:bg-gray-50/50 transition">
                                                <td className="py-4 px-4 font-medium text-gray-800">{item.productName}</td>
                                                <td className="py-4 px-4 text-gray-600">৳{item.price}</td>
                                                <td className="py-4 px-4 text-gray-600">{item.quantity}</td>
                                                <td className="py-4 px-4 text-right font-semibold text-emerald-700">৳{item.totalPrice}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Professional Empty State */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-xl mx-auto my-12">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
                        <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No ordered products found</h3>
                    <p className="text-sm text-gray-500 mb-6">You haven't placed any orders yet. Discover fresh crops and products on our marketplace.</p>
                    <a 
                        href="/" 
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-xl shadow-sm transition text-sm"
                    >
                        Start Shopping Now <ArrowUpRight className="w-4 h-4" />
                    </a>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
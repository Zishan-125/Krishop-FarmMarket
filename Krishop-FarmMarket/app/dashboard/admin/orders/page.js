'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { status } = useSession();

    useEffect(() => {
        if (status !== 'authenticated') return;
        axios.get('/api/ordered')
            .then((response) => setOrders(response.data.orders || []))
            .catch((error) => console.error('Error fetching orders:', error))
            .finally(() => setLoading(false));
    }, [status]);

    const orderValue = orders.reduce((total, order) => total + order.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0), 0);

    return (
        <div className="max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4d9f45]">Administration</p><h1 className="mt-2 text-3xl font-bold text-[#14532d]">Order management</h1><p className="mt-2 text-sm text-[#718078]">Monitor purchases and payment status across KriShop.</p></div>
                <span className="rounded-full bg-[#e7f5c8] px-4 py-2 text-sm font-bold text-[#4d9f45]">{orders.length} total orders</span>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#dceadf] bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-[#829087]">Orders</p><p className="mt-2 text-3xl font-bold text-[#14532d]">{orders.length}</p></div>
                <div className="rounded-2xl border border-[#dceadf] bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-[#829087]">Gross value</p><p className="mt-2 text-3xl font-bold text-[#14532d]">৳{orderValue.toLocaleString()}</p></div>
                <div className="rounded-2xl border border-[#dceadf] bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-[#829087]">Pending review</p><p className="mt-2 text-3xl font-bold text-[#d1a51f]">{orders.filter((order) => order.status === 'Pending').length}</p></div>
            </div>
            <section className="mt-8 overflow-hidden rounded-2xl border border-[#dceadf] bg-white shadow-sm">
                <div className="border-b border-[#edf2ed] px-6 py-5"><h2 className="font-bold text-[#173d27]">Recent orders</h2></div>
                {loading ? <div className="p-8 text-center text-sm text-[#718078]">Loading orders...</div> : orders.length === 0 ? <div className="p-12 text-center"><p className="font-semibold text-[#173d27]">No orders yet</p><p className="mt-1 text-sm text-[#718078]">Completed purchases will appear here.</p></div> : <div className="divide-y divide-[#edf2ed]">{orders.map((order) => <div key={order._id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5"><div><p className="font-bold text-[#173d27]">#{order.transactionId}</p><p className="mt-1 text-sm text-[#718078]">{order.items.length} item{order.items.length === 1 ? '' : 's'} · Customer {order.userId}</p></div><div className="flex items-center gap-5"><p className="font-bold text-[#14532d]">৳{order.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0).toLocaleString()}</p><span className="rounded-full bg-[#fff4bf] px-3 py-1 text-xs font-bold text-[#8a6514]">{order.status || 'Pending'}</span></div></div>)}</div>}
            </section>
        </div>
    );
}

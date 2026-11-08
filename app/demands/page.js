'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BuyerDemandsPage() {
    const [demands, setDemands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDemands() {
            try {
                const res = await fetch('/api/demands');
                if (res.ok) {
                    const data = await res.json();
                    setDemands(data);
                }
            } catch (err) {
                console.error('Failed to fetch buyer demands', err);
            } finally {
                setLoading(false);
            }
        }
        fetchDemands();
    }, []);

    return (
        <div className="mx-auto max-w-6xl p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <p className="font-semibold uppercase tracking-widest text-[#14532d]">Buyer Request Hub</p>
                    <h1 className="text-3xl font-bold text-stone-900">Open Buyer Demands</h1>
                    <p className="text-stone-600">Find active crop requests from buyers matching your harvest.</p>
                </div>
                <Link
                    href="/dashboard/farmer"
                    className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200"
                >
                    Back to Dashboard
                </Link>
            </div>

            {loading ? (
                <div className="py-12 text-center text-stone-500">Loading buyer demands...</div>
            ) : demands.length === 0 ? (
                <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center">
                    <h3 className="text-lg font-medium text-stone-800">No active buyer demands right now</h3>
                    <p className="mt-1 text-sm text-stone-500">Check back later when buyers post new crop requirements.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {demands.map((item) => (
                        <div key={item._id} className="rounded-xl bg-white p-5 shadow-sm border border-stone-100 flex flex-col justify-between">
                            <div>
                                <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                                    {item.category || 'Buyer Request'}
                                </span>
                                <h3 className="mt-2 text-xl font-bold text-stone-900">{item.title}</h3>
                                <p className="mt-1 text-sm text-stone-600 line-clamp-2">{item.description || 'No specific requirements listed.'}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-stone-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-[#14532d]">Target: ৳{item.targetPrice || 'Negotiable'}</span>
                                    <span className="text-xs text-stone-500 font-medium">Needed: {item.quantity} {item.unit}</span>
                                </div>
                                <p className="mt-1 text-xs text-stone-400">📍 Required in: {item.location || 'Any location'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
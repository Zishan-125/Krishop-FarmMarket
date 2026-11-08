'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Header from '@/Components/Header';

export default function ProductDetailsPage({ params }) {
    // Unwrap params using React.use() for Next.js App Router
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    // CRITICAL: Return null immediately if id is 'new' before any hooks or fetches run
    if (id === 'new') {
        return null;
    }

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!id || id === 'new') return;

        async function fetchProduct() {
            try {
                const res = await fetch(`/api/product/${id}`);
                if (!res.ok) throw new Error('Failed to fetch product');
                const data = await res.json();
                setProduct(data);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [id]);

    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#f8fbeF] py-10 px-5 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <Link href="/dashboard/products" className="text-sm font-semibold text-[#14532d] hover:underline">
                        ← Back to Inventory
                    </Link>

                    {loading ? (
                        <div className="mt-8 rounded-2xl bg-white p-12 text-center text-stone-500 shadow-sm animate-pulse">
                            Loading product details...
                        </div>
                    ) : error || !product ? (
                        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-700">
                            Product could not be found or has been removed.
                        </div>
                    ) : (
                        <div className="mt-6 rounded-2xl border border-[#e0e9e1] bg-white p-8 shadow-sm">
                            <span className="inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase text-[#14532d]">
                                {product.category || 'Product'}
                            </span>
                            <h1 className="mt-3 text-3xl font-bold text-stone-900">{product.title || product.name}</h1>
                            
                            <div className="mt-6 flex items-baseline gap-4">
                                <span className="text-3xl font-bold text-[#14532d]">৳{product.price}</span>
                                <span className="text-sm text-stone-500 font-medium">Stock available: {product.stock || product.quantity || 0}</span>
                            </div>

                            <div className="my-6 h-px bg-stone-100" />

                            <div>
                                <h3 className="text-lg font-semibold text-stone-800">Description</h3>
                                <p className="mt-2 text-stone-600 leading-relaxed">{product.description || 'No detailed description provided for this item.'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
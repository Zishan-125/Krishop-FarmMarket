'use client';

import Link from 'next/link';

export default function BuyerOrdersPage() {
    return (
        <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-stone-900">Your orders</h1>
            <p className="mt-3 text-stone-600">
                No KriShop produce orders have been placed yet.
            </p>
            <Link href="/marketplace" className="mt-6 inline-block rounded-lg bg-[#14532d] px-5 py-3 font-semibold text-white">
                Browse marketplace
            </Link>
        </div>
    );
}

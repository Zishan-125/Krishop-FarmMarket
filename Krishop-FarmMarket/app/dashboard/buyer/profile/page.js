'use client';

import Link from 'next/link';

export default function BuyerProfilePage() {
    return (
        <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-stone-900">Buyer profile</h1>
            <p className="mt-3 text-stone-600">
                Profile editing is not available yet. Your authenticated account can still browse the marketplace.
            </p>
            <Link href="/dashboard/buyer" className="mt-6 inline-block rounded-lg bg-green-700 px-5 py-3 font-semibold text-white">
                Back to dashboard
            </Link>
        </div>
    );
}

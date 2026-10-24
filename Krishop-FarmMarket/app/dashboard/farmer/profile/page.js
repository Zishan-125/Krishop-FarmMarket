'use client';

import Link from 'next/link';

export default function FarmerProfilePage() {
    return (
        <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-stone-900">Farmer profile</h1>
            <p className="mt-3 text-stone-600">
                Profile editing is not available yet. Your authenticated account is still used to authorize produce listings.
            </p>
            <Link href="/dashboard/farmer" className="mt-6 inline-block rounded-lg bg-green-700 px-5 py-3 font-semibold text-white">
                Back to dashboard
            </Link>
        </div>
    );
}

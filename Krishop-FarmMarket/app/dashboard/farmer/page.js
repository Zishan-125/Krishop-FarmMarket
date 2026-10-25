'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function FarmerDashboard() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <div className="p-8 text-stone-600">Loading your dashboard...</div>;
    }

    return (
        <div className="max-w-5xl">
            <div className="mb-8">
                <p className="font-semibold uppercase tracking-widest text-green-700">Farmer dashboard</p>
                <h1 className="mt-2 text-3xl font-bold text-stone-900">
                    Welcome{session?.user?.name ? `, ${session.user.name}` : ''}
                </h1>
                <p className="mt-2 text-stone-600">
                    Manage your produce listings and connect with buyers.
                </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
                <Link href="/listings/new" className="rounded-xl bg-green-700 p-6 text-white transition hover:bg-green-800">
                    <h2 className="text-xl font-bold">List produce</h2>
                    <p className="mt-2 text-sm text-green-50">Publish your available crops and asking price.</p>
                </Link>
                <Link href="/marketplace" className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md">
                    <h2 className="text-xl font-bold text-stone-900">Browse marketplace</h2>
                    <p className="mt-2 text-sm text-stone-600">See what buyers and other farmers are offering.</p>
                </Link>
                <Link href="/demands" className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md">
                    <h2 className="text-xl font-bold text-stone-900">Buyer demand</h2>
                    <p className="mt-2 text-sm text-stone-600">Find open requests that match your crops.</p>
                </Link>
                <Link href="/dashboard/farmer/profile" className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md">
                    <h2 className="text-xl font-bold text-stone-900">Your profile</h2>
                    <p className="mt-2 text-sm text-stone-600">Keep your contact and location details up to date.</p>
                </Link>
            </div>

            <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-stone-900">Next steps</h2>
                <ul className="mt-4 list-inside list-disc space-y-2 text-stone-600">
                    <li>Add an accurate produce listing with quantity, unit, quality, and location.</li>
                    <li>Review observed market prices before setting an asking price.</li>
                    <li>Use buyer conversations to agree on delivery and payment terms.</li>
                </ul>
            </section>
        </div>
    );
}

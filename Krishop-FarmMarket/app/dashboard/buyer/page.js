'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function BuyerDashboard() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <div className="p-8 text-stone-600">Loading your dashboard...</div>;
    }

    return (
        <div className="max-w-5xl">
            <div className="mb-8">
                <p className="font-semibold uppercase tracking-widest text-green-700">Buyer dashboard</p>
                <h1 className="mt-2 text-3xl font-bold text-stone-900">
                    Welcome{session?.user?.name ? `, ${session.user.name}` : ''}
                </h1>
                <p className="mt-2 text-stone-600">
                    Discover produce from farmers and keep track of your purchases.
                </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
                <Link href="/marketplace" className="rounded-xl bg-green-700 p-6 text-white transition hover:bg-green-800">
                    <h2 className="text-xl font-bold">Browse produce</h2>
                    <p className="mt-2 text-sm text-green-50">Search active listings by crop and location.</p>
                </Link>
                <Link href="/dashboard/buyer/orders" className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md">
                    <h2 className="text-xl font-bold text-stone-900">Your orders</h2>
                    <p className="mt-2 text-sm text-stone-600">Review your order history and purchase status.</p>
                </Link>
                <Link href="/dashboard/buyer/profile" className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md">
                    <h2 className="text-xl font-bold text-stone-900">Your profile</h2>
                    <p className="mt-2 text-sm text-stone-600">Keep your contact and delivery details up to date.</p>
                </Link>
            </div>

            <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-stone-900">Buying on KriShop</h2>
                <p className="mt-3 text-stone-600">
                    Listing prices are seller asking prices. Confirm quality, quantity, delivery arrangements, and payment terms with the seller before completing a purchase.
                </p>
            </section>
        </div>
    );
}

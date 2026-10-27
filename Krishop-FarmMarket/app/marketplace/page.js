'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import Header from '@/Components/Header';

function ListingCard({ item }) {
    return (
        <article className="group overflow-hidden rounded-2xl border border-[#e0e9e1] bg-white shadow-[0_8px_30px_rgba(23,74,54,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(23,74,54,0.11)]">
            <div className="relative flex h-40 items-end bg-gradient-to-br from-[#dcefe1] via-[#edf6e9] to-[#f4eadc] p-5">
                <div className="absolute right-4 top-4 flex gap-2">
                    <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#4d9f45]">{item.status}</span>
                    {item.fairPrice && <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${item.fairPrice.label === "Fair" ? "bg-[#dff4e4] text-[#1d7540]" : item.fairPrice.label === "Underpriced" ? "bg-[#e2f1fa] text-[#24658c]" : "bg-[#fff0d9] text-[#99611b]"}`}>{item.fairPrice.label}</span>}
                </div>
                <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#64806a]">{item.category}</p>
                    <h2 className="text-2xl font-bold capitalize text-[#174a36]">{item.crop}</h2>
                </div>
            </div>
            <div className="p-5">
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <p className="text-2xl font-bold text-[#174a36]">{item.askingPrice.toLocaleString()} <span className="text-sm font-semibold">BDT</span></p>
                        <p className="text-xs text-[#78877c]">per {item.priceUnit}</p>
                    </div>
                    <p className="rounded-lg bg-[#f1f7f1] px-3 py-2 text-sm font-semibold text-[#3f654b]">{item.quantity} {item.unit}</p>
                </div>
                <div className="my-4 h-px bg-[#edf1ed]" />
                <div className="flex items-center justify-between text-sm">
                    <span className="text-[#66736b]">⌖ {item.location}</span>
                    <span className="text-[#66736b]">{item.quality}</span>
                </div>
                <p className="mt-3 text-xs text-[#829087]">Listed by {item.seller?.username || 'Farmer'}</p>
            </div>
        </article>
    );
}

export default function MarketplacePage() {
    const [items, setItems] = useState([]);
    const [crop, setCrop] = useState('');
    const [location, setLocation] = useState('');
    const [grade, setGrade] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [state, setState] = useState('loading');

    const loadListings = useCallback(async () => {
        setState('loading');
        const params = new URLSearchParams();
        if (crop) params.set('crop', crop);
        if (location) params.set('location', location);
        if (grade) params.set('grade', grade);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        try {
            const response = await fetch(`/api/listings?${params}`);
            if (!response.ok) throw new Error('Unable to load listings');
            const data = await response.json();
            setItems(data.items);
            setState('ready');
        } catch {
            setState('error');
        }
    }, [crop, grade, location, maxPrice, minPrice]);

    useEffect(() => { loadListings(); }, [loadListings]);

    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#f8fbeF]">
                <section className="border-b border-[#d9e8c6] bg-[#edf7dc]">
                    <div className="mx-auto max-w-7xl px-5 pb-12 pt-10 lg:px-8 lg:pb-16 lg:pt-14">
                        <div className="max-w-3xl">
                            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#4d9f45]">Direct from Bangladesh&apos;s farmers</p>
                                    <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#14532d] sm:text-5xl">Good food starts with a fair connection.</h1>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5c7062]">Discover fresh produce from local farmers, compare asking prices, and build trusted relationships without unnecessary layers.</p>
                        </div>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#3f654b]">✓ Verified listings</span>
                            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#3f654b]">✓ Local sourcing</span>
                            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#3f654b]">✓ Transparent asking prices</span>
                        </div>
                    </div>
                </section>
                <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
                    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-[#17231d]">Explore available produce</h2>
                            <p className="mt-1 text-sm text-[#718078]">Browse what is available today from independent sellers.</p>
                        </div>
                        <Link href="/listings/new" className="rounded-xl bg-[#4d9f45] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#227242]">+ List your produce</Link>
                    </div>
                    <form onSubmit={(event) => { event.preventDefault(); loadListings(); }} className="mb-9 grid gap-3 rounded-2xl border border-[#e0e9e1] bg-white p-3 shadow-[0_8px_30px_rgba(23,74,54,0.05)] md:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_0.7fr_0.8fr_0.8fr_auto]">
                        <label className="flex items-center gap-3 rounded-xl bg-[#f4fae9] px-4 py-2.5"><span className="text-[#6d9077]">⌕</span><input value={crop} onChange={(event) => setCrop(event.target.value)} placeholder="Search by crop" className="w-full bg-transparent text-sm outline-none placeholder:text-[#91a99a]" /></label>
                        <label className="flex items-center gap-3 rounded-xl bg-[#f4fae9] px-4 py-2.5"><span className="text-[#6d9077]">⌖</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Filter by location" className="w-full bg-transparent text-sm outline-none placeholder:text-[#91a99a]" /></label>
                        <select value={grade} onChange={(event) => setGrade(event.target.value)} className="rounded-xl bg-[#f4fae9] px-4 py-2.5 text-sm text-[#5c7564] outline-none"><option value="">Any grade</option><option value="A">Grade A</option><option value="B">Grade B</option><option value="C">Grade C</option></select>
                        <input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Min ৳/unit" className="rounded-xl bg-[#f4fae9] px-4 py-2.5 text-sm outline-none placeholder:text-[#91a99a]" />
                        <input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Max ৳/unit" className="rounded-xl bg-[#f4fae9] px-4 py-2.5 text-sm outline-none placeholder:text-[#91a99a]" />
                        <button className="rounded-xl bg-[#14532d] px-7 py-3 text-sm font-bold text-white hover:bg-[#073b20]">Search listings</button>
                    </form>
                    {state === 'loading' && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((id) => <div key={id} className="h-72 animate-pulse rounded-2xl bg-[#e6eee7]" />)}</div>}
                    {state === 'error' && <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">Listings are unavailable right now. Please try again.</div>}
                    {state === 'ready' && items.length === 0 && <div className="rounded-2xl border border-dashed border-[#bfdcc7] bg-white p-12 text-center"><p className="font-semibold text-[#14532d]">No listings match your search</p><p className="mt-2 text-sm text-[#5c7564]">Try a different crop or location, or be the first farmer to list produce.</p><Link href="/listings/new" className="mt-5 inline-block font-bold text-[#4d9f45] hover:underline">Create a listing →</Link></div>}
                    {state === 'ready' && items.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <ListingCard key={item._id} item={item} />)}</div>}
                </div>
            </main>
        </>
    );
}

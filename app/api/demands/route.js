'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import Header from '@/Components/Header';

function DemandCard({ item }) {
    return (
        <article className="group overflow-hidden rounded-2xl border border-[#e0e9e1] bg-white shadow-[0_8px_30px_rgba(23,74,54,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(23,74,54,0.11)]">
            <div className="relative flex h-40 items-end bg-gradient-to-br from-[#fbf4e2] via-[#f7ebd4] to-[#f4e2cc] p-5">
                <div className="absolute right-4 top-4 flex gap-2">
                    <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#99611b]">{item.status}</span>
                    {item.grade && <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#3f654b]">Grade {item.grade}</span>}
                </div>
                <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6843]">{item.category || 'Buyer Requirement'}</p>
                    <h2 className="text-2xl font-bold capitalize text-[#3b2712]">{item.crop}</h2>
                </div>
            </div>
            <div className="p-5">
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <p className="text-2xl font-bold text-[#3b2712]">{item.targetPrice?.toLocaleString()} <span className="text-sm font-semibold">BDT</span></p>
                        <p className="text-xs text-[#78877c]">target price per {item.priceUnit || item.unit}</p>
                    </div>
                    <p className="rounded-lg bg-[#fbf7f0] px-3 py-2 text-sm font-semibold text-[#8a6843]">{item.quantity} {item.unit}</p>
                </div>
                <div className="my-4 h-px bg-[#edf1ed]" />
                <div className="flex items-center justify-between text-sm">
                    <span className="text-[#66736b]">⌖ {item.district || item.location}</span>
                    <span className="text-[#66736b]">Needed by {new Date(item.deliverywindow?.to || item.deliveryWindow?.to || Date.now()).toLocaleDateString()}</span>
                </div>
                <p className="mt-3 text-xs text-[#829087]">Requested by {item.buyer?.username || 'Buyer'}</p>
            </div>
        </article>
    );
}

export default function BuyerDemandsPage() {
    const [items, setItems] = useState([]);
    const [crop, setCrop] = useState('');
    const [district, setDistrict] = useState('');
    const [status, setStatus] = useState('open');
    const [state, setState] = useState('loading');

    const loadDemands = useCallback(async () => {
        setState('loading');
        const params = new URLSearchParams();
        if (crop) params.set('crop', crop);
        if (district) params.set('district', district);
        if (status) params.set('status', status);
        try {
            const response = await fetch(`/api/demands?${params}`);
            if (!response.ok) throw new Error('Unable to load demands');
            const data = await response.json();
            // Safely extract items array from API response object
            setItems(Array.isArray(data) ? data : (data.items || data.demands || []));
            setState('ready');
        } catch {
            setState('error');
        }
    }, [crop, district, status]);

    useEffect(() => { loadDemands(); }, [loadDemands]);

    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#f8fbeF]">
                <section className="border-b border-[#d9e8c6] bg-[#edf7dc]">
                    <div className="mx-auto max-w-7xl px-5 pb-12 pt-10 lg:px-8 lg:pb-16 lg:pt-14">
                        <div className="max-w-3xl">
                            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#4d9f45]">Buyer Request Hub</p>
                            <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#14532d] sm:text-5xl">Active requests from verified buyers.</h1>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5c7062]">Find open crop demands matching your harvest quantities and connect directly for secure trade agreements.</p>
                        </div>
                    </div>
                </section>
                <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
                    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-[#17231d]">Explore buyer demands</h2>
                            <p className="mt-1 text-sm text-[#718078]">Browse open purchase requirements from buyers and processors.</p>
                        </div>
                    </div>
                    <form onSubmit={(event) => { event.preventDefault(); loadDemands(); }} className="mb-9 grid gap-3 rounded-2xl border border-[#e0e9e1] bg-white p-3 shadow-[0_8px_30px_rgba(23,74,54,0.05)] md:grid-cols-3">
                        <label className="flex items-center gap-3 rounded-xl bg-[#f4fae9] px-4 py-2.5"><span className="text-[#6d9077]">⌕</span><input value={crop} onChange={(event) => setCrop(event.target.value)} placeholder="Search by crop" className="w-full bg-transparent text-sm outline-none placeholder:text-[#91a99a]" /></label>
                        <label className="flex items-center gap-3 rounded-xl bg-[#f4fae9] px-4 py-2.5"><span className="text-[#6d9077]">⌖</span><input value={district} onChange={(event) => setDistrict(event.target.value)} placeholder="Filter by district" className="w-full bg-transparent text-sm outline-none placeholder:text-[#91a99a]" /></label>
                        <button className="rounded-xl bg-[#14532d] px-7 py-3 text-sm font-bold text-white hover:bg-[#073b20]">Filter demands</button>
                    </form>
                    {state === 'loading' && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((id) => <div key={id} className="h-72 animate-pulse rounded-2xl bg-[#e6eee7]" />)}</div>}
                    {state === 'error' && <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">Demands are unavailable right now. Please try again.</div>}
                    {state === 'ready' && items.length === 0 && <div className="rounded-2xl border border-dashed border-[#bfdcc7] bg-white p-12 text-center"><p className="font-semibold text-[#14532d]">No buyer demands match your filters</p><p className="mt-2 text-sm text-[#5c7564]">Check back later as new buyer purchase requirements are posted.</p></div>}
                    {state === 'ready' && items.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <DemandCard key={item._id} item={item} />)}</div>}
                </div>
            </main>
        </>
    );
}
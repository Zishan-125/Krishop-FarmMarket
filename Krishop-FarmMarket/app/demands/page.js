'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '@/Components/Header';

export default function DemandBoardPage() {
    const [demands, setDemands] = useState([]);
    const [state, setState] = useState('loading');
    const [form, setForm] = useState({ crop: 'tomato', quantity: '', unit: 'kg', targetPrice: '', location: '', deliveryFrom: '', deliveryTo: '', grade: 'any' });
    const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

    async function loadDemands() {
        setState('loading');
        try {
            const response = await fetch('/api/demands');
            if (!response.ok) throw new Error();
            setDemands((await response.json()).items);
            setState('ready');
        } catch {
            setState('error');
        }
    }

    useEffect(() => { loadDemands(); }, []);

    async function createDemand(event) {
        event.preventDefault();
        setState('saving');
        const response = await fetch('/api/demands', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (!response.ok) {
            setState('error');
            return;
        }
        setForm({ ...form, quantity: '', targetPrice: '', location: '', deliveryFrom: '', deliveryTo: '' });
        loadDemands();
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#f4fae9] px-5 py-10">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4d9f45]">Demand board</p>
                            <h1 className="mt-2 text-4xl font-bold text-[#14532d]">What buyers need</h1>
                            <p className="mt-2 text-[#5c7564]">Farmers can use open requests to prioritize crops and start a conversation.</p>
                        </div>
                        <Link href="/marketplace" className="font-semibold text-[#4d9f45] hover:underline">Browse listings →</Link>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                        <form onSubmit={createDemand} className="rounded-2xl border border-[#cfe5bb] bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-[#14532d]">Post a buyer demand</h2>
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {['crop', 'quantity', 'targetPrice', 'location', 'deliveryFrom', 'deliveryTo'].map((name) => <label key={name} className="text-xs font-bold capitalize text-[#526d5a]">{name}<input required={name !== 'location'} type={name.includes('delivery') ? 'date' : name === 'quantity' || name === 'targetPrice' ? 'number' : 'text'} name={name} value={form[name]} onChange={update} className="mt-1 w-full rounded-lg border border-[#cfe5bb] p-2.5 text-sm font-normal outline-none focus:border-[#4d9f45]" /></label>)}
                                <label className="text-xs font-bold text-[#526d5a]">Unit<select name="unit" value={form.unit} onChange={update} className="mt-1 w-full rounded-lg border border-[#cfe5bb] p-2.5 text-sm font-normal">{['kg', 'ตัน', 'piece', 'crate', 'bag'].map((unit) => <option key={unit}>{unit}</option>)}</select></label>
                                <label className="text-xs font-bold text-[#526d5a]">Grade<select name="grade" value={form.grade} onChange={update} className="mt-1 w-full rounded-lg border border-[#cfe5bb] p-2.5 text-sm font-normal">{['any', 'A', 'B', 'C'].map((grade) => <option key={grade}>{grade}</option>)}</select></label>
                            </div>
                            {state === 'error' && <p className="mt-4 text-sm text-red-700">Sign in as a buyer and check your details before trying again.</p>}
                            <button disabled={state === 'saving'} className="mt-5 w-full rounded-lg bg-[#14532d] px-4 py-3 text-sm font-bold text-white hover:bg-[#073b20] disabled:opacity-60">{state === 'saving' ? 'Posting...' : 'Post demand'}</button>
                        </form>
                        <section>
                            <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-bold text-[#10291b]">Open requests</h2><span className="text-sm text-[#718078]">{demands.length} requests</span></div>
                            {state === 'loading' && <div className="rounded-xl bg-white p-8 text-center text-[#718078]">Loading demand board...</div>}
                            {state !== 'loading' && demands.length === 0 && <div className="rounded-xl border border-dashed border-[#bfdcc7] bg-white p-10 text-center text-[#718078]">No open requests yet.</div>}
                            <div className="space-y-3">{demands.map((demand) => <article key={demand._id} className="rounded-xl border border-[#dceadf] bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-bold capitalize text-[#14532d]">{demand.crop}</h3><p className="mt-1 text-sm text-[#667b6d]">{demand.quantity} {demand.unit} · Grade {demand.grade}</p></div><p className="font-bold text-[#4d9f45]">৳{demand.targetPrice.toLocaleString()} / {demand.priceUnit}</p></div><div className="mt-4 flex flex-wrap gap-3 text-xs text-[#718078]"><span>⌖ {demand.location}</span><span>Delivery by {new Date(demand.deliveryWindow.to).toLocaleDateString()}</span><span>Buyer: {demand.buyer?.username || 'Buyer'}</span></div></article>)}</div>
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}

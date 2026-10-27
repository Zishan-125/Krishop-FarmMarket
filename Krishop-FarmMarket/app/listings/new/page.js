'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/Components/Header';

const initial = { crop: '', category: 'Vegetables', quantity: '', unit: 'kg', askingPrice: '', priceUnit: 'kg', location: '', district: '', quality: '', grade: 'B', harvestDate: '', description: '' };

export default function NewListingPage() {
    const [form, setForm] = useState(initial);
    const [message, setMessage] = useState('');
    const router = useRouter();
    const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
    async function submit(event) {
        event.preventDefault();
        setMessage('Saving...');
        const response = await fetch('/api/listings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        const data = await response.json();
        if (!response.ok) { setMessage(data.message || 'Could not save listing'); return; }
        router.push('/marketplace');
    }
    return <><Header /><main className="min-h-screen bg-stone-50 px-5 py-10"><form onSubmit={submit} className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-3xl font-bold">List your produce</h1><p className="mb-6 text-stone-600">Share accurate details so buyers can make informed decisions.</p>
        <div className="grid gap-4 sm:grid-cols-2">
            {['crop', 'category', 'quantity', 'askingPrice', 'location', 'district', 'quality', 'harvestDate'].map((name) => <label key={name} className="text-sm font-semibold capitalize">{name}<input type={name === 'harvestDate' ? 'date' : name === 'quantity' || name === 'askingPrice' ? 'number' : 'text'} name={name} value={form[name]} onChange={update} required={['crop', 'category', 'quantity', 'askingPrice', 'location'].includes(name)} className="mt-1 w-full rounded-lg border p-3 font-normal" /></label>)}
            <label className="text-sm font-semibold">Unit<select name="unit" value={form.unit} onChange={update} className="mt-1 w-full rounded-lg border p-3 font-normal">{['kg', 'ตัน', 'piece', 'crate', 'bag'].map((unit) => <option key={unit}>{unit}</option>)}</select></label>
            <label className="text-sm font-semibold">Price unit<select name="priceUnit" value={form.priceUnit} onChange={update} className="mt-1 w-full rounded-lg border p-3 font-normal">{['kg', 'ตัน', 'piece', 'crate', 'bag'].map((unit) => <option key={unit}>{unit}</option>)}</select></label>
            <label className="text-sm font-semibold">Grade<select name="grade" value={form.grade} onChange={update} className="mt-1 w-full rounded-lg border p-3 font-normal">{['A', 'B', 'C'].map((grade) => <option key={grade}>{grade}</option>)}</select></label>
        </div>
        <label className="mt-4 block text-sm font-semibold">Description<textarea name="description" value={form.description} onChange={update} rows="3" className="mt-1 w-full rounded-lg border p-3 font-normal" /></label>
        {message && <p className="mt-4 text-sm text-red-700">{message}</p>}<button className="mt-6 rounded-lg bg-[#14532d] px-5 py-3 font-semibold text-white">Publish listing</button>
    </form></main></>;
}

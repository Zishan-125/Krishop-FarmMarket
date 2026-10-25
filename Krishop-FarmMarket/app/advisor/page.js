'use client';

import { useState } from 'react';
import Header from '@/Components/Header';

export default function AdvisorPage() {
    const [crop, setCrop] = useState('tomato');
    const [language, setLanguage] = useState('en');
    const [answer, setAnswer] = useState(null);
    const [loading, setLoading] = useState(false);

    async function ask(event) {
        event.preventDefault();
        setLoading(true);
        const response = await fetch('/api/advisor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ crop, language }) });
        setAnswer(await response.json());
        setLoading(false);
    }

    return <><Header /><main className="min-h-screen bg-[#f3faf4] px-5 py-12"><div className="mx-auto max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2f8a52]">KriShop advisor</p><h1 className="mt-2 text-4xl font-bold text-[#0d542f]">Turn market information into a next step.</h1><p className="mt-3 text-[#5c7564]">Ask in English or Bangla. Advice is grounded in available forecast data and clearly labels estimates.</p><form onSubmit={ask} className="mt-8 rounded-2xl border border-[#d6e8d9] bg-white p-6 shadow-sm"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-[#526d5a]">Crop<input value={crop} onChange={(event) => setCrop(event.target.value)} className="mt-1 w-full rounded-lg border border-[#d6e8d9] p-3 font-normal" /></label><label className="text-sm font-bold text-[#526d5a]">Language<select value={language} onChange={(event) => setLanguage(event.target.value)} className="mt-1 w-full rounded-lg border border-[#d6e8d9] p-3 font-normal"><option value="en">English</option><option value="bn">বাংলা</option></select></label></div><button disabled={loading} className="mt-5 rounded-lg bg-[#0d542f] px-5 py-3 font-bold text-white disabled:opacity-60">{loading ? 'Preparing advice...' : 'Get advice'}</button></form>{answer && <section className="mt-6 rounded-2xl bg-[#0d542f] p-7 text-white"><p className="text-sm leading-7">{answer.answer}</p><div className="mt-6 border-t border-white/15 pt-4 text-xs text-[#b9e4c3]">Sources: {answer.citations?.join(', ')}</div></section>}</div></main></>;
}

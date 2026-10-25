'use client';

import { useEffect, useState } from 'react';
import Header from '@/Components/Header';
import { MARKET_CONFIG } from '@/config/market';

export default function PriceIntelligencePage() {
    const [crop, setCrop] = useState('tomato');
    const [hub, setHub] = useState(MARKET_CONFIG.hubs[0].name);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/forecast?crop=${encodeURIComponent(crop)}&hub=${encodeURIComponent(hub)}&horizon=30`)
            .then((response) => response.json())
            .then(setForecast)
            .finally(() => setLoading(false));
    }, [crop, hub]);

    const max = Math.max(...(forecast?.points?.map((point) => point.upper) || [1]));
    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#f3faf4] px-5 py-10 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2f8a52]">Pricing intelligence</p>
                    <h1 className="mt-2 text-4xl font-bold text-[#0d542f]">Make selling decisions with context.</h1>
                    <p className="mt-3 max-w-2xl text-[#5c7564]">Forecasts are estimates, not guaranteed prices. Use them with current local observations and your own quality and logistics information.</p>
                    <div className="mt-8 grid gap-3 rounded-2xl border border-[#d6e8d9] bg-white p-4 md:grid-cols-[1fr_1fr]">
                        <label className="text-sm font-bold text-[#526d5a]">Crop<select value={crop} onChange={(event) => setCrop(event.target.value)} className="mt-1 w-full rounded-lg border border-[#d6e8d9] p-3 font-normal">{MARKET_CONFIG.crops.map((item) => <option key={item}>{item}</option>)}</select></label>
                        <label className="text-sm font-bold text-[#526d5a]">Trading hub<select value={hub} onChange={(event) => setHub(event.target.value)} className="mt-1 w-full rounded-lg border border-[#d6e8d9] p-3 font-normal">{MARKET_CONFIG.hubs.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
                    </div>
                    {loading ? <div className="mt-6 h-80 animate-pulse rounded-2xl bg-[#e3f0e5]" /> : <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">
                        <section className="rounded-2xl border border-[#d6e8d9] bg-white p-6">
                            <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold capitalize text-[#0d542f]">{crop} forecast</h2><p className="mt-1 text-sm text-[#718078]">Next {forecast.horizon} days · BDT/kg</p></div><span className="rounded-full bg-[#fff4e5] px-3 py-1 text-xs font-bold text-[#a6631d]">Estimate</span></div>
                            <div className="mt-8 flex h-64 items-end gap-1 border-b border-l border-[#dceadf] px-2">{forecast.points.filter((_, index) => index % 2 === 0).map((point) => <div key={point.date} className="group relative flex-1" style={{ height: `${Math.max(8, (point.yhat / max) * 100)}%` }}><div className="h-full rounded-t bg-[#2f8a52] group-hover:bg-[#0d542f]" /><span className="absolute bottom-full left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#0d542f] px-2 py-1 text-[10px] text-white group-hover:block">৳{point.yhat}</span></div>)}</div>
                            <div className="mt-4 flex justify-between text-xs text-[#829087]"><span>{forecast.points[0].date}</span><span>{forecast.points.at(-1).date}</span></div>
                        </section>
                        <section className="rounded-2xl bg-[#0d542f] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8bd69e]">Plain-language insight</p><h2 className="mt-4 text-2xl font-bold">Monitor {crop} around {forecast.bestTimeToSell}.</h2><p className="mt-4 text-sm leading-6 text-[#c7e5cd]">The offline baseline identifies this as the strongest estimated point for the selected hub. Confirm with local buyers before committing.</p><div className="mt-8 border-t border-white/15 pt-4 text-sm"><span className="text-[#a9d6b2]">Model</span><p className="mt-1 font-semibold">{forecast.model}</p><p className="mt-3 text-xs text-[#a9d6b2]">{forecast.warning}</p></div></section>
                    </div>}
                </div>
            </main>
        </>
    );
}

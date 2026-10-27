"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

const CROPS = ["chickpea", "cucumber", "garlic", "green_chilli", "sweet_pumpkin"];
const HUBS = ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Sylhet"];
const label = (c) => c.replace("_", " ");
const TABS = [["journey", "My sale"], ["market", "Market data"], ["marketplace", "Buyers & matching"], ["dispatch", "Dispatch"], ["trace", "Trace a batch"], ["evidence", "Evidence"]];

async function api(path, opts) {
    const res = await fetch(path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
}
const run = (fn) => fn().catch((e) => toast.error(e.message));
const post = (path, body) => api(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const money = (n) => {
    if (n == null || Number.isNaN(Number(n))) return "-";
    const v = Number(n);
    return `${v < 0 ? "-" : ""}৳${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function Select({ label: l, value, onChange, options }) {
    return (
        <label className="block text-sm">
            <span className="text-gray-600">{l}</span>
            <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border rounded px-2 py-2 bg-white capitalize">
                {options.map((o) => <option key={o} value={o}>{o.replace("_", " ")}</option>)}
            </select>
        </label>
    );
}
function Num({ label: l, value, onChange, step = "1" }) {
    return (
        <label className="block text-sm">
            <span className="text-gray-600">{l}</span>
            <input type="number" min="0" step={step} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border rounded px-2 py-2" />
        </label>
    );
}
const Btn = ({ children, ...p }) => <button {...p} className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white rounded px-4 py-2">{children}</button>;
const Card = ({ title, children }) => <section className="border rounded-lg p-4 bg-white shadow-sm">{title && <h3 className="font-semibold mb-3">{title}</h3>}{children}</section>;

function PriceChart({ data }) {
    const W = 640, H = 240, P = 36;
    const pts = [...data.history.map((d) => ({ ...d })), ...data.forecast.map((d) => ({ ...d }))];
    const lo = Math.min(...pts.map((p) => p.low ?? p.price)) * 0.95, hi = Math.max(...pts.map((p) => p.high ?? p.price)) * 1.05;
    const x = (i) => P + (i * (W - 2 * P)) / (pts.length - 1), y = (v) => H - P - ((v - lo) / (hi - lo)) * (H - 2 * P);
    const h = data.history.length;
    const hist = data.history.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.price)}`).join(" ");
    const fc = [[h - 1, data.history[h - 1].price], ...data.forecast.map((d, i) => [h + i, d.price])].map(([i, v], k) => `${k ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
    const band = data.forecast.map((d, i) => `${x(h + i)},${y(d.high)}`).join(" ") + " " + [...data.forecast].reverse().map((d, i) => `${x(h + data.forecast.length - 1 - i)},${y(d.low)}`).join(" ");
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Price history and forecast">
            <polygon points={band} fill="#16a34a" opacity="0.15" />
            <path d={hist} fill="none" stroke="#374151" strokeWidth="2" />
            <path d={fc} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeDasharray="5 4" />
            <line x1={x(h - 1)} x2={x(h - 1)} y1={P / 2} y2={H - P} stroke="#9ca3af" strokeDasharray="2 3" />
            <text x={P} y={14} fontSize="11" fill="#6b7280">৳{hi.toFixed(0)}</text>
            <text x={P} y={H - P + 14} fontSize="11" fill="#6b7280">৳{lo.toFixed(0)}</text>
            <text x={x(h - 1) + 4} y={14} fontSize="11" fill="#16a34a">forecast (80% band)</text>
        </svg>
    );
}

function Seasonality({ s }) {
    const entries = Object.entries(s.index).filter(([, v]) => v != null);
    const max = Math.max(...entries.map(([, v]) => v)), min = Math.min(...entries.map(([, v]) => v));
    return (
        <div className="flex items-end gap-1 h-28">
            {entries.map(([m, v]) => (
                <div key={m} className="flex-1 text-center text-[10px]" title={`${m}: ${v}`}>
                    <div className={m === s.best_month ? "bg-green-600" : m === s.worst_month ? "bg-red-400" : "bg-gray-300"} style={{ height: `${20 + ((v - min) / (max - min || 1)) * 70}px` }} />
                    {m}
                </div>
            ))}
        </div>
    );
}

function Stale({ days, through }) {
    if (!days || days < 30) return null;
    return <p className="p-3 rounded bg-amber-50 border border-amber-300 text-sm text-amber-900">Latest price in the dataset is <b>{through}</b> ({days} days ago). Forecasts start from that date, so treat them as a demonstration of the method until newer prices are appended to <code>ml-service/data/market_ml_dataset_final.csv</code>.</p>;
}

function Prices() {
    const [crop, setCrop] = useState("garlic"), [pt, setPt] = useState("wholesale");
    const [fc, setFc] = useState(null), [ins, setIns] = useState(null), [snap, setSnap] = useState(null), [busy, setBusy] = useState(false);
    useEffect(() => { run(async () => setSnap(await api("/api/farmmarket/snapshot"))); }, []);
    useEffect(() => {
        setBusy(true);
        run(async () => { const [a, b] = await Promise.all([api(`/api/farmmarket/forecast?crop=${crop}&priceType=${pt}&horizon=14`), api(`/api/farmmarket/snapshot?crop=${crop}`)]); setFc(a); setIns(b); }).finally(() => setBusy(false));
    }, [crop, pt]);
    const bt = fc?.backtest;
    return (
        <div className="space-y-4">
            {fc && <Stale days={fc.stale_days} through={fc.data_through} />}
            {fc?.last_obs_warning && <p className="p-3 rounded bg-amber-50 border border-amber-300 text-sm text-amber-900">{fc.last_obs_warning}</p>}
            <div className="grid grid-cols-2 gap-3 max-w-md"><Select label="Crop" value={crop} onChange={setCrop} options={CROPS} /><Select label="Price level" value={pt} onChange={setPt} options={["wholesale", "retail"]} /></div>
            {busy && <p className="text-sm text-gray-500">Loading…</p>}
            {fc && (
                <Card title={`${label(crop)} (${pt}): ${money(fc.last_price)}/kg on ${fc.data_through}, outlook ${fc.expected_change_7d_pct >= 0 ? "+" : ""}${fc.expected_change_7d_pct}% over 7 days`}>
                    <PriceChart data={fc} />
                    <p className="text-xs text-gray-500 mt-2">Model: {fc.model} (best of 6 on past data). {bt ? `Error on unseen data: ${bt.mape_1d}% at 1 day, ${bt.mape_7d}% at 7 days, ${bt.mape_14d}% at 14 days (${bt.origins} backtests; simple “price stays put” baseline: ${bt.naive_mape_14d}% at 14 days).` : "Run python -m farmmarket.train for backtest metrics."}</p>
                </Card>
            )}
            {ins && (
                <div className="grid md:grid-cols-2 gap-4">
                    <Card title={`Best month to sell: ${ins.seasonality.best_month} (index ${ins.seasonality.best_index}); weakest: ${ins.seasonality.worst_month}`}>
                        <Seasonality s={ins.seasonality} />
                        <p className="text-xs text-gray-500 mt-2">Typical seasonal swing {ins.seasonality.swing_pct}% from the 2020-2025 data. Storage-friendly crops can use this; check shelf life before holding.</p>
                    </Card>
                    <Card title="Who captures the consumer price?">
                        <p className="text-sm">Wholesale is <b>{ins.spread.wholesale_share_pct}%</b> of retail over the last 90 days: {money(ins.spread.wholesale_90d)} vs {money(ins.spread.retail_90d)} per kg, a {money(ins.spread.margin_per_kg)}/kg margin after the wholesale stage.</p>
                        <p className="text-sm mt-2">Typical weekly move (90th pct): {ins.volatility.weekly_move_p90_pct}%. Reference floor (20th pct of last year): {money(ins.price_floor_p20)}/kg.</p>
                        <p className="text-xs text-gray-500 mt-2">Wholesale share by year: {Object.entries(ins.spread.share_by_year_pct).map(([y, v]) => `${y}: ${v}%`).join(" · ")}</p>
                    </Card>
                </div>
            )}
            {snap && (
                <Card title="All crops at a glance">
                    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th>Crop</th><th>Wholesale</th><th>Retail</th><th>Wholesale share</th><th>7-day outlook</th><th>14-day error</th><th>Best month</th></tr></thead><tbody>
                        {snap.crops.map((c) => <tr key={c.crop} className="border-t"><td className="py-1">{c.name}</td><td>{money(c.wholesale)}</td><td>{money(c.retail_90d)}</td><td>{c.wholesale_share_pct}%</td><td className={c.expected_change_7d_pct >= 0 ? "text-green-700" : "text-red-600"}>{c.expected_change_7d_pct >= 0 ? "+" : ""}{c.expected_change_7d_pct}%</td><td>{c.mape_14d ?? "-"}%</td><td>{c.best_month}</td></tr>)}
                    </tbody></table></div>
                </Card>
            )}
        </div>
    );
}

function Evidence() {
    const [r, setR] = useState(null);
    useEffect(() => { run(async () => setR(await api("/api/farmmarket/model-report"))); }, []);
    if (!r) return <p className="text-sm text-gray-500">Loading backtest report…</p>;
    return (
        <Card title="Which model forecasts each price best? (average % error over 1-14 days, rolling backtests on unseen data)">
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th>Series</th><th>Selected</th><th>Naive</th><th>Seasonal</th><th>ETS</th><th>Prophet</th><th>GBM</th><th>GBM+weather</th><th>Skill vs naive</th></tr></thead><tbody>
                {Object.values(r.series).map((s) => <tr key={s.crop + s.price_type} className="border-t"><td className="py-1">{label(s.crop)} · {s.price_type}</td><td className="font-medium">{s.selected.replace("_", " ")}</td>{["naive", "seasonal_naive", "ets", "prophet", "gbm_no_weather", "gbm_lagged_weather"].map((m) => <td key={m} className={s.selected === m ? "text-green-700 font-semibold" : ""}>{s.models[m]?.mape_mean ?? "-"}%</td>)}<td>{s.skill_vs_naive_pct}%</td></tr>)}
            </tbody></table></div>
            <p className="text-xs text-gray-500 mt-3">Trained {r.trained_at}. Data: {r.data_quality.raw_rows} rows, {r.data_quality.date_range[0]} to {r.data_quality.date_range[1]}, national prices (no market location). These prices change slowly, so a plain “tomorrow equals today” baseline is hard to beat; where no model beats it the app uses it and says so.</p>
        </Card>
    );
}


function NetBand({ options, bestDay }) {
    const W = 640, H = 220, P = 36, n = options.length;
    const lo = Math.min(...options.map((o) => o.net_per_kg_low)) * 0.97, hi = Math.max(...options.map((o) => o.net_per_kg_high)) * 1.03;
    const x = (i) => P + (i * (W - 2 * P)) / (n - 1), y = (v) => H - P - ((v - lo) / (hi - lo || 1)) * (H - 2 * P);
    const line = options.map((o, i) => `${i ? "L" : "M"}${x(i)},${y(o.net_per_kg)}`).join(" ");
    const band = options.map((o, i) => `${x(i)},${y(o.net_per_kg_high)}`).join(" ") + " " + [...options].reverse().map((o, i) => `${x(n - 1 - i)},${y(o.net_per_kg_low)}`).join(" ");
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Net price per kg by selling day with uncertainty band">
            <polygon points={band} fill="#16a34a" opacity="0.15" />
            <path d={line} fill="none" stroke="#16a34a" strokeWidth="2.5" />
            <circle cx={x(0)} cy={y(options[0].net_per_kg)} r="5" fill="#374151" /><text x={x(0) + 8} y={y(options[0].net_per_kg) - 8} fontSize="11" fill="#374151">sell today</text>
            <circle cx={x(bestDay)} cy={y(options[bestDay].net_per_kg)} r="6" fill="#16a34a" /><text x={x(bestDay) + 8} y={y(options[bestDay].net_per_kg) + 16} fontSize="11" fill="#15803d">{bestDay === 0 ? "best: today" : `best: day ${bestDay}`}</text>
            <text x={P} y={14} fontSize="11" fill="#6b7280">৳{hi.toFixed(0)}</text><text x={P} y={H - P + 14} fontSize="11" fill="#6b7280">৳{lo.toFixed(0)}</text>
            <text x={W - P} y={H - P + 14} fontSize="11" fill="#6b7280" textAnchor="end">days from today →</text>
        </svg>
    );
}

function Journey() {
    const [f, setF] = useState({ crop: "garlic", hub: "Sylhet", dest: "Dhaka", qty: "500", cost: "", quality: 1 });
    const [photo, setPhoto] = useState(null), [vision, setVision] = useState(null), [r, setR] = useState(null), [advice, setAdvice] = useState(null), [lang, setLang] = useState("bn"), [uplift, setUplift] = useState(null), [offer, setOffer] = useState(""), [busy, setBusy] = useState(false);
    const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
    const seq = useRef(0);
    useEffect(() => { api("/api/farmmarket/uplift").then(setUplift).catch(() => {}); api("/api/farmmarket/vision-report").then(setVision).catch(() => {}); }, []);
    useEffect(() => {
        const id = ++seq.current;
        const t = setTimeout(() => {
            setBusy(true);
            post("/api/farmmarket/fair-price", { crop: f.crop, originHub: f.hub, destinationHub: f.dest, quantityKg: +f.qty, qualityFactor: +f.quality, costPerKg: f.cost ? +f.cost : null })
                .then((res) => { if (id === seq.current) setR(res); })
                .catch((e) => toast.error(e.message)).finally(() => setBusy(false));
        }, 350);
        return () => clearTimeout(t);
    }, [f]);
    useEffect(() => {
        if (!r) return;
        const o = r.options, b = r.best, last = o[Math.min(7, o.length - 1)];
        post("/api/farmmarket/advice", { lang, context: { crop: r.crop, grade: photo?.grade ?? "-", wait_days: b.wait_days, ask_per_kg: r.recommended_ask_per_kg, expected_change_7d_pct: +((last.gross_price / o[0].gross_price - 1) * 100).toFixed(1), low: last.net_per_kg_low.toFixed(0), high: last.net_per_kg_high.toFixed(0) } })
            .then(setAdvice).catch(() => {});
    }, [r, lang, photo]);
    const upload = (file) => {
        if (!file) return;
        const fd = new FormData(); fd.append("file", file);
        run(async () => { const g = await api("/api/farmmarket/grade", { method: "POST", body: fd }); setPhoto(g); if (g.price_multiplier) set("quality")(g.price_multiplier); });
    };
    const better = useMemo(() => {
        if (!r) return null;
        const q2 = +f.quality * 1.1;
        const net = (o, q) => o.gross_price * q * (1 - o.spoilage_pct / 100) - r.freight_per_kg;
        const now = Math.max(...r.options.map((o) => net(o, +f.quality))), up = Math.max(...r.options.map((o) => net(o, q2)));
        return up - now;
    }, [r, f.quality]);
    const u = uplift?.crops?.[f.crop];
    return (
        <div className="space-y-4">
            <Card title="1. Tell us about your harvest">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Select label="Crop" value={f.crop} onChange={set("crop")} options={CROPS} /><Select label="My hub" value={f.hub} onChange={set("hub")} options={HUBS} /><Select label="Buyer hub" value={f.dest} onChange={set("dest")} options={HUBS} />
                    <Num label="Quantity (kg)" value={f.qty} onChange={set("qty")} /><Num label="My cost per kg (optional)" step="0.5" value={f.cost} onChange={set("cost")} />
                    <label className="block text-sm"><span className="text-gray-600">Photo of produce (optional)</span><input type="file" accept="image/*" capture="environment" className="mt-1 w-full text-sm" onChange={(e) => upload(e.target.files?.[0])} /></label>
                </div>
                {photo && (photo.error ? <p className="mt-3 text-red-600 text-sm">{photo.error}</p> : (
                    <p className="mt-3 text-sm">Photo result: grade <b>{photo.grade}</b> (price ×{photo.price_multiplier}){photo.disease ? ` · ${photo.disease} on ${photo.plant}` : ""}{photo.confidence ? ` · confidence ${photo.confidence}` : ""} <span className="text-gray-500">[{photo.backend}{photo.fallback_reason ? `: ${photo.fallback_reason}` : ""}]</span></p>
                ))}
                {vision && <p className="text-xs text-gray-500 mt-1">Photo model: trained on {vision.n_train} real PlantVillage images ({vision.n_classes} classes), {Math.round(vision.test_accuracy * 1000) / 10}% held-out accuracy on lab photos; field photos will score lower. It knows tomato, potato, pepper and squash leaves, not your crop directly; the grade is a quality signal.</p>}
            </Card>
            {busy && !r && <p className="text-sm text-gray-500">Calculating…</p>}
            {r && (
                <Card title="2. Your fair-price recommendation">
                    <Stale days={r.data_stale_days} through={r.data_through} />
                    {r.last_obs_warning && <p className="mt-2 p-3 rounded bg-amber-50 border border-amber-300 text-sm text-amber-900">{r.last_obs_warning}</p>}
                    <div className="mt-3 grid md:grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg bg-green-50 p-3"><div className="text-xs text-gray-500">Ask price</div><div className="text-3xl font-bold text-green-700">{money(r.recommended_ask_per_kg)}</div><div className="text-xs">per kg</div></div>
                        <div className="rounded-lg bg-green-50 p-3"><div className="text-xs text-gray-500">Decision</div><div className="text-2xl font-bold">{r.best.wait_days === 0 ? "Sell today" : `Wait ${r.best.wait_days} day${r.best.wait_days > 1 ? "s" : ""}`}</div><div className="text-xs">net {money(r.best.net_per_kg)}/kg {r.best.wait_days === 0 ? "(today's price is known)" : `(likely ${money(r.best.net_per_kg_low)} to ${money(r.best.net_per_kg_high)})`}</div></div>
                        <div className="rounded-lg bg-green-50 p-3"><div className="text-xs text-gray-500">This lot ({f.qty} kg)</div><div className="text-2xl font-bold">{money(r.best.net_per_kg * +f.qty)}</div><div className="text-xs">after {money(r.freight_per_kg)}/kg freight and {r.best.spoilage_pct}% spoilage</div></div>
                    </div>
                    <div className="mt-4"><NetBand options={r.options} bestDay={r.best.wait_days} /></div>
                    <p className="text-xs text-gray-500">Green band: 80% range from the model's measured past errors ({r.model}; error at 14 days {r.backtest?.mape_14d}% vs {r.backtest?.naive_mape_14d}% for “price stays put”). {r.caveat}</p>
                    {r.floor.price_is_depressed && <p className="mt-2 text-sm text-amber-800">Today's price is in the lowest fifth of the last year ({money(r.floor.market_p20_365d)} reference). {r.floor.shelf_life_days >= 60 ? "This crop stores well, so you could hold it, but the model sees no reliable timing signal for the next 14 days; any seasonal recovery is not guaranteed." : "This crop does not store long, so waiting is risky."}</p>}
                    <div className="mt-4 grid md:grid-cols-2 gap-4 items-end">
                        <label className="block text-sm"><span className="text-gray-600">What-if: grade quality factor ×{(+f.quality).toFixed(2)}</span><input type="range" min="0.6" max="1.1" step="0.05" value={f.quality} onChange={(e) => set("quality")(+e.target.value)} className="w-full" /></label>
                        <p className="text-sm">A grade 10% better would add about <b className="text-green-700">{money(better)}/kg</b> ({money(better * +f.qty)} on this lot). Change the buyer hub above to see freight change.</p>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 rounded flex items-start gap-3"><p className="flex-1 text-lg">{advice?.text ?? "…"}</p><select value={lang} onChange={(e) => setLang(e.target.value)} className="border rounded px-1 py-1 text-sm bg-white"><option value="bn">বাংলা</option><option value="en">English</option><option value="sw">Kiswahili</option></select></div>
                </Card>
            )}
            {r && (
                <Card title="3. Your numbers: accept the trader's price today, or follow FarmMarket?">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Num label="Quantity (kg)" value={f.qty} onChange={set("qty")} />
                        <Num label="My cost per kg" step="0.5" value={f.cost} onChange={set("cost")} />
                        <Num label="Trader's offer today (৳/kg)" step="0.5" value={offer} onChange={setOffer} />
                    </div>
                    {(() => {
                        const q = +f.qty, cost = +f.cost || 0, o = +offer;
                        if (!(o > 0)) return <p className="text-sm text-gray-500 mt-3">Enter the price a trader offered you today. The break-even offer is <b>{money(r.best.net_per_kg)}/kg</b>: below it, the FarmMarket route earns more after freight and spoilage.</p>;
                        const trader = (o - cost) * q, fm = (r.best.net_per_kg - cost) * q, fmLow = (r.best.net_per_kg_low - cost) * q, fmHigh = (r.best.net_per_kg_high - cost) * q;
                        const d = fm - trader;
                        return (
                            <div className="mt-3 grid md:grid-cols-3 gap-3 text-center">
                                <div className="rounded-lg bg-gray-50 p-3"><div className="text-xs text-gray-500">Accept trader</div><div className="text-2xl font-bold">{money(trader)}</div><div className="text-xs">profit on {q} kg</div></div>
                                <div className="rounded-lg bg-green-50 p-3"><div className="text-xs text-gray-500">FarmMarket plan</div><div className="text-2xl font-bold text-green-700">{money(fm)}</div><div className="text-xs">{r.best.wait_days === 0 ? "price known today" : `likely ${money(fmLow)} to ${money(fmHigh)}`}</div></div>
                                <div className={`rounded-lg p-3 ${d >= 0 ? "bg-green-50" : "bg-red-50"}`}><div className="text-xs text-gray-500">Difference</div><div className={`text-2xl font-bold ${d >= 0 ? "text-green-700" : "text-red-600"}`}>{d >= 0 ? "+" : ""}{money(d)}</div><div className="text-xs">{money((d / q) * 100)} per 100 kg</div></div>
                            </div>
                        );
                    })()}
                    <p className="text-xs text-gray-500 mt-2">The trader is assumed to collect at your farm (no freight for you); the FarmMarket plan deducts freight to {f.dest} and spoilage. Profit = (price - your cost) x kg. Wholesale prices are a proxy, so negotiate with the actual quotes you have.</p>
                </Card>
            )}
            {u && (
                <Card title={`4. What the timing rule would have done for ${label(f.crop)} (two-year replay, ${u.n_origins} weekly decisions)`}>
                    {u.wait_advice_enabled ? <p className="text-sm">The rule said <b>wait</b> {u.n_hold_decisions} times out of {u.n_origins}. Average change in realised price over all decisions: <b>{u.mean_uplift_pct >= 0 ? "+" : ""}{u.mean_uplift_pct}%</b> (95% CI {u.ci95_pct[0]}% to {u.ci95_pct[1]}%), about <b>{money(u.mean_difference_bdt_per_100kg)} per 100 kg</b> at an average price of {money(u.mean_price_on_decision_dates)}/kg.</p>
                        : <p className="text-sm">For {label(f.crop)} the replay found <b>no reliable gain from waiting</b> ({u.mean_uplift_pct >= 0 ? "+" : ""}{u.mean_uplift_pct}% on average, 95% CI {u.ci95_pct[0]}% to {u.ci95_pct[1]}%), so the app advises selling today. A perfect-foresight ceiling would have been +{u.oracle_ceiling_pct}%: the gain exists in hindsight, but it cannot be forecast from this data.</p>}
                    {u.gain_pct_quantiles_when_holding && (
                        <div className="mt-3 text-sm"><p className="font-medium">Range of outcomes when the rule said wait ({u.n_hold_decisions} cases, % change versus selling that day):</p>
                            <div className="grid grid-cols-5 gap-2 text-center mt-1">{[["p5", "worst 5%"], ["p25", "25th"], ["p50", "median"], ["p75", "75th"], ["p95", "best 5%"]].map(([k, l]) => <div key={k} className={`rounded p-2 ${u.gain_pct_quantiles_when_holding[k] >= 0 ? "bg-green-50" : "bg-red-50"}`}><div className="text-xs text-gray-500">{l}</div><div className="font-semibold">{u.gain_pct_quantiles_when_holding[k] >= 0 ? "+" : ""}{u.gain_pct_quantiles_when_holding[k]}%</div></div>)}</div>
                        </div>)}
                    {u.examples?.best && (
                        <div className="mt-3 text-sm space-y-1"><p className="font-medium">Real decisions from the replay (taka per 100 kg versus selling that day):</p>
                            {[["Best", u.examples.best], ["Typical", u.examples.median_hold], ["Worst", u.examples.worst]].map(([n, e]) => <p key={n}><b>{n}:</b> on {e.decision_date} the price was {money(e.price_on_decision_date)}/kg; waiting {e.wait_days} day(s) gave {money(e.realised_price_after_spoilage)}/kg after spoilage = <b className={e.difference_bdt_per_100kg >= 0 ? "text-green-700" : "text-red-600"}>{e.difference_bdt_per_100kg >= 0 ? "+" : ""}{money(e.difference_bdt_per_100kg)} per 100 kg</b>.</p>)}
                        </div>)}
                    <p className="text-xs text-gray-500 mt-2">Across all five crops the average is {uplift.average_uplift_pct}% if the rule is applied everywhere and {uplift.average_policy_uplift_pct}% as shipped (wait advice only where the gain is reliable). {uplift.note}</p>
                </Card>
            )}
        </div>
    );
}

function Dispatch() {
    const [depot, setDepot] = useState("Dhaka"), [sel, setSel] = useState({ Chattogram: true, Sylhet: true, Rajshahi: true }), [kg, setKg] = useState("150"), [deadline, setDeadline] = useState("12"), [res, setRes] = useState(null), [meta, setMeta] = useState(null);
    useEffect(() => { run(async () => setMeta(await api("/api/farmmarket/meta"))); }, []);
    const go = () => run(async () => {
        const stops = HUBS.filter((h) => sel[h] && h !== depot).map((h) => ({ name: h, coords: [meta.hubs[h].lat, meta.hubs[h].lon], drop_kg: +kg, deadline_h: +deadline || null }));
        if (!stops.length) throw new Error("Select at least one stop");
        setRes(await post("/api/farmmarket/dispatch", { depot: { name: depot, coords: [meta.hubs[depot].lat, meta.hubs[depot].lon] }, stops }));
    });
    return (
        <Card title="Multi-stop delivery plan (fewer kilometres, less CO2, fresher produce). Login required.">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3"><Select label="Start hub" value={depot} onChange={setDepot} options={HUBS} /><Num label="Drop per stop (kg)" value={kg} onChange={setKg} /><Num label="Freshness deadline (h)" value={deadline} onChange={setDeadline} /></div>
            <div className="flex flex-wrap gap-3 mt-3 text-sm">{HUBS.filter((h) => h !== depot).map((h) => <label key={h}><input type="checkbox" checked={!!sel[h]} onChange={(e) => setSel({ ...sel, [h]: e.target.checked })} /> {h}</label>)}</div>
            <div className="mt-3"><Btn onClick={go} disabled={!meta}>Plan route</Btn></div>
            {res && <div className="mt-3 text-sm"><p>Route: <b>{res.route.map((r) => (r === "depot" ? depot : r)).join(" → ")}</b></p><p>{res.transit_hours} h, {res.co2_kg} kg CO2 (vs {res.naive.transit_hours} h and {res.naive.co2_kg} kg in the order entered): {res.time_saved_pct}% faster, {res.co2_saved_pct}% less CO2.{res.deadline_penalty > 0 ? " Some stops miss the freshness deadline." : ""}</p></div>}
        </Card>
    );
}

function Marketplace() {
    const [lot, setLot] = useState({ crop: "garlic", hub: "Sylhet", quantityKg: "300", askPerKg: "90", grade: "A" }), [dem, setDem] = useState({ crop: "garlic", hub: "Dhaka", quantityKg: "250", bidPerKg: "120", minGrade: "B" });
    const [res, setRes] = useState(null);
    const submit = (path, body, ok) => run(async () => { await post(path, body); toast.success(ok); });
    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <Card title="List produce (farmer / vendor login)">
                    <div className="grid grid-cols-2 gap-3"><Select label="Crop" value={lot.crop} onChange={(v) => setLot({ ...lot, crop: v })} options={CROPS} /><Select label="Hub" value={lot.hub} onChange={(v) => setLot({ ...lot, hub: v })} options={HUBS} /><Num label="Quantity (kg)" value={lot.quantityKg} onChange={(v) => setLot({ ...lot, quantityKg: v })} /><Num label="Ask/kg" step="0.5" value={lot.askPerKg} onChange={(v) => setLot({ ...lot, askPerKg: v })} /><Select label="Grade" value={lot.grade} onChange={(v) => setLot({ ...lot, grade: v })} options={["A", "B", "C"]} /></div>
                    <div className="mt-3"><Btn onClick={() => submit("/api/farmmarket/lots", { ...lot, quantityKg: +lot.quantityKg, askPerKg: +lot.askPerKg }, "Lot listed")}>List lot</Btn></div>
                </Card>
                <Card title="Post a buy order (buyer login)">
                    <div className="grid grid-cols-2 gap-3"><Select label="Crop" value={dem.crop} onChange={(v) => setDem({ ...dem, crop: v })} options={CROPS} /><Select label="Delivery hub" value={dem.hub} onChange={(v) => setDem({ ...dem, hub: v })} options={HUBS} /><Num label="Quantity (kg)" value={dem.quantityKg} onChange={(v) => setDem({ ...dem, quantityKg: v })} /><Num label="Bid/kg" step="0.5" value={dem.bidPerKg} onChange={(v) => setDem({ ...dem, bidPerKg: v })} /><Select label="Min grade" value={dem.minGrade} onChange={(v) => setDem({ ...dem, minGrade: v })} options={["A", "B", "C"]} /></div>
                    <div className="mt-3"><Btn onClick={() => submit("/api/farmmarket/demand", { ...dem, quantityKg: +dem.quantityKg, bidPerKg: +dem.bidPerKg }, "Order posted")}>Post order</Btn></div>
                </Card>
            </div>
            <Card title="Demand matching (optimal assignment, net of freight and spoilage)">
                <Btn onClick={() => run(async () => setRes(await post("/api/farmmarket/match", {})))}>Find best matches</Btn>
                {res && (<div className="mt-3 text-sm">
                    <p className="mb-2">Total surplus created: <b>{money(res.total_surplus)}</b>. Unmatched lots: {res.unmatched_lots.length}, unmet orders: {res.unmatched_orders.length}.</p>
                    {res.matches.length === 0 ? <p className="text-gray-500">No feasible matches yet.</p> : <table className="w-full"><thead><tr className="text-left text-gray-500"><th>Crop</th><th>Qty kg</th><th>Settle/kg</th><th>Distance</th><th>Surplus</th></tr></thead><tbody>{res.matches.map((m) => <tr key={m.lot_id + m.order_id} className="border-t"><td className="capitalize">{m.crop}</td><td>{m.qty}</td><td>{money(m.settle_price_per_kg)}</td><td>{m.km} km</td><td>{money(m.total_surplus)}</td></tr>)}</tbody></table>}
                </div>)}
            </Card>
        </div>
    );
}

function Trace() {
    const [id, setId] = useState(""), [t, setT] = useState(null);
    return (
        <Card title="Digital twin: tamper-evident batch history">
            <div className="flex gap-2"><input value={id} onChange={(e) => setId(e.target.value.trim())} placeholder="B-1a2b3c4d" className="border rounded px-2 py-2 flex-1" /><Btn onClick={() => run(async () => setT(await api(`/api/farmmarket/trace/${id}`)))}>Verify</Btn></div>
            {t && (<div className="mt-3 text-sm">
                <p className={t.verification.valid ? "text-green-700 font-semibold" : "text-red-600 font-semibold"}>{t.verification.valid ? `Chain intact · ${t.verification.events} events · ${t.verification.cold_chain_breaches} cold-chain breach(es) · freshness ${t.verification.freshness_score}/100` : `TAMPERED at event ${t.verification.broken_at}`}</p>
                <ol className="mt-2 space-y-1">{t.events.map((e, i) => <li key={i} className="border-l-2 pl-2"><b>{e.kind}</b> · {new Date(e.ts * 1000).toLocaleString()} · <code className="text-xs text-gray-500">{e.hash.slice(0, 12)}…</code>{e.payload.breach && <span className="text-red-600"> ⚠ breach</span>}</li>)}</ol>
            </div>)}
        </Card>
    );
}


export default function FarmMarketPage() {
    const [tab, setTab] = useState("journey");
    const View = useMemo(() => ({ journey: Journey, market: Prices, marketplace: Marketplace, dispatch: Dispatch, trace: Trace, evidence: Evidence })[tab], [tab]);
    return (
        <div>
            <h2 className="text-3xl font-bold text-green-700">FarmMarket</h2>
            <p className="text-gray-600 mb-4">Upload a photo, get a fair price, and decide whether to sell today or wait, using real Bangladesh market prices.</p>
            <nav className="flex flex-wrap gap-2 mb-5">{TABS.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`px-3 py-1.5 rounded-full border text-sm ${tab === k ? "bg-green-700 text-white border-green-700" : "bg-white hover:bg-green-50"}`}>{l}</button>)}</nav>
            <View />
        </div>
    );
}

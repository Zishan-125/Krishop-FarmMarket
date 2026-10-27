'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '@/Components/Header';
import NewProductCard from '@/Components/NewProductCard';
import Footer from '@/Components/Footer';
import { toast } from 'react-toastify';

const categories = [
    { label: 'Seeds', icon: '🌱', tone: 'bg-[#e4f5e8]' },
    { label: 'Fertilizers', icon: '🪴', tone: 'bg-[#edf3dc]' },
    { label: 'Tools', icon: '🧰', tone: 'bg-[#f5ead7]' },
    { label: 'Pesticides', icon: '🛡️', tone: 'bg-[#e4f0e7]' },
    { label: 'Organic', icon: '🥬', tone: 'bg-[#e2f4ed]' },
];

export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/allProducts')
            .then((response) => setProducts(response.data))
            .catch((error) => {
                console.error('Failed to fetch products:', error);
                toast.error('Unable to load products right now.');
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-[#f4fae9] text-[#10291b]">
            <Header />
            <main>
                <section className="overflow-hidden border-b border-[#d9e8c6] bg-[#eaf6d5]">
                    <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#4d9f45] shadow-sm">🌿 Bangladesh&apos;s farm marketplace</span>
                            <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-[#14532d] sm:text-6xl">Grow better. Trade fairer. <span className="text-[#4d9f45]">Live greener.</span></h1>
                            <p className="mt-6 max-w-xl text-base leading-7 text-[#5c7564] sm:text-lg">Everything farmers and growers need—from trusted inputs to fresh produce traded directly with better prices and better choices.</p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link href="/marketplace" className="rounded-xl bg-[#14532d] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#14532d]/15 hover:bg-[#073b20]">Explore marketplace <span className="ml-2">→</span></Link>
                                <Link href="/register" className="rounded-xl border border-[#a8cfb1] bg-white px-6 py-3.5 text-sm font-bold text-[#14532d] hover:bg-[#f8fffa]">Join KriShop</Link>
                            </div>
                            <div className="mt-10 flex flex-wrap gap-6 text-sm text-[#4f6e59]">
                                <span><strong className="text-xl text-[#14532d]">100%</strong><br />transparent prices</span>
                                <span><strong className="text-xl text-[#14532d]">Direct</strong><br />farmer connections</span>
                                <span><strong className="text-xl text-[#14532d]">BDT</strong><br />local marketplace</span>
                            </div>
                        </div>
                        <div className="relative min-h-[320px] lg:min-h-[410px]">
                            <div className="absolute inset-8 rounded-[2.5rem] bg-[#b9dfc1] rotate-3" />
                            <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#4d9f45] via-[#18683d] to-[#14532d] p-8 shadow-2xl shadow-[#174a36]/20">
                                <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full border-[25px] border-white/10" />
                                <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full border-[35px] border-[#d9ed67]/15" />
                                <p className="relative text-sm font-semibold text-[#c7edcf]">Today&apos;s spotlight</p>
                                <h2 className="relative mt-4 max-w-xs text-4xl font-bold leading-tight text-white">Fresh from the field.</h2>
                                <div className="absolute bottom-8 left-8 right-8 rounded-2xl bg-white/10 p-4 backdrop-blur">
                                    <div className="flex items-center justify-between text-sm text-white"><span>Fair-price marketplace</span><span className="rounded-full bg-[#d9ed67] px-2 py-1 text-xs font-bold text-[#14532d]">LIVE</span></div>
                                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full w-4/5 rounded-full bg-[#b7eec2]" /></div>
                                    <p className="mt-2 text-xs text-[#d9f3de]">Connecting local harvests with real demand</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
                    <div className="flex items-end justify-between gap-4">
                        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4d9f45]">Shop by category</p><h2 className="mt-2 text-2xl font-bold text-[#14532d]">Tools for every growing season</h2></div>
                        <Link href="/marketplace" className="hidden text-sm font-bold text-[#4d9f45] hover:underline sm:block">View all products →</Link>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        {categories.map((category) => <Link href="/marketplace" key={category.label} className={`group rounded-2xl ${category.tone} p-5 transition hover:-translate-y-1 hover:shadow-md`}><span className="text-3xl">{category.icon}</span><p className="mt-4 text-sm font-bold text-[#174a36]">{category.label}</p><p className="mt-1 text-xs text-[#6b806f]">Shop now →</p></Link>)}
                    </div>
                </section>

                <section className="bg-white px-5 py-12 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4d9f45]">Curated for you</p><h2 className="mt-2 text-2xl font-bold text-[#14532d]">Popular farm essentials</h2><p className="mt-1 text-sm text-[#718078]">Quality products from trusted KriShop sellers.</p></div><Link href="/marketplace" className="text-sm font-bold text-[#4d9f45] hover:underline">Browse catalog →</Link></div>
                        {loading ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((id) => <div key={id} className="h-80 animate-pulse rounded-2xl bg-[#e8f2e9]" />)}</div> : products.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-[#bfdcc7] p-12 text-center text-[#718078]">Products will appear here soon.</div> : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 8).map((product) => <NewProductCard key={product._id} product={product} />)}</div>}
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8" id="how-it-works">
                    <div className="rounded-3xl bg-[#14532d] p-8 text-white sm:p-12"><div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d9ed67]">Why KriShop</p><h2 className="mt-3 text-3xl font-bold">A better way to grow together.</h2></div><div className="mt-10 grid gap-8 sm:grid-cols-3"><div><span className="text-2xl">01</span><h3 className="mt-3 font-bold">Discover</h3><p className="mt-2 text-sm leading-6 text-[#c7e5cd]">Find farm inputs and fresh produce in one trusted marketplace.</p></div><div><span className="text-2xl">02</span><h3 className="mt-3 font-bold">Connect</h3><p className="mt-2 text-sm leading-6 text-[#c7e5cd]">Meet farmers and buyers directly with clear, fair asking prices.</p></div><div><span className="text-2xl">03</span><h3 className="mt-3 font-bold">Prosper</h3><p className="mt-2 text-sm leading-6 text-[#c7e5cd]">Build sustainable relationships that create more value for everyone.</p></div></div></div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

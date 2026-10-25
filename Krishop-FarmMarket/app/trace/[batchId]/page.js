import Link from 'next/link';

export default async function TraceBatchPage({ params }) {
    const { batchId } = await params;
    return <main className="min-h-screen bg-[#f3faf4] px-5 py-12"><div className="mx-auto max-w-3xl"><Link href="/" className="font-bold text-[#0d542f]">KriShop</Link><div className="mt-10 rounded-2xl border border-[#d6e8d9] bg-white p-8 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2f8a52]">Digital traceability</p><h1 className="mt-2 text-3xl font-bold text-[#0d542f]">Batch {batchId}</h1><p className="mt-3 text-[#5c7564]">This public page is ready to display a farm-to-table timeline when the batch has been registered.</p><div className="mt-8 rounded-xl bg-[#e1f4e6] p-5 text-sm text-[#285b3a]">Ledger verification is available through the batch verification API. No sensor records are fabricated when a batch has no recorded events.</div></div></div></main>;
}

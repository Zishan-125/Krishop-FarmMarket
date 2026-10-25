import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-[#082f1d] px-5 py-12 text-[#c7e5cd] lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
                <div><p className="text-2xl font-bold text-white">Kri<span className="text-[#8bd69e]">Shop</span></p><p className="mt-4 max-w-xs text-sm leading-6 text-[#9fc6a9]">Fairer connections for a healthier agricultural economy.</p></div>
                <div><h3 className="font-bold text-white">Marketplace</h3><div className="mt-4 space-y-3 text-sm"><Link href="/marketplace" className="block hover:text-white">Shop products</Link><Link href="/marketplace" className="block hover:text-white">Fresh produce</Link><Link href="/demands" className="block hover:text-white">Demand board</Link></div></div>
                <div><h3 className="font-bold text-white">For your farm</h3><div className="mt-4 space-y-3 text-sm"><Link href="/listings/new" className="block hover:text-white">List produce</Link><Link href="/register" className="block hover:text-white">Create account</Link><Link href="/login" className="block hover:text-white">Sign in</Link></div></div>
                <div><h3 className="font-bold text-white">Need help?</h3><div className="mt-4 space-y-3 text-sm"><p>01885222985</p><a href="mailto:support@krishop.com.bd" className="block hover:text-white">support@krishop.com.bd</a><p>Bangladesh</p></div></div>
            </div>
            <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-5 text-xs text-[#87ad92]">© {new Date().getFullYear()} KriShop. Built for farmers, buyers, and better trade.</div>
        </footer>
    );
}

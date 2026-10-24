'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import logo from '../public/logo.png';
import { useCart } from '@/context/CartContext';

export default function Header() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { viewCart, cart, clearCart } = useCart();

    const handleLogout = () => {
        clearCart();
        signOut({ callbackUrl: '/' });
    };

    return (
        <header className="sticky top-0 z-40 border-b border-[#dfe9e1] bg-[#f7f8f3]/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center gap-5 px-5 py-3 lg:px-8">
                <Link href="/" className="flex shrink-0 items-center gap-2.5">
                    <Image src={logo} alt="KriShop logo" width={42} height={42} className="h-10 w-10 object-contain" />
                    <span className="text-xl font-bold tracking-tight text-[#0d542f]">Kri<span className="text-[#2f8a52]">Shop</span></span>
                </Link>

                <nav className="hidden items-center gap-7 text-sm font-medium text-[#526158] lg:flex">
                    <Link href="/marketplace" className="hover:text-[#174a36]">Marketplace</Link>
                    <Link href="/#how-it-works" className="hover:text-[#174a36]">How it works</Link>
                    <Link href="/#about" className="hover:text-[#174a36]">About us</Link>
                </nav>

                <div className="ml-auto flex items-center gap-3">
                    {session ? (
                        <>
                            <Link href={`/dashboard/${session.user.role}`} className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#526158] hover:bg-[#e8f3eb] hover:text-[#174a36] sm:block">Dashboard</Link>
                            <button onClick={handleLogout} className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#526158] hover:bg-[#f3e9df] sm:block">Sign out</button>
                        </>
                    ) : (
                        <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#526158] hover:bg-[#e8f3eb] sm:block">Sign in</Link>
                    )}
                    <button onClick={viewCart} className="relative rounded-lg border border-[#d5e2d7] bg-white p-2.5 text-[#174a36] hover:border-[#8eb79a]" aria-label="Open cart">
                        <span aria-hidden="true">🛒</span>
                        {cart.length > 0 && <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c66a3d] px-1 text-[10px] font-bold text-white">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>}
                    </button>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-lg border border-[#d5e2d7] p-2.5 text-[#174a36] lg:hidden" aria-label="Toggle menu">
                        <span className="text-lg">{isMenuOpen ? '×' : '☰'}</span>
                    </button>
                </div>
            </div>
            {isMenuOpen && (
                <nav className="border-t border-[#dfe9e1] bg-white px-5 py-4 lg:hidden">
                    <div className="flex flex-col gap-3 text-sm font-semibold text-[#526158]">
                        <Link href="/marketplace" onClick={() => setIsMenuOpen(false)}>Marketplace</Link>
                        <Link href="/#how-it-works" onClick={() => setIsMenuOpen(false)}>How it works</Link>
                        {session ? <><Link href={`/dashboard/${session.user.role}`} onClick={() => setIsMenuOpen(false)}>Dashboard</Link><button className="text-left" onClick={handleLogout}>Sign out</button></> : <Link href="/login" onClick={() => setIsMenuOpen(false)}>Sign in</Link>}
                    </div>
                </nav>
            )}
        </header>
    );
}

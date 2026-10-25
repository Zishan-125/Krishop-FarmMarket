'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/logo.png';
import DashNav from '@/Components/DashNav';

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-[#f4fae9]">
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#14532d] lg:flex">
                <Link href="/" className="flex items-center gap-2.5 border-b border-white/10 px-6 py-5">
                    <Image src={logo} alt="KriShop logo" height={38} width={38} className="h-9 w-9 object-contain" />
                    <span className="text-xl font-bold text-white">Kri<span className="text-[#8ee0a7]">Shop</span></span>
                </Link>
                <div className="px-6 py-6">
                    <p className="text-xs text-[#a9c6b0]">Your workspace</p>
                    <h2 className="mt-1 text-lg font-semibold text-white">Dashboard</h2>
                </div>
                <DashNav />
                <Link href="/" className="m-4 rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-[#c7d8ca] hover:bg-white/10">← Back to site</Link>
            </aside>
            <main className="dashboard-scrollbar min-w-0 flex-1 overflow-y-auto lg:ml-64">
                <div className="border-b border-[#e0e9e1] bg-white px-5 py-4 lg:hidden">
                    <Link href="/" className="font-bold text-[#14532d]">KriShop</Link>
                </div>
                <div className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-12">{children}</div>
            </main>
        </div>
    );
};

export default DashboardLayout;

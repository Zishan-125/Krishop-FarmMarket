'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/logo.png';
import DashNav from '@/Components/DashNav';

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            {/* Sidebar Container (Handles its own mobile hamburger & desktop fixed state) */}
            <aside className="shrink-0">
                <div className="hidden md:flex flex-col w-64 fixed h-screen bg-amber-100 text-black border-r border-amber-200 z-30">
                    <div className="p-4 flex flex-col gap-2">
                        <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
                            <Image src={logo} alt="KriShop Logo" height={48} width={48} className="w-12 h-12 object-contain" />
                            <h1 className="text-3xl ml-2 text-green-700 font-bold">Kri<span className="text-black">Shop</span></h1>
                        </div>
                        <Link href='/dashboard/user' className="text-xl font-semibold text-gray-800 hover:text-black">Dashboard</Link>
                    </div>
                    {/* DashNav contains the links and handles navigation */}
                    <div className="flex-1 overflow-y-auto">
                        <DashNav />
                    </div>
                </div>

                {/* Mobile version of the Sidebar / Header component */}
                <div className="md:hidden">
                    <DashNav />
                </div>
            </aside>

            {/* Main Content Area (Responsive margin: 0 on mobile, ml-64 on desktop) */}
            <main className="flex-1 md:ml-64 p-6 md:p-10 overflow-y-auto min-h-screen bg-gray-50">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
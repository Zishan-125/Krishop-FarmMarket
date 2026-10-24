'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/logo.png';
import DashNav from '@/Components/DashNav';

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex h-screen">
            <div className="w-64 fixed h-screen bg-amber-100 text-black">
                <div className="p-4 flex flex-col gap-4">
                    <div className="flex items-center" onClick={() => window.location.href = '/'}>
                        <Image src={logo} alt="KriShop Logo" height={48} width={48} className="w-12 h-12 object-contain" />
                        <h1 className="text-3xl md:text-5xl ml-2 text-green-700">Kri<span className="text-black">Shop</span></h1>
                    </div>
                    <Link href='/' className="text-2xl font-bold">Dashboard</Link>
                </div>
                <DashNav />
            </div>
            <div className="ml-64 flex-1 p-10 overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

export default DashboardLayout;

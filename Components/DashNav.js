"use client";
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useState } from 'react';

const DashNav = () => {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    const isAdmin = 
        session?.user?.role === "admin" || 
        session?.user?.email === "zafarahmed01071969@gmail.com";

    const userImage = session?.user?.image;

    const navContent = (
        <div className="flex flex-col space-y-6">
            {/* Profile Section with Real Avatar */}
            <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center border border-gray-500 shrink-0">
                    {userImage ? (
                        <img 
                            src={userImage} 
                            alt="Avatar" 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <span className="text-white font-bold text-sm uppercase">
                            {session?.user?.name?.charAt(0) || 'A'}
                        </span>
                    )}
                </div>
                <span className="text-white font-medium truncate max-w-[140px]">{session?.user?.name}</span>
            </div>

            {/* Admin Navigation */}
            {isAdmin && (
                <ul className="space-y-2">
                    <li>
                        <Link href="/dashboard/admin/profile" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white flex items-center p-2 rounded hover:bg-gray-700">
                            Profile
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/admin/products" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white flex items-center p-2 rounded hover:bg-gray-700">
                            Products
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/admin/orders" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white flex items-center p-2 rounded hover:bg-gray-700">
                            Orders
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/admin/products/new" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white flex items-center p-2 rounded hover:bg-gray-700">
                            Post Product
                        </Link>
                    </li>
                    <li>
                        <Link href="/farmmarket" onClick={() => setIsOpen(false)} className="text-emerald-400 hover:text-emerald-300 flex items-center p-2 rounded hover:bg-gray-700 font-medium">
                            🌾 FarmMarket & AI Hub
                        </Link>
                    </li>
                    <li className="pt-4 mt-4 border-t border-gray-700">
                        <Link 
                            href="/" 
                            onClick={() => setIsOpen(false)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-center flex items-center justify-center p-2.5 rounded-xl font-medium transition shadow-sm text-sm"
                        >
                            🌐 View Storefront
                        </Link>
                    </li>
                </ul>
            )}

            {/* User Navigation */}
            {(!isAdmin && session?.user?.role !== "vendor") && (
                <ul className="space-y-2">
                    <li>
                        <Link href="/dashboard/user/profile" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white flex items-center p-2 rounded hover:bg-gray-700">
                            Profile
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/user/orders" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white flex items-center p-2 rounded hover:bg-gray-700">
                            Orders
                        </Link>
                    </li>
                    <li>
                        <Link href="/farmmarket" onClick={() => setIsOpen(false)} className="text-emerald-400 hover:text-emerald-300 flex items-center p-2 rounded hover:bg-gray-700 font-medium">
                            🌾 FarmMarket & AI Hub
                        </Link>
                    </li>
                    <li className="pt-4 mt-4 border-t border-gray-700">
                        <Link 
                            href="/" 
                            onClick={() => setIsOpen(false)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-center flex items-center justify-center p-2.5 rounded-xl font-medium transition shadow-sm text-sm"
                        >
                            🌐 View Storefront
                        </Link>
                    </li>
                </ul>
            )}
        </div>
    );

    return (
        <>
            {/* Mobile Header Bar with Hamburger */}
            <div className="md:hidden bg-gray-800 text-white flex items-center justify-between p-4 shadow-md sticky top-0 z-40">
                <span className="font-bold text-lg">KriShop Dashboard</span>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 focus:outline-none"
                    aria-label="Toggle Menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Backdrop for Mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <nav className={`
                bg-gray-800 w-64 min-h-screen p-4 shrink-0 flex flex-col justify-between
                fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {navContent}
            </nav>
        </>
    );
};

export default DashNav;
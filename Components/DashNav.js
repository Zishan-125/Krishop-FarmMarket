"use client"
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';

const DashNav = () => {
    const { data: session } = useSession();

    const isAdmin = 
        session?.user?.role === "admin" || 
        session?.user?.email === "zafarahmed01071969@gmail.com";

    const userImage = session?.user?.image;

    return (
        <nav className="bg-gray-800 w-64 min-h-screen p-4 shrink-0 flex flex-col justify-between">
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
                            <Link href="/dashboard/admin/profile" className="text-gray-300 hover:text-white flex items-center p-2 rounded hover:bg-gray-700">
                                Profile
                            </Link>
                        </li>
                        <li>
                            <Link href="/dashboard/admin/products" className="text-gray-300 hover:text-white flex items-center p-2 rounded hover:bg-gray-700">
                                Products
                            </Link>
                        </li>
                        <li>
                            <Link href="/dashboard/admin/orders" className="text-gray-300 hover:text-white flex items-center p-2 rounded hover:bg-gray-700">
                                Orders
                            </Link>
                        </li>
                        <li>
                            <Link href="/dashboard/admin/products/new" className="text-gray-300 hover:text-white flex items-center p-2 rounded hover:bg-gray-700">
                                Post Product
                            </Link>
                        </li>
                        <li>
                            <Link href="/farmmarket" className="text-emerald-400 hover:text-emerald-300 flex items-center p-2 rounded hover:bg-gray-700 font-medium">
                                🌾 FarmMarket & AI Hub
                            </Link>
                        </li>
                        <li className="pt-4 mt-4 border-t border-gray-700">
                            <Link 
                                href="/" 
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
                            <Link href="/dashboard/user/profile" className="text-gray-300 hover:text-white flex items-center p-2 rounded hover:bg-gray-700">
                                Profile
                            </Link>
                        </li>
                        <li>
                            <Link href="/dashboard/user/orders" className="text-gray-300 hover:text-white flex items-center p-2 rounded hover:bg-gray-700">
                                Orders
                            </Link>
                        </li>
                        <li>
                            <Link href="/farmmarket" className="text-emerald-400 hover:text-emerald-300 flex items-center p-2 rounded hover:bg-gray-700 font-medium">
                                🌾 FarmMarket & AI Hub
                            </Link>
                        </li>
                        <li className="pt-4 mt-4 border-t border-gray-700">
                            <Link 
                                href="/" 
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-center flex items-center justify-center p-2.5 rounded-xl font-medium transition shadow-sm text-sm"
                            >
                                🌐 View Storefront
                            </Link>
                        </li>
                    </ul>
                )}
            </div>
        </nav>
    );
};

export default DashNav;
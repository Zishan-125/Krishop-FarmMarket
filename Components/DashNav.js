"use client"
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';

const DashNav = () => {
    const { data: session } = useSession();

    return (
        <nav className="bg-gray-800 w-64 min-h-screen p-4  ">
            <div className="flex flex-col space-y-6">
                {/* Profile Section - Common for all */}
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gray-600"></div>
                    <span className="text-white">{session?.user?.name}</span>
                </div>

                {/* Admin Navigation */}
                {session?.user?.role === "admin" && (
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
                    </ul>
                )}

                {/* Vendor Navigation */}
                {session?.user?.role === "vendor" && (
                    <ul className="space-y-2">
                        <li>
                            <Link href="/dashboard/vendor/profile" className="text-gray-300 hover:text-white flex items-center p-2 rounded hover:bg-gray-700">
                                Profile
                            </Link>
                        </li>
                        <li>
                            <Link href="/dashboard/vendor/orders" className="text-gray-300 hover:text-white flex items-center p-2 rounded hover:bg-gray-700">
                                Orders
                            </Link>
                        </li>
                        <li>
                            <Link href="/dashboard/vendor/products/new" className="text-gray-300 hover:text-white flex items-center p-2 rounded hover:bg-gray-700">
                                Post Product
                            </Link>
                        </li>
                    </ul>
                )}

                {/* User Navigation */}
                {session?.user?.role === "user" && (
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
                    </ul>
                )}
            </div>
        </nav>
    );
};

export default DashNav;

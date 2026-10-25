"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const links = {
    farmer: [
        ["Overview", "/dashboard/farmer"],
        ["Marketplace", "/marketplace"],
        ["List produce", "/listings/new"],
        ["Profile", "/dashboard/farmer/profile"],
    ],
    buyer: [
        ["Overview", "/dashboard/buyer"],
        ["Marketplace", "/marketplace"],
        ["Demand board", "/demands"],
        ["Orders", "/dashboard/buyer/orders"],
        ["Profile", "/dashboard/buyer/profile"],
    ],
};

export default function DashNav() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const roleLinks = links[session?.user?.role] || [];

    return (
        <nav className="flex-1 px-4 py-5">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#83a18b]">Workspace</p>
            <div className="space-y-1">
                {roleLinks.map(([label, href]) => (
                    <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${pathname === href ? "bg-[#4d9f45] text-white shadow-sm" : "text-[#c7d8ca] hover:bg-[#1c7041] hover:text-white"}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {label}
                    </Link>
                ))}
            </div>
        </nav>
    );
}

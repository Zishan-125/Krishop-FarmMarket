'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function VendorProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Vendor Profile State
    const [profile, setProfile] = useState({
        storeName: 'Bengal Agro Farm',
        farmerName: 'vendor1',
        location: 'Feni Sadar, Feni',
        phone: '+880 1800-000000',
        logoUrl: '',
    });

    // Profile Edit Modal State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ ...profile });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch('/api/products');
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (err) {
                console.error('Failed to fetch products', err);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    // Handle Profile Logo Upload
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    // Save Profile Changes
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSavingProfile(true);

        try {
            // Apply updated values locally
            setProfile({
                ...profileForm,
                logoUrl: logoPreview || profile.logoUrl,
            });
            setIsEditingProfile(false);
        } catch (err) {
            console.error('Failed to update profile', err);
        } finally {
            setSavingProfile(false);
        }
    };

    // Compute live vendor store metrics
    const totalStock = products.reduce((acc, item) => acc + Number(item.stock || item.quantity || 0), 0);
    const totalInventoryValue = products.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.stock || item.quantity || 0)), 0);

    return (
        <div className="mx-auto max-w-6xl p-6 space-y-8">
            
            {/* Vendor Profile & Store Summary Header Card */}
            <div className="rounded-3xl bg-gradient-to-r from-[#14532d] to-[#166534] p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="flex items-center gap-5 z-10">
                    <div className="relative w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-3xl font-bold backdrop-blur-md shadow-inner flex-shrink-0 overflow-hidden">
                        {profile.logoUrl ? (
                            <img src={profile.logoUrl} alt="Store Logo" className="w-full h-full object-cover" />
                        ) : (
                            '🌾'
                        )}
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{profile.storeName}</h1>
                            <span className="text-[11px] bg-emerald-300 text-stone-900 font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                                Verified Farmer
                            </span>
                        </div>
                        <p className="text-emerald-100 text-sm mt-1 flex items-center gap-3 flex-wrap">
                            <span>👤 Owner: <strong>{profile.farmerName}</strong></span>
                            <span>📍 Location: <strong>{profile.location}</strong></span>
                        </p>
                    </div>
                </div>

                {/* Right Action Bar: Edit Profile & Metrics */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 z-10 w-full md:w-auto">
                    {/* Quick Metrics Bar */}
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 justify-around">
                        <div className="text-center px-2">
                            <p className="text-[11px] text-emerald-200 uppercase tracking-wider font-bold">Listings</p>
                            <p className="text-xl font-extrabold">{products.length}</p>
                        </div>
                        <div className="h-8 w-px bg-white/20" />
                        <div className="text-center px-2">
                            <p className="text-[11px] text-emerald-200 uppercase tracking-wider font-bold">Stock</p>
                            <p className="text-xl font-extrabold">{totalStock}</p>
                        </div>
                        <div className="h-8 w-px bg-white/20" />
                        <div className="text-center px-2">
                            <p className="text-[11px] text-emerald-200 uppercase tracking-wider font-bold">Value</p>
                            <p className="text-xl font-extrabold">৳{totalInventoryValue}</p>
                        </div>
                    </div>

                    {/* Edit Profile Button */}
                    <button
                        onClick={() => {
                            setProfileForm({ ...profile });
                            setLogoPreview(profile.logoUrl);
                            setIsEditingProfile(true);
                        }}
                        className="rounded-2xl bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition backdrop-blur-sm whitespace-nowrap text-center"
                    >
                        ⚙️ Edit Profile
                    </button>
                </div>
            </div>

            {/* Section Controls & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <p className="font-semibold uppercase tracking-widest text-[#14532d] text-xs">Inventory Management</p>
                    <h2 className="text-2xl font-bold text-stone-900">Your Active Harvest Catalog</h2>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/dashboard/products/new"
                        className="rounded-xl bg-[#14532d] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0f4725] transition shadow-sm flex items-center gap-2"
                    >
                        + Add New Product
                    </Link>
                    <Link
                        href="/marketplace"
                        className="rounded-xl bg-stone-100 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-200 transition"
                    >
                        View Marketplace
                    </Link>
                </div>
            </div>

            {/* Product Catalog Grid */}
            {loading ? (
                <div className="rounded-2xl bg-white p-12 text-center text-stone-500 shadow-sm border border-stone-100 animate-pulse">
                    Loading your inventory catalog...
                </div>
            ) : products.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-stone-300 bg-white p-16 text-center shadow-sm">
                    <div className="w-16 h-16 bg-green-50 text-[#14532d] rounded-2xl flex items-center justify-center mx-auto text-2xl mb-4">🌱</div>
                    <h3 className="text-xl font-bold text-stone-900">No products found in your inventory</h3>
                    <p className="mt-1 text-sm text-stone-500 max-w-md mx-auto">Start listing your organic crops, vegetables, or farm supplies to reach buyers across Bangladesh.</p>
                    <Link
                        href="/dashboard/products/new"
                        className="mt-6 inline-block rounded-xl bg-[#14532d] px-6 py-3 text-sm font-bold text-white hover:bg-[#0f4725] transition shadow-sm"
                    >
                        Create First Product Listing
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((item) => (
                        <div key={item._id} className="rounded-2xl bg-white border border-[#e0e9e1] overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                            <div>
                                {/* Product Image Banner */}
                                <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs font-medium">
                                            No Image Attached
                                        </div>
                                    )}
                                    <span className="absolute top-3 left-3 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-bold text-[#14532d] shadow-sm uppercase tracking-wider">
                                        {item.category || 'Product'}
                                    </span>
                                    {item.storeName && (
                                        <span className="absolute bottom-3 left-3 rounded-lg bg-stone-900/80 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                                            🏪 {item.storeName}
                                        </span>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-stone-900 line-clamp-1">{item.title || item.name}</h3>
                                    <p className="mt-1.5 text-xs text-stone-500 line-clamp-2 leading-relaxed">{item.description || 'No description provided.'}</p>
                                    
                                    {item.location && (
                                        <p className="mt-3 text-xs font-medium text-stone-600 flex items-center gap-1">
                                            📍 Location: {item.location}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Footer Price & Stock */}
                            <div className="p-5 pt-0 mt-2">
                                <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                                    <div>
                                        <span className="text-xl font-extrabold text-[#14532d]">৳{item.price}</span>
                                        <span className="text-xs text-stone-400 font-medium ml-1">/ {item.unit || 'unit'}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-block rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#14532d]">
                                            Stock: {item.stock || item.quantity || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* EDIT PROFILE MODAL */}
            {isEditingProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-stone-900">Update Vendor Profile</h2>
                                <p className="text-xs text-stone-500">Edit your public farm brand and store branding details.</p>
                            </div>
                            <button
                                onClick={() => setIsEditingProfile(false)}
                                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            {/* Logo Upload Box */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">Store / Farm Logo</label>
                                <div className="flex items-center gap-4 p-3 rounded-2xl border border-stone-200 bg-stone-50">
                                    <div className="w-16 h-16 rounded-xl bg-stone-200 border border-stone-300 flex items-center justify-center overflow-hidden flex-shrink-0 text-xl">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            '🌾'
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#14532d] file:text-white cursor-pointer"
                                        />
                                        <p className="text-[10px] text-stone-400 mt-1">Upload JPEG/PNG emblem from your device.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Store / Farm Name</label>
                                <input
                                    type="text"
                                    required
                                    value={profileForm.storeName}
                                    onChange={(e) => setProfileForm({ ...profileForm, storeName: e.target.value })}
                                    className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-[#14532d]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Farmer / Owner Name</label>
                                <input
                                    type="text"
                                    required
                                    value={profileForm.farmerName}
                                    onChange={(e) => setProfileForm({ ...profileForm, farmerName: e.target.value })}
                                    className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-[#14532d]"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Farm Location</label>
                                    <input
                                        type="text"
                                        value={profileForm.location}
                                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                                        className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-[#14532d]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Contact Phone</label>
                                    <input
                                        type="text"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-[#14532d]"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingProfile(false)}
                                    className="px-5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="px-6 py-2.5 rounded-xl bg-[#14532d] text-xs font-bold text-white hover:bg-[#0f4725] transition"
                                >
                                    {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
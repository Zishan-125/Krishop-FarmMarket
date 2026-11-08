'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProductPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        category: 'vegetables',
        price: '',
        stock: '',
        unit: 'kg',
       
        storeName: '',
        description: '',
    });
    
    // For local product image file preview and attachment
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // For local brand logo file preview and attachment
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            // Using FormData to handle text fields, product image, and brand logo files from device
            const dataPayload = new FormData();
            Object.keys(formData).forEach((key) => {
                dataPayload.append(key, formData[key]);
            });
            if (imageFile) {
                dataPayload.append('image', imageFile);
            }
            if (logoFile) {
                dataPayload.append('brandLogo', logoFile);
            }

            const res = await fetch('/api/products', {
                method: 'POST',
                body: dataPayload, // Note: Do not manually set 'Content-Type' header when using FormData
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to list product');
            }

            router.push('/dashboard/products');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f8fbeF] py-10 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
                {/* Navigation Breadcrumb */}
                <div className="mb-6 flex items-center justify-between">
                    <Link 
                        href="/dashboard/products" 
                        className="text-sm font-semibold text-[#14532d] hover:underline flex items-center gap-1"
                    >
                        ← Back to Inventory
                    </Link>
                    <span className="text-xs font-semibold bg-emerald-100 text-[#14532d] px-3 py-1 rounded-full uppercase tracking-wider">
                        
                    </span>
                </div>

                <div className="bg-white rounded-3xl border border-[#e0e9e1] p-6 sm:p-10 shadow-sm">
                    <div className="mb-8 border-b border-stone-100 pb-5">
                        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Create Branded Product Listing</h1>
                        <p className="text-sm text-stone-500 mt-1">Establish your store brand identity, upload your logo, and add harvest photos directly from your device.</p>
                    </div>
                    
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* SECTION 1: Brand & Store Identity with Logo Upload */}
                        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-5">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-[#14532d]">1. Store & Brand Identity</h2>
                            
                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1">Store / Brand Name (e.g., Bengal Agro Farm)</label>
                                <input 
                                    type="text"
                                    required
                                    value={formData.storeName}
                                    onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                                    placeholder="Enter your official store or farm brand name"
                                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d]"
                                />
                                <p className="text-xs text-stone-500 mt-1">Your store name will be highlighted on your product card.</p>
                            </div>

                            {/* Brand Logo Upload Subsection */}
                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-2">Store Brand Logo (Device Upload)</label>
                                <div className="flex items-center gap-4 p-4 rounded-xl border border-stone-300 bg-white">
                                    {logoPreview ? (
                                        <div className="relative w-16 h-16 rounded-full overflow-hidden border border-stone-300 shadow-sm flex-shrink-0 bg-stone-100">
                                            <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 text-[10px] text-center p-1 flex-shrink-0">
                                            No Logo
                                        </div>
                                    )}
                                    <div className="flex-1 w-full">
                                        <input 
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-800 file:text-white hover:file:bg-stone-700 cursor-pointer"
                                        />
                                        <p className="text-[11px] text-stone-400 mt-1">Upload a square emblem or farm logo (PNG/JPG).</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: Product Core Details */}
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-[#14532d]">2. Product Information</h2>
                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1">Product Title</label>
                                <input 
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    placeholder="e.g. Premium Organic Country Tomatoes (সতেজ দেশি টমেটো)"
                                    className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-[#14532d]"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-1">Category</label>
                                    <select 
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-[#14532d] bg-white"
                                    >
                                        <option value="vegetables">Vegetables (সবজি)</option>
                                        <option value="fruits">Fruits (ফলমূল)</option>
                                        <option value="grains">Grains & Crops (শস্য ও চাল)</option>
                                        <option value="fertilizers">Fertilizers & Seeds (সার ও বীজ)</option>
                                        <option value="others">Others (অন্যান্য)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-1">Price per Unit (৳)</label>
                                    <input 
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        placeholder="0.00"
                                        className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-[#14532d]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-1">Stock Quantity</label>
                                    <input 
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                        placeholder="e.g. 100"
                                        className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-[#14532d]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-1">Unit Type</label>
                                    <select 
                                        value={formData.unit}
                                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                        className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-[#14532d] bg-white"
                                    >
                                        <option value="kg">Kilogram (কেজি)</option>
                                        <option value="maund">Maund (মণ)</option>
                                        <option value="pcs">Pieces (পিস)</option>
                                        <option value="sack">Sack / Bag (বস্তা)</option>
                                        <option value="bundle">Bundle (আঁটি)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: Device Image Upload */}
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-[#14532d]">3. Product Media (Device Upload)</h2>
                            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50">
                                {imagePreview ? (
                                    <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-stone-300 shadow-sm flex-shrink-0">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-28 h-28 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400 text-xs text-center p-2 flex-shrink-0">
                                        No Image Selected
                                    </div>
                                )}
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-semibold text-stone-700 mb-1">Upload Product Photo from Device</label>
                                    <input 
                                        type="file"
                                        accept="image/*"
                                        required
                                        onChange={handleImageChange}
                                        className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#14532d] file:text-white hover:file:bg-[#0f4725] cursor-pointer"
                                    />
                                    <p className="text-xs text-stone-400 mt-2">Upload high-resolution JPEG, PNG, or WebP images to build trust with customers.</p>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 4: Location & Description */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1">Harvest Location / Upazila</label>
                                <input 
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    placeholder="e.g. Feni Sadar"
                                    className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-[#14532d]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1">Product Description & Quality Standards</label>
                                <textarea 
                                    rows="4"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Describe freshness, organic certifications, packaging, and shelf life..."
                                    className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-[#14532d]"
                                />
                            </div>
                        </div>

                        {/* Submit Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-stone-100">
                            <button 
                                type="button"
                                onClick={() => router.push('/dashboard/products')}
                                className="px-6 py-3 rounded-xl border border-stone-300 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={submitting}
                                className="px-8 py-3 rounded-xl bg-[#14532d] text-sm font-bold text-white hover:bg-[#0f4725] disabled:opacity-50 transition shadow-md"
                            >
                                {submitting ? 'Publishing Brand Listing...' : 'Publish Branded Listing'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewListingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        quantity: '',
        unit: 'kg',
        price: '',
        location: '',
        quality: 'Standard',
        description: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/listings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to create listing');
            }

            // Redirect back to dashboard or marketplace on success
            router.push('/dashboard/farmer');
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl p-6">
            <div className="mb-6">
                <p className="font-semibold uppercase tracking-widest text-[#14532d]">Farmer Portal</p>
                <h1 className="text-2xl font-bold text-stone-900">Publish New Produce Listing</h1>
                <p className="text-sm text-stone-600">Share your available crops and asking price with buyers.</p>
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
                <div>
                    <label className="block text-sm font-medium text-stone-700">Crop / Product Title</label>
                    <input
                        type="text"
                        name="title"
                        required
                        placeholder="e.g., Fresh Organic Potatoes"
                        value={formData.title}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 focus:border-[#14532d] focus:outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-stone-700">Category</label>
                        <input
                            type="text"
                            name="category"
                            required
                            placeholder="e.g., Vegetables, Grains"
                            value={formData.category}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 focus:border-[#14532d] focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700">Quality / Grade</label>
                        <select
                            name="quality"
                            value={formData.quality}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 focus:border-[#14532d] focus:outline-none"
                        >
                            <option value="Premium">Premium</option>
                            <option value="Standard">Standard</option>
                            <option value="Organic">Organic</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <label className="block text-sm font-medium text-stone-700">Quantity</label>
                        <input
                            type="number"
                            name="quantity"
                            required
                            min="1"
                            placeholder="e.g., 500"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 focus:border-[#14532d] focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700">Unit</label>
                        <select
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 focus:border-[#14532d] focus:outline-none"
                        >
                            <option value="kg">kg</option>
                            <option value="tons">tons</option>
                            <option value="maund">maund</option>
                            <option value="pieces">pieces</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700">Asking Price (per unit)</label>
                        <input
                            type="number"
                            name="price"
                            required
                            min="0"
                            placeholder="e.g., 45"
                            value={formData.price}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 focus:border-[#14532d] focus:outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700">Location / District</label>
                    <input
                        type="text"
                        name="location"
                        required
                        placeholder="e.g., Feni Sadar"
                        value={formData.location}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 focus:border-[#14532d] focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700">Description</label>
                    <textarea
                        name="description"
                        rows="3"
                        placeholder="Provide details about harvest time, packaging, or pickup options..."
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 focus:border-[#14532d] focus:outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-[#14532d] p-3 text-white font-medium transition hover:bg-[#0f4725] disabled:opacity-50"
                >
                    {loading ? 'Publishing Listing...' : 'Publish Listing'}
                </button>
            </form>
        </div>
    );
}
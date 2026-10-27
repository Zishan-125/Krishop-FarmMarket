'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Upload, CheckCircle2, Image as ImageIcon } from 'lucide-react';

const NewProductPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        nameBn: '',
        description: '',
        descriptionBn: '',
        price: '',
        originalPrice: '',
        category: 'seeds',
        categoryBn: '',
        subcategory: '',
        subcategoryBn: '',
        images: [{ url: '', alt: '' }],
        stock: '',
        weight: { value: '', unit: 'kg' },
        brand: '',
        tags: '',
        tagsBn: '',
        isFeatured: false,
    });
    
    const [uploading, setUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('weight.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({ ...prev, weight: { ...prev.weight, [field]: value } }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const res = await axios.post('/api/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.status === 200) {
                setFormData(prev => ({
                    ...prev,
                    images: [{ url: res.data.url, alt: prev.name || 'Product Image' }]
                }));
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload image from device.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const dataToSubmit = {
            ...formData,
            price: parseFloat(formData.price),
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
            stock: parseInt(formData.stock, 10),
            weight: {
                value: parseFloat(formData.weight.value),
                unit: formData.weight.unit,
            },
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            tagsBn: formData.tagsBn.split(',').map(tag => tag.trim()).filter(tag => tag),
        };

        try {
            const response = await axios.post('/api/product', dataToSubmit);
            if (response.status === 201) {
                router.push('/dashboard/admin/products');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === 'loading') {
        return <p className="p-8 text-gray-600">Loading...</p>;
    }

    if (
        status === 'unauthenticated' || 
        (session && 
         session.user?.role !== 'admin' && 
         session.user?.role !== 'vendor' && 
         session.user?.email !== 'zafarahmed01071969@gmail.com')
    ) {
        return <p className="p-8 text-red-600 font-semibold">You are not authorized to view this page.</p>;
    }

    const categories = ['fertilizers', 'seeds', 'tools', 'pesticides', 'soil', 'organic', 'equipment'];
    const weightUnits = ['g', 'kg', 'pcs', 'packet'];

    return (
        <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Add New Product</h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                
                {/* Name and NameBn */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name (English)</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 p-2.5 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="nameBn" className="block text-sm font-medium text-gray-700">Product Name (Bengali)</label>
                        <input type="text" name="nameBn" id="nameBn" value={formData.nameBn} onChange={handleChange} required className="mt-1 p-2.5 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                    </div>
                </div>

                {/* Description and DescriptionBn */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (English)</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="3" className="mt-1 p-2.5 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"></textarea>
                </div>
                <div>
                    <label htmlFor="descriptionBn" className="block text-sm font-medium text-gray-700">Description (Bengali)</label>
                    <textarea name="descriptionBn" id="descriptionBn" value={formData.descriptionBn} onChange={handleChange} rows="3" className="mt-1 p-2.5 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"></textarea>
                </div>

                {/* Price, Original Price, Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (৳)</label>
                        <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required className="mt-1 p-2.5 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700">Original Price (৳)</label>
                        <input type="number" name="originalPrice" id="originalPrice" value={formData.originalPrice} onChange={handleChange} className="mt-1 p-2.5 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
                        <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} required className="mt-1 p-2.5 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                    </div>
                </div>

                {/* Category and CategoryBn */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <select id="category" name="category" value={formData.category} onChange={handleChange} className="mt-1 p-2.5 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm">
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="categoryBn" className="block text-sm font-medium text-gray-700">Category (Bengali)</label>
                        <input type="text" name="categoryBn" id="categoryBn" value={formData.categoryBn} onChange={handleChange} required className="mt-1 p-2.5 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                    </div>
                </div>

                {/* SubCategory and SubCategoryBn */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">Sub-category</label>
                        <input type="text" name="subcategory" id="subcategory" value={formData.subcategory} onChange={handleChange} className="mt-1 p-2.5 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="subcategoryBn" className="block text-sm font-medium text-gray-700">Sub-category (Bengali)</label>
                        <input type="text" name="subcategoryBn" id="subcategoryBn" value={formData.subcategoryBn} onChange={handleChange} className="mt-1 p-2.5 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                    </div>
                </div>

                {/* Device Image Upload Section */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Product Image (Upload from Device)</label>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl cursor-pointer transition text-sm font-medium shadow-sm">
                            <Upload className="w-4 h-4" />
                            {uploading ? 'Uploading...' : 'Choose Image File'}
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileUpload} 
                                className="hidden" 
                            />
                        </label>
                        
                        {formData.images[0].url && (
                            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" /> Uploaded successfully!
                            </div>
                        )}
                    </div>

                    {/* Image Preview */}
                    {formData.images[0].url ? (
                        <div className="mt-3 relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                            <img src={formData.images[0].url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="mt-3 w-32 h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                            <ImageIcon className="w-8 h-8 mb-1" />
                            <span className="text-xs">No image chosen</span>
                        </div>
                    )}
                </div>

                {/* Weight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="weight.value" className="block text-sm font-medium text-gray-700">Weight Value</label>
                        <input type="number" name="weight.value" id="weight.value" value={formData.weight.value} onChange={handleChange} className="mt-1 p-2.5 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="weight.unit" className="block text-sm font-medium text-gray-700">Weight Unit</label>
                        <select id="weight.unit" name="weight.unit" value={formData.weight.unit} onChange={handleChange} className="mt-1 p-2.5 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm">
                            {weightUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                        </select>
                    </div>
                </div>

                {/* Brand */}
                <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
                    <input type="text" name="brand" id="brand" value={formData.brand} onChange={handleChange} className="mt-1 p-2.5 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>

                {/* Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                        <input type="text" name="tags" id="tags" value={formData.tags} onChange={handleChange} className="mt-1 p-2.5 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="tagsBn" className="block text-sm font-medium text-gray-700">Tags (Bengali, comma separated)</label>
                        <input type="text" name="tagsBn" id="tagsBn" value={formData.tagsBn} onChange={handleChange} className="mt-1 p-2.5 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                <div>
                    <button type="submit" disabled={isSubmitting || uploading} className="inline-flex justify-center rounded-xl border border-transparent bg-emerald-600 py-3 px-6 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition">
                        {isSubmitting ? 'Submitting...' : 'Add Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewProductPage;
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('weight.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({ ...prev, weight: { ...prev.weight, [field]: value } }));
        } else if (name.startsWith('images.')) {
            // simplified for one image
            setFormData(prev => ({ ...prev, images: [{ url: value, alt: prev.images[0].alt }] }));
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
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
                router.push('/dashboard/admin/products'); // Redirect to products list
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (status === 'unauthenticated' || (session && session.user.role !== 'admin' && session.user.role !== 'vendor')) {
        return <p>You are not authorized to view this page.</p>;
    }

    const categories = ['fertilizers', 'seeds', 'tools', 'pesticides', 'soil', 'organic', 'equipment'];
    const weightUnits = ['g', 'kg', 'pcs', 'packet'];

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and NameBn */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name (English)</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="nameBn" className="block text-sm font-medium text-gray-700">Product Name (Bengali)</label>
                        <input type="text" name="nameBn" id="nameBn" value={formData.nameBn} onChange={handleChange} required className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                </div>

                {/* Description and DescriptionBn */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (English)</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="3" className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
                </div>
                <div>
                    <label htmlFor="descriptionBn" className="block text-sm font-medium text-gray-700">Description (Bengali)</label>
                    <textarea name="descriptionBn" id="descriptionBn" value={formData.descriptionBn} onChange={handleChange} rows="3" className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
                </div>

                {/* Price, Original Price, Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                        <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700">Original Price</label>
                        <input type="number" name="originalPrice" id="originalPrice" value={formData.originalPrice} onChange={handleChange} className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
                        <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} required className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                </div>

                {/* Category and CategoryBn */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <select id="category" name="category" value={formData.category} onChange={handleChange} className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="categoryBn" className="block text-sm font-medium text-gray-700">Category (Bengali)</label>
                        <input type="text" name="categoryBn" id="categoryBn" value={formData.categoryBn} onChange={handleChange} required className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                </div>

                {/* SubCategory and SubCategoryBn */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">Sub-category</label>
                        <input type="text" name="subcategory" id="subcategory" value={formData.subcategory} onChange={handleChange} className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="subcategoryBn" className="block text-sm font-medium text-gray-700">Sub-category (Bengali)</label>
                        <input type="text" name="subcategoryBn" id="subcategoryBn" value={formData.subcategoryBn} onChange={handleChange} className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                </div>

                {/* Image URL */}
                <div>
                    <label htmlFor="images.url" className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input type="text" name="images.url" id="images.url" value={formData.images[0].url} onChange={handleChange} className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>

                {/* Weight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="weight.value" className="block text-sm font-medium text-gray-700">Weight Value</label>
                        <input type="number" name="weight.value" id="weight.value" value={formData.weight.value} onChange={handleChange} className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="weight.unit" className="block text-sm font-medium text-gray-700">Weight Unit</label>
                        <select id="weight.unit" name="weight.unit" value={formData.weight.unit} onChange={handleChange} className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            {weightUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                        </select>
                    </div>
                </div>

                {/* Brand */}
                <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
                    <input type="text" name="brand" id="brand" value={formData.brand} onChange={handleChange} className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>

                {/* Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                        <input type="text" name="tags" id="tags" value={formData.tags} onChange={handleChange} className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="tagsBn" className="block text-sm font-medium text-gray-700">Tags (Bengali, comma separated)</label>
                        <input type="text" name="tagsBn" id="tagsBn" value={formData.tagsBn} onChange={handleChange} className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                </div>

                
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div>
                    <button type="submit" disabled={isSubmitting} className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50">
                        {isSubmitting ? 'Submitting...' : 'Add Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewProductPage;

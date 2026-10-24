
'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const EditProductPopup = ({ product, onClose }) => {
    const [formData, setFormData] = useState(product || {});

    useEffect(() => {
        setFormData(product || {});
    }, [product]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleArrayChange = (e, index, arrayName, fieldName) => {
        const newArray = [...formData[arrayName]];
        newArray[index][fieldName] = e.target.value;
        setFormData(prev => ({ ...prev, [arrayName]: newArray }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`/api/product/${product._id}`, formData);
            console.log(response.data);

            if (response.status === 200) {
                Swal.fire(
                    'Updated!',
                    'The product has been updated.',
                    'success'
                );
                onClose();
            }
        } catch (error) {
            console.error('Failed to update product', error);
        }
    };

    if (!product) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="relative mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Edit Product</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        <input type="text" name="nameBn" value={formData.nameBn} onChange={handleChange} placeholder="Name (Bengali)" className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="md:col-span-2 mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
                        <textarea name="descriptionBn" value={formData.descriptionBn} onChange={handleChange} placeholder="Description (Bengali)" className="md:col-span-2 mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price" className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} placeholder="Original Price" className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Category" className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        <input type="text" name="categoryBn" value={formData.categoryBn} onChange={handleChange} placeholder="Category (Bengali)" className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        <input type="text" name="subcategory" value={formData.subcategory} onChange={handleChange} placeholder="Subcategory" className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        <input type="text" name="subcategoryBn" value={formData.subcategoryBn} onChange={handleChange} placeholder="Subcategory (Bengali)" className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="Stock" className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand" className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        <input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="SKU" className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        <div className="flex items-center">
                            <input id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Active</label>
                        </div>
                        <div className="flex items-center">
                            <input id="isFeatured" name="isFeatured" type="checkbox" checked={formData.isFeatured} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                            <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">Featured</label>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-md font-medium text-gray-800 mb-2">Images</h4>
                        {formData.images.map((img, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input type="text" value={img.url} onChange={(e) => handleArrayChange(e, index, 'images', 'url')} placeholder="Image URL" className="p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                <input type="text" value={img.alt} onChange={(e) => handleArrayChange(e, index, 'images', 'alt')} placeholder="Alt Text" className="p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded mr-2">Cancel</button>
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductPopup;

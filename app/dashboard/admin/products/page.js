'use client';
import axios from 'axios';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import EditProductPopup from '@/Components/EditProductPopup';

const AllProducts = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isEditPopupOpen, setEditPopupOpen] = useState(false);

    // Filtering and Sorting State
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('default');

    const categories = ['All', 'fertilizers', 'seeds', 'pesticides', 'equipment'];

    const fetchProducts = async () => {
        try {
            const response = await axios.get('/api/allProducts');
            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }
            const data = response?.data?.products || response?.data || [];
            setProducts(data);
            setFilteredProducts(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Filter and Sort Logic Effect
    useEffect(() => {
        let result = [...products];

        if (selectedCategory !== 'All') {
            result = result.filter(
                (p) => p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        if (sortBy === 'price-low') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
            result.sort((a, b) => b.price - a.price);
        }

        setFilteredProducts(result);
    }, [selectedCategory, sortBy, products]);

    const handleDelete = async (productId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`/api/product/${productId}`);
                    setProducts(products.filter(p => p._id !== productId));
                    Swal.fire(
                        'Deleted!',
                        'The product has been deleted.',
                        'success'
                    );
                } catch (err) {
                    console.error('Failed to delete product', err);
                    Swal.fire(
                        'Error!',
                        'There was an error deleting the product.',
                        'error'
                    );
                }
            }
        });
    };

    const openEditPopup = (product) => {
        setSelectedProduct(product);
        setEditPopupOpen(true);
    }

    const closeEditPopup = () => {
        setSelectedProduct(null);
        setEditPopupOpen(false);
    }

    if (loading) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8">Error: {error.message}</div>;

    return (
        <div className="container mx-auto px-4 sm:px-8 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-semibold leading-tight">Admin Products Management</h2>
                <div className="flex items-center gap-3">
                    {/* User Management Link Feature */}
                    <Link href="/dashboard/admin/users" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition">
                        Manage Users
                    </Link>
                    <Link href="/dashboard/admin/products/new" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition">
                        Add New Product
                    </Link>
                </div>
            </div>

            {/* Category Filter & Sort Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-700 text-sm">Category:</span>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase transition ${
                                selectedCategory === cat
                                    ? 'bg-green-700 text-white shadow'
                                    : 'bg-white border text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700 text-sm">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border rounded px-3 py-1 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                        <option value="default">Default</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                    </select>
                </div>
            </div>

            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden bg-white">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500 text-sm">
                                        No products found matching your filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50 transition">
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 w-10 h-10 relative">
                                                    <Image
                                                        src={product.images?.[0]?.url || product.image || 'https://placehold.co/40x40'}
                                                        alt={product.name || product.productName}
                                                        fill
                                                        className="rounded-full object-cover"
                                                    />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-gray-900 whitespace-no-wrap font-medium">{product.name || product.productName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap capitalize">{product.category || 'General'}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap font-semibold text-green-700">৳{product.price}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{product.stock || 0}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${product.isActive !== false ? 'text-green-900' : 'text-red-900'}`}>
                                                <span aria-hidden className={`absolute inset-0 ${product.isActive !== false ? 'bg-green-200' : 'bg-red-200'} opacity-50 rounded-full`}></span>
                                                <span className="relative">{product.isActive !== false ? 'Active' : 'Inactive'}</span>
                                            </span>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                                            <button onClick={() => openEditPopup(product)} className="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                                            <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900 ml-4 font-medium">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isEditPopupOpen && (
                <EditProductPopup
                    product={selectedProduct}
                    onClose={closeEditPopup}
                />
            )}
        </div>
    );
}

export default AllProducts;
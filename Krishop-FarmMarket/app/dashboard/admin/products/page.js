'use client'
import axios from 'axios';
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import EditProductPopup from '@/Components/EditProductPopup';

const AllProducts = () => {
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [selectedProduct, setSelectedProduct] = React.useState(null);
    const [isEditPopupOpen, setEditPopupOpen] = React.useState(false);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('/api/allProducts');
            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }
            setProducts(response?.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchProducts();
    }, []);

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

    // const handleUpdateProduct = async (updatedProduct) => {
    //     console.log("hit");

    //     const { _id, ...productData } = updatedProduct;
    //     console.log(_id);

    //     try {
    //         await axios.put(`/api/product/${updatedProduct._id}`, updatedProduct);
    //         setProducts(products.map(p => p._id === updatedProduct._id ? updatedProduct : p));
    //         Swal.fire(
    //             'Updated!',
    //             'The product has been updated.',
    //             'success'
    //         );
    //     } catch (err) {
    //         console.error('Failed to update product', err);
    //         Swal.fire(
    //             'Error!',
    //             'There was an error updating the product.',
    //             'error'
    //         );
    //     }
    // }

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
        <div className="container mx-auto px-4 sm:px-8 py-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold leading-tight">Products</h2>
                <Link href="/dashboard/admin/products/new" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                    Add New Product
                </Link>
            </div>
            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
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
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10 relative">
                                                <Image
                                                    src={product.images[0]?.url || 'https://placehold.co/40x40'}
                                                    alt={product.name}
                                                    fill
                                                    className="rounded-full object-cover"
                                                />
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-gray-900 whitespace-no-wrap">{product.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">{product.category}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">${product.price}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">{product.stock}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${product.isActive ? 'text-green-900' : 'text-red-900'}`}>
                                            <span aria-hidden className={`absolute inset-0 ${product.isActive ? 'bg-green-200' : 'bg-red-200'} opacity-50 rounded-full`}></span>
                                            <span className="relative">{product.isActive ? 'Active' : 'Inactive'}</span>
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                                        <button onClick={() => openEditPopup(product)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isEditPopupOpen && (
                <EditProductPopup
                    product={selectedProduct}
                    onClose={closeEditPopup}
                // onProductUpdate={() => {
                //     handleUpdateProduct();
                // }}
                />
            )}
        </div>
    );
}

export default AllProducts;

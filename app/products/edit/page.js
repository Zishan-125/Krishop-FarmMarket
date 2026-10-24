'use client';

import Image from 'next/image';
import AddToCartButton from '@/Components/AddToCartButton'; 
import { use, useEffect, useState } from 'react';
import axios from 'axios';

export default function ProductDetailsPage({ params }) {
    // Unwrap params for Next.js 15+
    const { id } = use(params);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // OPTIMIZATION: Fetch only the specific product using the ID
                // This assumes you have an API route at /api/product/[id]
                const response = await axios.get(`/api/product/${id}`);
                
                if (!response.data) {
                    throw new Error('Product not found');
                }
                setProduct(response.data);
            } catch (err) {
                console.error("Failed to fetch product:", err);
                setError("Product not found");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    // 1. Loading State
    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    // 2. Error State
    if (error || !product) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-700">Product Not Found</h2>
                <p className="text-gray-500">The product you are looking for does not exist.</p>
            </div>
        );
    }

    // 3. Discount Logic
    const isDiscountActive = () => {
        if (!product.discount?.type) return false;
        const now = new Date();
        if (product.discount.startDate && new Date(product.discount.startDate) > now) return false;
        if (product.discount.endDate && new Date(product.discount.endDate) < now) return false;
        return true;
    };

    const getDiscountedPrice = () => {
        const price = parseFloat(product.price);
        if (!isDiscountActive()) return price;
        
        if (product.discount.type === 'percentage') {
            return price - (price * product.discount.value / 100);
        } else if (product.discount.type === 'fixed') {
            return price - product.discount.value;
        }
        return price;
    }

    const discountedPrice = getDiscountedPrice();
    const originalPrice = parseFloat(product.price);

    const priceDisplay = discountedPrice < originalPrice
        ? (
            <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-red-600">৳{discountedPrice.toFixed(2)}</p>
                <p className="text-xl text-gray-500 line-through mb-1">৳{originalPrice.toFixed(2)}</p>
            </div>
        )
        : <p className="text-3xl font-bold text-gray-800">৳{originalPrice.toFixed(2)}</p>;

    // Handle Image Fallback safely
    const mainImage = product.images && product.images.length > 0 
        ? product.images[0].url 
        : 'https://placehold.co/600x400?text=No+Image';

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Section */}
                <div>
                    <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg border border-gray-100">
                        <Image
                            src={mainImage}
                            alt={product.name}
                            fill={true}
                            style={{ objectFit: "cover" }}
                            className="hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                </div>

                {/* Details Section */}
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">{product.name}</h1>
                    {product.nameBn && <p className="text-lg text-gray-500 mb-4 font-bengali">{product.nameBn}</p>}

                    <div className="mb-6">{priceDisplay}</div>

                    <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

                    <div className="space-y-3 mb-8">
                        <div className="flex items-center">
                            <span className="w-24 font-semibold text-gray-700">Category:</span>
                            <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm capitalize">
                                {product.category}
                            </span>
                        </div>

                        {product.brand && (
                            <div className="flex items-center">
                                <span className="w-24 font-semibold text-gray-700">Brand:</span>
                                <span>{product.brand}</span>
                            </div>
                        )}

                        <div className="flex items-center">
                            <span className="w-24 font-semibold text-gray-700">Stock:</span>
                            {product.stock > 0 ? (
                                <span className="text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full text-sm">
                                    In Stock ({product.stock})
                                </span>
                            ) : (
                                <span className="text-red-600 font-semibold bg-red-50 px-3 py-1 rounded-full text-sm">
                                    Out of Stock
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Button - No need for JSON parse hack in Client Components */}
                    <AddToCartButton product={product} />
                </div>
            </div>

            {/* Specifications Section */}
            {product.specifications && product.specifications.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">Specifications</h2>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <tbody className="bg-white divide-y divide-gray-200">
                                {product.specifications.map((spec, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/3">{spec.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{spec.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table> 
                    </div>
                </div>
            )}
        </div>
    );
}
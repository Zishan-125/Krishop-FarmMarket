'use client';

import Image from 'next/image';
import AddToCartButton from '@/Components/AddToCartButton'; // I will create this client component
import { use, useEffect, useState } from 'react';
import axios from 'axios';



export default function ProductDetailsPage({ params }) {
    const { id } = use(params);
    console.log(id)


    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`/api/product/${id}`);
                setProduct(response.data);
            } catch (error) {
                console.error("Failed to fetch product:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);
    if (loading) {
        return <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700"></div>
        </div>;
    }


    if (!product) {
        return <div className="text-center py-12">Product not found</div>;
    }

    const isDiscountActive = () => {
        if (!product.discount?.type) return false;
        const now = new Date();
        if (product.discount.startDate && new Date(product.discount.startDate) > now) return false;
        if (product.discount.endDate && new Date(product.discount.endDate) < now) return false;
        return true;
    };

    const getDiscountedPrice = () => {
        if (!isDiscountActive()) return product.price;
        if (product.discount.type === 'percentage') {
            return product.price - (product.price * product.discount.value / 100);
        } else if (product.discount.type === 'fixed') {
            return product.price - product.discount.value;
        }
        return product.price;
    }

    const discountedPrice = getDiscountedPrice();

    const priceDisplay = discountedPrice < product.price
        ? (
            <p className="text-3xl font-bold text-red-600">
                {discountedPrice.toFixed(2)} BDT
                <span className="text-xl text-gray-500 line-through ml-4">{product.price.toFixed(2)} BDT</span>
            </p>
        )
        : <p className="text-3xl font-bold text-gray-800">{product.price.toFixed(2)} BDT</p>;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
                        <Image
                            src={product.images[0]?.url || 'https://placehold.co/600x400'}
                            alt={product.name}
                            fill={true}
                            style={{ objectFit: "cover" }}
                        />
                    </div>
                </div>

                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">{product.name}</h1>
                    <p className="text-lg text-gray-600 mb-4">{product.nameBn}</p>

                    <div className="mb-6">{priceDisplay}</div>

                    <p className="text-gray-700 mb-6">{product.description}</p>

                    <div className="flex items-center mb-6">
                        <span className="text-gray-700 font-semibold mr-2">Category:</span>
                        <span className="text-blue-600">{product.category}</span>
                    </div>

                    <div className="flex items-center mb-6">
                        <span className="text-gray-700 font-semibold mr-2">Brand:</span>
                        <span>{product.brand}</span>
                    </div>

                    <div className="flex items-center mb-6">
                        <span className="text-gray-700 font-semibold mr-2">Stock:</span>
                        {product.stock > 0 ? (
                            <span className="text-green-600 font-semibold">In Stock ({product.stock} available)</span>
                        ) : (
                            <span className="text-red-600 font-semibold">Out of Stock</span>
                        )}
                    </div>

                    <AddToCartButton product={JSON.parse(JSON.stringify(product))} />
                </div>
            </div>

            {product.specifications && product.specifications.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-4">Specifications</h2>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full">
                            <tbody className="bg-white">
                                {product.specifications.map((spec, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{spec.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{spec.value}</td>
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

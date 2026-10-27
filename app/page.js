'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/Components/Header';
import NewProductCard from '@/Components/NewProductCard';
import Footer from '@/Components/Footer';
import { toast } from 'react-toastify';

export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Clean up old search query parameter from URL on load
        if (typeof window !== 'undefined' && window.location.search.includes('search=')) {
            router.replace('/');
        }

        const fetchProducts = async () => {
            try {
                const response = await axios.get('/api/allProducts');
                setProducts(response.data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
                toast.error('Failed to load products.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [router]);

    // Real-time filtering as the user types
    const filteredProducts = products.filter(product => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = product.name?.toLowerCase().includes(query);
        const categoryMatch = product.category?.toLowerCase().includes(query);
        const descMatch = product.description?.toLowerCase().includes(query);
        return nameMatch || categoryMatch || descMatch;
    });

    return (
        <div className="App bg-white text-black">
            <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            
            <main className="p-5 bg-gray-100 min-h-screen">
                {/* Fixed, clean header title */}
                <h2 className="text-4xl text-center text-green-700 h-16 mb-8">
                    All Products
                </h2>
                
                {loading ? (
                    <div className="flex justify-center items-center min-h-[50vh]">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-16 text-gray-600 text-lg">
                        No products found matching &quot;{searchQuery}&quot;.
                    </div>
                ) : (
                    <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {filteredProducts.map(product => (
                            <NewProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
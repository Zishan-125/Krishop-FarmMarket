'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/Components/Header';
import NewProductCard from '@/Components/NewProductCard';
import Footer from '@/Components/Footer';
import { toast } from 'react-toastify';

function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, []);

    return (
        <div className="App bg-white text-black">
            <Header />
            <main className="p-5 bg-gray-100">
                <h2 className="text-4xl text-center text-green-700 h-16 mb-8">All Products</h2>
                {loading ? (
                    <div className="flex justify-center items-center min-h-[60vh]">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700"></div>
                    </div>
                ) : (
                    <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.map(product => (
                            <NewProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default HomePage;

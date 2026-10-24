'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

const Orders = () => {
    const [orderedProducts, setOrderedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { data: session, status } = useSession();

    useEffect(() => {
        const fetchOrderedProducts = async () => {
            if (session?.user?.id) {
                setLoading(true);
                try {
                    const response = await axios.get(`/api/ordered/${session.user.id}`);
                    if (response.status === 200) {
                        setOrderedProducts(response.data.orders);
                    } else {
                        console.error('Error fetching ordered products:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error fetching ordered products:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        if (status === 'authenticated') {
            fetchOrderedProducts();
        } else if (status === 'unauthenticated') {
            setLoading(false);
            setOrderedProducts([]);
        }
    }, [status, session]);

    if (status === 'loading' || loading) {
        return <div style={{ padding: '2rem' }}><p>Loading orders...</p></div>;
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Your Ordered Products</h1>
            {orderedProducts.length > 0 ? (
                orderedProducts.map((order) => (
                    <div key={order._id} style={{ marginBottom: '2rem', border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
                        <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                            Order: {order.transactionId}
                        </h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2' }}>Product Name</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2' }}>Price</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2' }}>Quantity</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2' }}>Total Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item) => (
                                    <tr key={item._id}>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.productName}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.price}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.quantity}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.totalPrice}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))
            ) : (
                <p>You have no ordered products.</p>
            )}
        </div>
    );
};

export default Orders;

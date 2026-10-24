'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

import Cart from '@/Components/Cart';

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(savedCart);
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.productName === product.name);

        if (existingItem) {
            const updatedCart = cart.map(item =>
                item.productName === product.name
                    ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.price }
                    : item
            );
            setCart(updatedCart);
        } else {
            setCart([...cart, { productName: product.name, price: product.price, quantity: 1, totalPrice: product.price }]);
        }
        toast.success(`${product.name} has been added to your cart.`);
    };

    const viewCart = () => setShowCart(true);
    const closeCart = () => setShowCart(false);

    const increaseQuantity = (index) => {
        const updatedCart = [...cart];
        updatedCart[index].quantity += 1;
        updatedCart[index].totalPrice = updatedCart[index].quantity * updatedCart[index].price;
        setCart(updatedCart);
    };

    const decreaseQuantity = (index) => {
        if (cart[index].quantity > 1) {
            const updatedCart = [...cart];
            updatedCart[index].quantity -= 1;
            updatedCart[index].totalPrice = updatedCart[index].quantity * updatedCart[index].price;
            setCart(updatedCart);
        }
    };

    const removeFromCart = (index) => {
        const updatedCart = [...cart];
        updatedCart.splice(index, 1);
        setCart(updatedCart);
    };

    const removeSelectedFromCart = (selectedItems) => {
        const updatedCart = cart.filter(item => !selectedItems.find(selected => selected.productName === item.productName));
        setCart(updatedCart);
    }

    const clearCart = () => {
        setCart([]);
    };

    const value = {
        cart,
        showCart,
        addToCart,
        viewCart,
        closeCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        removeSelectedFromCart,
        clearCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
            {showCart && <Cart />}
        </CartContext.Provider>
    );
};

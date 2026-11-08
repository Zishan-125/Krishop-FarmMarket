
'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
} from 'react';

import { toast } from 'react-toastify';
import { getSession, signIn } from 'next-auth/react';
import Cart from '@/Components/Cart';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [cartLoaded, setCartLoaded] = useState(false);

    // Load saved cart when the component mounts.
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cart');

            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);

                if (Array.isArray(parsedCart)) {
                    setCart(parsedCart);
                }
            }
        } catch (error) {
            console.error('Failed to load cart:', error);
            setCart([]);
        } finally {
            setCartLoaded(true);
        }
    }, []);

    // Save cart only after the saved cart has loaded.
    useEffect(() => {
        if (!cartLoaded) return;

        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
            console.error('Failed to save cart:', error);
        }
    }, [cart, cartLoaded]);

    // Require login before adding any product to the cart.
    const addToCart = async (product) => {
        try {
            const session = await getSession();

            if (!session) {
                toast.info('Please log in to add products to your cart.');

                await signIn(undefined, {
                    callbackUrl:
                        typeof window !== 'undefined'
                            ? window.location.href
                            : '/',
                });

                return;
            }

            if (
                !product ||
                !product.name ||
                product.price == null ||
                !Number.isFinite(Number(product.price)) ||
                Number(product.price) < 0
            ) {
                toast.error('Invalid product information.');
                return;
            }

            const productPrice = Number(product.price);

            setCart((previousCart) => {
                const existingItem = previousCart.find(
                    (item) => item.productName === product.name
                );

                if (existingItem) {
                    return previousCart.map((item) =>
                        item.productName === product.name
                            ? {
                                  ...item,
                                  quantity: item.quantity + 1,
                                  totalPrice:
                                      (item.quantity + 1) * item.price,
                              }
                            : item
                    );
                }

                return [
                    ...previousCart,
                    {
                        productName: product.name,
                        price: productPrice,
                        quantity: 1,
                        totalPrice: productPrice,
                    },
                ];
            });

            toast.success(`${product.name} has been added to your cart.`);
        } catch (error) {
            console.error('Unable to verify login status:', error);
            toast.error('Could not verify your login. Please try again.');
        }
    };

    const viewCart = () => {
        setShowCart(true);
    };

    const closeCart = () => {
        setShowCart(false);
    };

    const increaseQuantity = (index) => {
        setCart((previousCart) =>
            previousCart.map((item, i) =>
                i === index
                    ? {
                          ...item,
                          quantity: item.quantity + 1,
                          totalPrice: (item.quantity + 1) * item.price,
                      }
                    : item
            )
        );
    };

    const decreaseQuantity = (index) => {
        setCart((previousCart) =>
            previousCart.map((item, i) =>
                i === index && item.quantity > 1
                    ? {
                          ...item,
                          quantity: item.quantity - 1,
                          totalPrice: (item.quantity - 1) * item.price,
                      }
                    : item
            )
        );
    };

    const removeFromCart = (index) => {
        setCart((previousCart) =>
            previousCart.filter((_, i) => i !== index)
        );
    };

    const removeSelectedFromCart = (selectedItems) => {
        setCart((previousCart) =>
            previousCart.filter(
                (item) =>
                    !selectedItems.some(
                        (selected) =>
                            selected.productName === item.productName
                    )
            )
        );
    };

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
        clearCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
            {showCart && <Cart />}
        </CartContext.Provider>
    );
};

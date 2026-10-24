'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/context/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function Providers({ children }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <ToastContainer />
      </CartProvider>
    </SessionProvider>
  );
}

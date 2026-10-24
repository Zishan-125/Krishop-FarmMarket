'use client';

import { useCart } from '@/context/CartContext';

const AddToCartButton = ({ product }) => {
    const { addToCart } = useCart();

    return (
        <button 
            onClick={() => addToCart(product)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={product.stock === 0}
        >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
    );
};

export default AddToCartButton;

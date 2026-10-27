import Image from 'next/image';
import React from 'react';

const ProductCard = ({ product, addToCart, buyNow }) => {
    return (
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2 border-2 bg-amber-100">
            <Image
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover block"
                height={192}
                width={192}
            />
            <h3 className="text-lg my-2 mx-0">{product.name}</h3>
            <p className="text-base font-bold text-green-700 mb-2">{product.price.toFixed(2)} BDT</p>
            <button
                onClick={() => addToCart(product)}
                className="px-5 py-2 bg-orange-500 text-white border-none rounded cursor-pointer text-base mb-2 transition-colors duration-300 hover:bg-orange-700 hover:scale-105"
            >
                Add to Cart
            </button>
            <button
                onClick={() => buyNow(product)}
                className="px-5 py-2 bg-orange-500 text-white border-none rounded cursor-pointer text-base mb-2 transition-colors duration-300 hover:bg-orange-700 hover:scale-105 ml-2"
            >
                BUY NOW
            </button>
        </div>
    );
};

export default ProductCard;

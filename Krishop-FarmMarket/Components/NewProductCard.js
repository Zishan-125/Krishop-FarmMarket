import Link from 'next/link';
import Image from 'next/image';

const NewProductCard = ({ product }) => {

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
            <p className="text-lg font-bold text-red-600">
                {discountedPrice.toFixed(2)} BDT
                <span className="text-sm text-gray-500 line-through ml-2">{product.price.toFixed(2)} BDT</span>
            </p>
        )
        : <p className="text-lg font-bold text-gray-800">{product.price.toFixed(2)} BDT</p>;


    return (
        <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Link href={`/products/${product._id}`}>
                <div className="relative w-full h-64">
                    <Image
                        src={product.images[0]?.url || 'https://placehold.co/400x300'}
                        alt={product.name}
                        fill={true}
                        style={{ objectFit: "cover" }}
                    />
                </div>
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                    {priceDisplay}
                    <div className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-center">
                        View Details
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default NewProductCard;

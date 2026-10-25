import Image from 'next/image';
import Link from 'next/link';

export default function NewProductCard({ product }) {
    const discountActive = product.discount?.type &&
        (!product.discount.startDate || new Date(product.discount.startDate) <= new Date()) &&
        (!product.discount.endDate || new Date(product.discount.endDate) >= new Date());
    const price = discountActive && product.discount.type === 'percentage'
        ? product.price - (product.price * product.discount.value) / 100
        : discountActive && product.discount.type === 'fixed'
            ? product.price - product.discount.value
            : product.price;
    const image = product.images?.[0]?.url || '/BeetRoot.png';

    return (
        <article className="group overflow-hidden rounded-2xl border border-[#dfece1] bg-white shadow-[0_8px_24px_rgba(13,84,47,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(13,84,47,0.12)]">
            <Link href={`/products/${product._id}`}>
                <div className="relative h-56 overflow-hidden bg-[#edf7ef]">
                    <Image src={image} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
                    {discountActive && <span className="absolute left-3 top-3 rounded-full bg-[#c66a3d] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">Special price</span>}
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold capitalize text-[#3f654b]">{product.category}</span>
                </div>
                <div className="p-4">
                    <h3 className="truncate font-bold text-[#173d27]">{product.name}</h3>
                    <p className="mt-1 line-clamp-1 text-xs text-[#829087]">{product.description || 'Quality products for your farm'}</p>
                    <div className="mt-4 flex items-end justify-between gap-2">
                        <div><p className="text-xl font-bold text-[#0d542f]">৳{price.toFixed(2)}</p>{discountActive && <p className="text-xs text-[#9aa89d] line-through">৳{product.price.toFixed(2)}</p>}</div>
                        <span className="rounded-lg bg-[#e4f5e8] px-3 py-2 text-xs font-bold text-[#2f8a52]">View details</span>
                    </div>
                </div>
            </Link>
        </article>
    );
}

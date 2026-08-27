import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/database';

export const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col justify-between">
      <div>
        <div className="relative w-full h-48 bg-gray-50">
          <Image src={product.image_url} alt={product.title} fill className="object-cover" />
          <span className="absolute top-2 right-2 bg-purple-900/90 text-amber-300 text-xs font-bold px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">{product.title}</h3>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
        </div>
      </div>
      <div className="p-4 pt-0 flex items-center justify-between border-t border-gray-50 mt-2">
        <span className="text-xl font-black text-purple-900">{product.price_pi} <span className="text-amber-500">π</span></span>
        <Link href={`/product/${product.id}`} className="bg-purple-900 text-white text-xs px-4 py-2 rounded-lg">
          Voir
        </Link>
      </div>
    </div>
  );
};
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/database';
import { Heart, ShoppingBag, ShieldCheck, User } from 'lucide-react';
import { useCart } from './CartProvider';
import { useFavorites } from './FavoritesProvider';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, featured }) => {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(product.id);

  const fallbackImage = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80';
  const displayImage = product.image_url || fallbackImage;

  return (
    <div className={`group bg-white rounded-2xl border border-gray-200/90 hover:border-purple-300 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between ${
      featured ? 'ring-2 ring-amber-400' : ''
    }`}>
      {/* Image Container */}
      <div className="relative w-full aspect-4/3 bg-gray-100 overflow-hidden">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <Image
            src={displayImage}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          <span className="bg-purple-900/90 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-xs shadow-xs">
            {product.category}
          </span>
          {product.is_demo && (
            <span className="bg-amber-400 text-purple-950 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              Démo
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all duration-150 z-10 shadow-xs ${
            favorited
              ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-rose-500'
          }`}
          aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Stock indicator */}
        {product.stock !== undefined && product.stock <= 3 && product.stock > 0 && (
          <span className="absolute bottom-2 left-2 bg-rose-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
            Plus que {product.stock} en stock
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Seller / Verification */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
            <User className="w-3.5 h-3.5 text-purple-700" />
            <span className="truncate max-w-[140px] font-medium">
              @{product.seller?.username || 'Vendeur_Pi'}
            </span>
            <span title="Vendeur vérifié" className="ml-auto shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            </span>
          </div>

          {/* Title */}
          <Link href={`/product/${product.id}`}>
            <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1 hover:text-purple-900 transition-colors">
              {product.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Footer info: Price & Action buttons */}
        <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-gray-400 block font-medium">Prix</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-purple-950 tracking-tight">
                {product.price_pi}
              </span>
              <span className="text-amber-500 font-bold text-base">π</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => addToCart(product, 1)}
              className="p-2 rounded-xl bg-purple-50 text-purple-900 hover:bg-purple-100 active:scale-95 transition"
              title="Ajouter au panier"
              aria-label="Ajouter au panier"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
            <Link
              href={`/product/${product.id}`}
              className="px-3.5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 active:scale-95 text-white text-xs font-bold transition shadow-xs"
            >
              Voir
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

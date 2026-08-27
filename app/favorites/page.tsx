'use client';

import React from 'react';
import Link from 'next/link';
import { useFavorites } from '@/components/FavoritesProvider';
import { ProductCard } from '@/components/ProductCard';
import { Heart, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

export default function FavoritesPage() {
  const { favoriteProducts } = useFavorites();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-900 hover:text-purple-700 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Explorer le catalogue</span>
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
            <span>Mes Favoris ({favoriteProducts.length})</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Retrouvez tous les articles que vous avez sauvegardés pour plus tard
          </p>
        </div>
      </div>

      {/* Grid */}
      {favoriteProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8 space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Vous n&apos;avez aucun favori pour le moment</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
            Cliquez sur le cœur d&apos;un article dans le catalogue pour l&apos;ajouter à votre liste de souhaits.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-900 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            <span>Découvrir les articles</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

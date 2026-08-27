'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Product } from '@/types/database';
import { ProductCard } from '@/components/ProductCard';
import { ArrowLeft, Tag, ShoppingBag, ArrowUpDown } from 'lucide-react';

export default function CategoryDetailPage() {
  const params = useParams();
  const rawCategory = params.category ? decodeURIComponent(params.category as string) : '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('recent');

  useEffect(() => {
    async function loadCategoryProducts() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products?category=${encodeURIComponent(rawCategory)}&sort=${sort}&includeDemo=true`);
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (rawCategory) {
      loadCategoryProducts();
    }
  }, [rawCategory, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-900 hover:text-purple-700 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Toutes les catégories</span>
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Tag className="w-8 h-8 text-purple-900" />
            <span>Rayon : {rawCategory}</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {products.length} {products.length > 1 ? 'articles disponibles' : 'article disponible'} dans cette catégorie
          </p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-700" />
            Trier :
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 focus:outline-hidden focus:ring-2 focus:ring-purple-600 shadow-xs"
          >
            <option value="recent">Plus récents</option>
            <option value="price_asc">Prix croissant (π)</option>
            <option value="price_desc">Prix décroissant (π)</option>
            <option value="name_asc">Nom (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200 animate-pulse space-y-3">
              <div className="w-full aspect-4/3 bg-gray-200 rounded-xl" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-6 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8 space-y-4">
          <div className="w-16 h-16 bg-purple-50 text-purple-900 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Aucun produit dans {rawCategory} pour l&apos;instant</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Soyez le premier vendeur à proposer un produit dans ce rayon !
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/seller"
              className="px-5 py-2.5 bg-amber-400 text-purple-950 font-bold text-xs rounded-xl shadow-xs"
            >
              Vendre dans ce rayon
            </Link>
            <Link
              href="/products"
              className="px-5 py-2.5 bg-purple-900 text-white font-semibold text-xs rounded-xl shadow-xs"
            >
              Voir tous les articles
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

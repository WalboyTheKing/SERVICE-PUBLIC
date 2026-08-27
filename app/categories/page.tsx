'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { CategoryCard } from '@/components/CategoryCard';
import { Product } from '@/types/database';
import { Layers, ArrowLeft } from 'lucide-react';

export default function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products?includeDemo=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .catch((e) => console.warn(e));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-900 hover:text-purple-700 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à l&apos;accueil</span>
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Layers className="w-8 h-8 text-purple-900" />
            <span>Tous les Rayons & Catégories</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Découvrez tous les univers de produits et services disponibles sur PiMarket
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {PRODUCT_CATEGORIES.map((category) => {
          const count = products.filter((p) => p.category.toLowerCase() === category.toLowerCase()).length;
          return (
            <CategoryCard
              key={category}
              category={category}
              count={count}
            />
          );
        })}
      </div>
    </div>
  );
}

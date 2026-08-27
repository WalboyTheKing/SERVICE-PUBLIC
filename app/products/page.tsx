'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/types/database';
import { ProductCard } from '@/components/ProductCard';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, X, Tag, ShoppingBag } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sort, setSort] = useState('recent');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'Tous') {
          params.set('category', selectedCategory);
        }
        if (search) {
          params.set('q', search);
        }
        if (sort) {
          params.set('sort', sort);
        }
        if (minPrice) {
          params.set('minPrice', minPrice);
        }
        if (maxPrice) {
          params.set('maxPrice', maxPrice);
        }
        params.set('includeDemo', 'true');

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Erreur chargement produits:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory, search, sort, minPrice, maxPrice]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setSort('recent');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-purple-900" />
            <span>Catalogue des Produits</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Découvrez tous les articles disponibles à l&apos;achat avec Pi Network
          </p>
        </div>

        {/* Search input & Mobile toggle */}
        <div className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher par titre, catégorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white text-gray-900 placeholder-gray-400 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 shadow-xs"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden p-2.5 rounded-xl bg-purple-900 text-white shadow-xs"
            aria-label="Filtres"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main layout with sidebar filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className={`md:block space-y-6 ${mobileFilterOpen ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-purple-900" />
                Filtres & Tri
              </span>
              {(selectedCategory || search || minPrice || maxPrice) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-purple-900 font-semibold hover:underline"
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Tri */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-purple-700" />
                Trier par
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 focus:outline-hidden focus:ring-2 focus:ring-purple-600"
              >
                <option value="recent">Plus récents d&apos;abord</option>
                <option value="price_asc">Prix : Croissant (π)</option>
                <option value="price_desc">Prix : Décroissant (π)</option>
                <option value="name_asc">Nom alphabétique (A-Z)</option>
              </select>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-700" />
                Catégories
              </label>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedCategory === ''
                      ? 'bg-purple-900 text-white font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Toutes les catégories
                </button>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedCategory === cat
                        ? 'bg-purple-900 text-white font-bold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Fourchette de Prix (π)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min π"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-xs rounded-xl p-2 focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                />
                <span className="text-gray-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max π"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-xs rounded-xl p-2 focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="md:col-span-3 space-y-6">
          {/* Active filter chips */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              <strong>{products.length}</strong> {products.length > 1 ? 'produits trouvés' : 'produit trouvé'}
            </span>
            {selectedCategory && (
              <span className="bg-purple-100 text-purple-900 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                Catégorie : {selectedCategory}
                <button onClick={() => setSelectedCategory('')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
              <h3 className="text-lg font-bold text-gray-900">Aucun produit ne correspond à votre recherche</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                Essayez d&apos;élargir vos critères de recherche ou réinitialisez les filtres pour afficher l&apos;ensemble du catalogue.
              </p>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-purple-900 text-white font-semibold text-xs rounded-xl shadow-xs"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Chargement du catalogue...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/database';
import { ProductCard } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';
import { usePi } from '@/components/PiProvider';
import { PRODUCT_CATEGORIES, ProductCategory } from '@/lib/constants';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Tag,
  Store,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user } = usePi();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'tech' | 'mode' | 'services'>('all');

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await fetch('/api/products?includeDemo=true');
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
    loadProducts();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Filter products by active tab
  const filteredProducts = products.filter((p) => {
    if (selectedTab === 'tech') {
      return ['Électronique', 'Téléphones', 'Ordinateurs', 'Jeux'].includes(p.category);
    }
    if (selectedTab === 'mode') {
      return ['Mode', 'Chaussures', 'Accessoires', 'Beauté'].includes(p.category);
    }
    if (selectedTab === 'services') {
      return ['Services'].includes(p.category);
    }
    return true;
  });

  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-purple-800/60">
        {/* Subtle background glow circles */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          {/* Top pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-800/80 border border-purple-700/60 text-amber-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Marketplace Publique Pi Network • SDK v2.0 Ready</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Achetez et Vendez avec <span className="text-amber-400 underline decoration-amber-400/40">Pi</span> en toute simplicité
          </h1>

          {/* Subheading */}
          <p className="text-purple-200/90 text-sm sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            La marketplace moderne conçue pour les pionniers. Découvrez des milliers d&apos;articles physiques et services numériques réglables directement avec vos pièces Pi.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <form
              onSubmit={handleHeroSearch}
              className="relative flex items-center bg-white rounded-2xl p-2 shadow-2xl border border-purple-100"
            >
              <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Que recherchez-vous ? (iPhone, MacBook, Vêtements, Montre...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-purple-900 hover:bg-purple-800 active:scale-95 text-white font-bold text-sm rounded-xl transition shadow-md shrink-0 flex items-center gap-2"
              >
                <span>Rechercher</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick search tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-purple-200">
              <span className="text-purple-300/80">Tendances :</span>
              {['iPhone 15', 'MacBook M3', 'Nike Jordan', 'PS5', 'Montres'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => router.push(`/products?q=${encodeURIComponent(tag)}`)}
                  className="px-2.5 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-100 border border-purple-800/80 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* CTAs & Trust Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-purple-950 font-bold text-sm transition shadow-lg flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explorer le catalogue</span>
            </Link>

            {user?.is_seller ? (
              <Link
                href="/dashboard"
                className="px-6 py-3.5 rounded-xl bg-purple-800/80 hover:bg-purple-800 active:scale-95 text-white border border-purple-700 font-semibold text-sm transition flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span>Mon Espace Vendeur</span>
              </Link>
            ) : (
              <Link
                href="/seller"
                className="px-6 py-3.5 rounded-xl bg-purple-800/80 hover:bg-purple-800 active:scale-95 text-white border border-purple-700 font-semibold text-sm transition flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span>Devenir Vendeur (0.01 π)</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Tag className="w-6 h-6 text-purple-900" />
              <span>Parcourir par Catégorie</span>
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Explorez nos 12 rayons spécialisés pour trouver votre bonheur</p>
          </div>
          <Link
            href="/categories"
            className="text-xs sm:text-sm font-bold text-purple-900 hover:text-purple-700 flex items-center gap-1 transition"
          >
            <span>Voir tout</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
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
      </section>

      {/* 3. FEATURED PRODUCTS & TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-amber-500" />
              <span>Articles Populaires en π</span>
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Produits certifiés avec règlement direct en Pi</p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                selectedTab === 'all'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tous ({products.length})
            </button>
            <button
              onClick={() => setSelectedTab('tech')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                selectedTab === 'tech'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              High-Tech & Jeux
            </button>
            <button
              onClick={() => setSelectedTab('mode')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                selectedTab === 'mode'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mode & Style
            </button>
            <button
              onClick={() => setSelectedTab('services')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                selectedTab === 'services'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Services
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200 animate-pulse space-y-3">
                <div className="w-full aspect-4/3 bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-1/3 pt-2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 space-y-4">
            <div className="w-14 h-14 bg-purple-50 text-purple-900 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Aucun produit dans cet onglet</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Revenez sur l&apos;onglet principal ou découvrez d&apos;autres catégories de notre marketplace.
            </p>
            <button
              onClick={() => setSelectedTab('all')}
              className="px-4 py-2 bg-purple-900 text-white font-semibold text-xs rounded-xl"
            >
              Voir tous les articles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* View all products button */}
        <div className="text-center mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-950 font-bold text-sm border border-purple-200 transition"
          >
            <span>Voir tout le catalogue ({products.length} articles)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Guide Rapide</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Comment fonctionne PiMarket ?
            </h2>
            <p className="text-purple-200 text-xs sm:text-sm mt-2">
              Le commerce Web3 simplifié pour la communauté des pionniers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-purple-950/60 border border-purple-800/80 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-purple-950 font-black text-lg flex items-center justify-center mb-4 shadow-sm">
                1
              </div>
              <h3 className="font-bold text-base text-white mb-2">Connectez votre Pi</h3>
              <p className="text-xs text-purple-200/80 leading-relaxed">
                Accédez à PiMarket depuis votre Pi Browser. L&apos;authentification est instantanée et sécurisée via le protocole officiel Pi SDK v2.0.
              </p>
            </div>

            <div className="bg-purple-950/60 border border-purple-800/80 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-purple-950 font-black text-lg flex items-center justify-center mb-4 shadow-sm">
                2
              </div>
              <h3 className="font-bold text-base text-white mb-2">Choisissez vos articles</h3>
              <p className="text-xs text-purple-200/80 leading-relaxed">
                Naviguez parmi des centaines d&apos;articles neufs et d&apos;occasion proposés par des marchands certifiés avec transparence des prix en π.
              </p>
            </div>

            <div className="bg-purple-950/60 border border-purple-800/80 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-purple-950 font-black text-lg flex items-center justify-center mb-4 shadow-sm">
                3
              </div>
              <h3 className="font-bold text-base text-white mb-2">Réglez et recevez</h3>
              <p className="text-xs text-purple-200/80 leading-relaxed">
                Effectuez le paiement en direct. Le montant est vérifié côté serveur avant finalisation et expédition de votre commande.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SELLER CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-500 text-purple-950 rounded-3xl p-8 sm:p-12 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center lg:text-left">
            <span className="bg-purple-950 text-amber-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Espace Marchands
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Vous avez des articles à vendre ? Acceptez des Pi dès aujourd&apos;hui !
            </h2>
            <p className="text-purple-900 font-medium text-xs sm:text-sm leading-relaxed">
              Enregistrez-vous comme vendeur pour 0.01 π seulement et touchez une communauté mondiale de pionniers prêts à dépenser leurs pièces Pi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/seller"
              className="px-6 py-4 rounded-2xl bg-purple-950 hover:bg-purple-900 active:scale-95 text-white font-bold text-sm shadow-xl transition flex items-center gap-2"
            >
              <Store className="w-5 h-5 text-amber-400" />
              <span>Ouvrir ma boutique Vendeur</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

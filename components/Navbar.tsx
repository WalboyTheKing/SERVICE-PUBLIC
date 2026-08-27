'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePi } from './PiProvider';
import { useCart } from './CartProvider';
import { useFavorites } from './FavoritesProvider';
import { AuthModal } from './AuthModal';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  PlusCircle,
  Menu,
  X,
  LayoutDashboard,
  Package,
  LogOut,
  ChevronDown,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';
import { PRODUCT_CATEGORIES } from '@/lib/constants';

export const Navbar = () => {
  const router = useRouter();
  const { user, loading, logout, isSandbox } = usePi();
  const { totalItemsCount } = useCart();
  const { favoriteIds } = useFavorites();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-purple-950 text-white shadow-md border-b border-purple-900/80">
        {/* Top announcement / sandbox banner */}
        <div className="bg-purple-900/60 border-b border-purple-800/60 text-xs px-4 py-1.5 flex items-center justify-between text-purple-200">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Plateforme officielle Marketplace Pi Network SDK v2.0</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] bg-purple-950/80 px-2 py-0.5 rounded border border-purple-700/50">
                {isSandbox ? 'Mode Sandbox Testnet' : 'Mode Mainnet'}
              </span>
              <Link href="/seller" className="hover:text-amber-300 transition text-[11px] font-medium underline underline-offset-2">
                Frais d&apos;inscription vendeur : 0.01 π
              </Link>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 font-extrabold text-2xl tracking-tight group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-purple-950 flex items-center justify-center font-black text-xl shadow-md transition-transform group-hover:scale-105">
                π
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black tracking-tight leading-none text-xl">
                  PiMarket
                </span>
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                  Marketplace
                </span>
              </div>
            </Link>

            {/* Categories dropdown trigger on desktop */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-900 border border-purple-800 text-xs font-semibold text-purple-100 transition"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Catégories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesDropdownOpen && (
                <div
                  onMouseLeave={() => setCategoriesDropdownOpen(false)}
                  className="absolute left-0 mt-2 w-64 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="p-2 border-b border-gray-100 mb-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rayons du marché</span>
                  </div>
                  <div className="grid grid-cols-1 gap-0.5 max-h-80 overflow-y-auto">
                    <Link
                      href="/products"
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="px-3 py-2 rounded-lg text-xs font-semibold text-purple-900 hover:bg-purple-50 transition flex items-center justify-between"
                    >
                      <span>Tous les produits</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    </Link>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <Link
                        key={cat}
                        href={`/category/${encodeURIComponent(cat)}`}
                        onClick={() => setCategoriesDropdownOpen(false)}
                        className="px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-900 transition flex items-center justify-between"
                      >
                        <span>{cat}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar on Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg relative items-center"
          >
            <input
              type="text"
              placeholder="Rechercher des produits, marques, catégories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-purple-900/40 text-white placeholder-purple-300 text-xs rounded-xl pl-10 pr-24 py-2.5 border border-purple-800 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-purple-900 transition"
            />
            <Search className="w-4 h-4 text-purple-300 absolute left-3.5 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-xs rounded-lg transition"
            >
              Rechercher
            </button>
          </form>

          {/* Right Navigation & User Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Seller CTA */}
            {user?.is_seller ? (
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs transition active:scale-95"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard Vendeur</span>
              </Link>
            ) : (
              <Link
                href="/seller"
                className="hidden sm:flex items-center gap-1.5 bg-purple-800 hover:bg-purple-700 border border-purple-700 text-purple-100 font-semibold px-3.5 py-2 rounded-xl text-xs transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>Vendre en Pi</span>
              </Link>
            )}

            {/* Favorites Icon */}
            <Link
              href="/favorites"
              className="relative p-2.5 rounded-xl bg-purple-900/50 hover:bg-purple-900 text-purple-200 hover:text-white transition"
              aria-label="Favoris"
            >
              <Heart className="w-5 h-5" />
              {favoriteIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {favoriteIds.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl bg-purple-900/50 hover:bg-purple-900 text-purple-200 hover:text-white transition"
              aria-label="Panier"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-purple-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* User Account / Auth */}
            {loading ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/80 border border-purple-800 text-xs font-semibold text-amber-300 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Connexion Pi...</span>
              </div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-purple-900/80 hover:bg-purple-900 border border-purple-800 text-xs font-semibold text-purple-100 transition"
                >
                  <span className="max-w-[90px] truncate">@{user.username}</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-400 text-purple-950 font-bold flex items-center justify-center text-xs">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </button>

                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="p-3 border-b border-gray-100 mb-1">
                      <div className="font-bold text-sm text-gray-900">@{user.username}</div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                        {user.is_seller ? (
                          <span className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                            Vendeur Actif
                          </span>
                        ) : (
                          <span>Membre Pionnier</span>
                        )}
                      </div>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-900 transition"
                    >
                      <User className="w-4 h-4 text-purple-700" />
                      <span>Mon Compte</span>
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-900 transition"
                    >
                      <Package className="w-4 h-4 text-purple-700" />
                      <span>Mes Commandes</span>
                    </Link>

                    <Link
                      href="/favorites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-900 transition"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>Favoris</span>
                    </Link>

                    <Link
                      href="/cart"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-900 transition"
                    >
                      <ShoppingBag className="w-4 h-4 text-amber-600" />
                      <span>Panier</span>
                    </Link>

                    {user.is_seller ? (
                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-900 transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-amber-600" />
                        <span>Espace Vendeur</span>
                      </Link>
                    ) : (
                      <Link
                        href="/seller"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-900 bg-amber-50/60 hover:bg-amber-100 transition"
                      >
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Devenir Vendeur</span>
                      </Link>
                    )}

                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-900 transition"
                    >
                      <Shield className="w-4 h-4 text-indigo-600" />
                      <span>Administration</span>
                    </Link>

                    <div className="pt-1 mt-1 border-t border-gray-100">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Se connecter</span>
              </button>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-purple-900/60 text-white"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-purple-950 border-t border-purple-900 p-4 space-y-4 animate-in slide-in-from-top-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Rechercher des produits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-purple-900 text-white placeholder-purple-300 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-purple-800"
              />
              <Search className="w-4 h-4 text-purple-300 absolute left-3 top-3" />
            </form>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-purple-900/60 rounded-xl text-purple-100 flex items-center gap-2"
              >
                <Package className="w-4 h-4 text-amber-400" />
                <span>Tous les Produits</span>
              </Link>
              <Link
                href="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-purple-900/60 rounded-xl text-purple-100 flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Catégories</span>
              </Link>
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-purple-900/60 rounded-xl text-purple-100 flex items-center gap-2"
              >
                <Package className="w-4 h-4 text-sky-400" />
                <span>Mes Commandes</span>
              </Link>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-purple-900/60 rounded-xl text-purple-100 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-purple-300" />
                <span>Mon Compte</span>
              </Link>
              <Link
                href="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-purple-900/60 rounded-xl text-purple-100 flex items-center gap-2"
              >
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Favoris ({favoriteIds.length})</span>
              </Link>
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-purple-900/60 rounded-xl text-purple-100 flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Panier ({totalItemsCount})</span>
              </Link>
              {user?.is_seller ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="col-span-2 p-3 bg-amber-400 text-purple-950 rounded-xl flex items-center justify-center gap-2 font-bold"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard Vendeur</span>
                </Link>
              ) : (
                <Link
                  href="/seller"
                  onClick={() => setMobileMenuOpen(false)}
                  className="col-span-2 p-3 bg-amber-400 text-purple-950 rounded-xl flex items-center justify-center gap-2 font-bold"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Devenir Vendeur (0.01 π)</span>
                </Link>
              )}
            </div>

            {user && (
              <div className="pt-2 border-t border-purple-900">
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Authentication Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

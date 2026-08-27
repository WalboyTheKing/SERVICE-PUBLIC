'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePi } from '@/components/PiProvider';
import { useCart } from '@/components/CartProvider';
import { useFavorites } from '@/components/FavoritesProvider';
import { ProductCard } from '@/components/ProductCard';
import { Order } from '@/types/database';
import {
  User,
  Package,
  Heart,
  Store,
  Shield,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  LogOut,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export default function AccountPage() {
  const { user, authenticate, logout, isSandbox } = usePi();
  const { favoriteProducts } = useFavorites();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'favorites'>('profile');
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    async function loadUserOrders() {
      if (!user?.id) return;
      try {
        setLoadingOrders(true);
        const res = await fetch(`/api/orders?userId=${user.id}&role=buyer`);
        const data = await res.json();
        if (data.orders) setOrders(data.orders);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadUserOrders();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-purple-50 text-purple-900 rounded-full flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Connexion requise</h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Veuillez vous authentifier avec votre compte Pi Network pour accéder à votre espace personnel.
        </p>
        <button
          onClick={authenticate}
          className="w-full bg-purple-900 text-white font-bold py-3 rounded-xl hover:bg-purple-800 transition text-sm"
        >
          Se connecter avec Pi
        </button>
      </div>
    );
  }

  const totalSpentPi = Math.round(orders.reduce((sum, o) => sum + Number(o.total_amount_pi), 0) * 100) / 100;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-400 text-purple-950 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">@{user.username}</h1>
              {user.is_seller && (
                <span className="bg-amber-400 text-purple-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded-md">
                  Vendeur
                </span>
              )}
            </div>
            <p className="text-xs text-purple-200 font-mono">UID: {user.pi_uid}</p>
            <p className="text-[11px] text-purple-300">
              Membre depuis le {new Date(user.created_at || Date.now()).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user.is_seller ? (
            <Link
              href="/dashboard"
              className="px-4 py-2.5 rounded-xl bg-amber-400 text-purple-950 font-bold text-xs hover:bg-amber-300 transition flex items-center gap-1.5 shadow-xs"
            >
              <Store className="w-4 h-4" />
              <span>Tableau de bord Vendeur</span>
            </Link>
          ) : (
            <Link
              href="/seller"
              className="px-4 py-2.5 rounded-xl bg-purple-800 hover:bg-purple-700 text-white font-semibold text-xs border border-purple-700 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Devenir Vendeur</span>
            </Link>
          )}

          <button
            onClick={logout}
            className="p-2.5 rounded-xl bg-purple-900/80 hover:bg-purple-900 text-rose-300 hover:text-rose-200 border border-purple-800 transition"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block font-medium">Commandes passées</span>
            <span className="text-xl font-black text-gray-900">{orders.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block font-medium">Articles favoris</span>
            <span className="text-xl font-black text-gray-900">{favoriteProducts.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <span className="font-black text-xl">π</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block font-medium">Total dépensé en Pi</span>
            <span className="text-xl font-black text-purple-950">{totalSpentPi} π</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'profile'
              ? 'bg-purple-900 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Informations du Compte
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'orders'
              ? 'bg-purple-900 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Historique des Commandes ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'favorites'
              ? 'bg-purple-900 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Favoris ({favoriteProducts.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-900" />
              <span>Détails & Sécurité Pi Network</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Nom d&apos;utilisateur Pi :</span>
                <span className="font-bold text-gray-900">@{user.username}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Identifiant Unique (UID) :</span>
                <span className="font-mono text-gray-900">{user.pi_uid}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Statut Vendeur :</span>
                <span className="font-bold text-purple-900">
                  {user.is_seller ? 'Vendeur Agréé' : 'Acheteur (Non vendeur)'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Environnement actif :</span>
                <span className="font-bold text-amber-600">
                  {isSandbox ? 'Testnet / Sandbox' : 'Mainnet'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-500" />
              <span>Devenir Vendeur sur PiMarket</span>
            </h3>
            {user.is_seller ? (
              <div className="space-y-3 text-xs text-gray-600">
                <p className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Votre compte marchand est actif et vérifié.
                </p>
                <p>
                  Vous pouvez publier vos articles, gérer vos stocks et consulter vos ventes directement depuis le tableau de bord.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-900 text-white font-bold rounded-xl text-xs hover:bg-purple-800 transition"
                >
                  <span>Accéder au Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-gray-600">
                <p>
                  Transformez vos produits et services en pièces Pi. L&apos;inscription unique coûte seulement <strong>0.01 π</strong>.
                </p>
                <ul className="space-y-1 text-gray-500 list-disc list-inside">
                  <li>Paiements directs en Pi Network</li>
                  <li>Vitrine internationale auprès des Pionniers</li>
                  <li>Validation sécurisée des paiements côté serveur</li>
                </ul>
                <Link
                  href="/seller"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-purple-950 font-bold rounded-xl text-xs hover:bg-amber-300 transition shadow-sm"
                >
                  <span>S&apos;inscrire comme Vendeur (0.01 π)</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-6 text-xs text-gray-500">
              Aucune commande passée.
            </div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="p-4 bg-white rounded-2xl border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-gray-900 text-xs">{o.order_number}</span>
                  <p className="text-xs text-gray-500">{o.product?.title || 'Article'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-purple-950 text-sm">{o.total_amount_pi} π</span>
                  <Link href={`/orders/${o.id}`} className="text-xs text-purple-900 font-bold hover:underline">
                    Voir
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'favorites' && (
        <div>
          {favoriteProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-6 text-xs text-gray-500">
              Aucun favori enregistré.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favoriteProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

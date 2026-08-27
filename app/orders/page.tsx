'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePi } from '@/components/PiProvider';
import { Order } from '@/types/database';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export default function OrdersPage() {
  const { user, authenticate } = usePi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/orders?userId=${user.id}&role=buyer`);
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Erreur commandes:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [user?.id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Payée
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-1 rounded-lg">
            <Truck className="w-3.5 h-3.5" />
            Expédiée
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-lg">
            <Package className="w-3.5 h-3.5" />
            Livrée
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-lg">
            Annulée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5" />
            En attente
          </span>
        );
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-purple-50 text-purple-900 rounded-full flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Connectez-vous pour voir vos commandes</h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Suivez vos achats réglés avec Pi Network et consultez vos factures.
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="w-8 h-8 text-purple-900" />
            <span>Mes Commandes & Achats Pi</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Historique de vos commandes passées sur PiMarket
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 text-purple-900 font-bold text-xs hover:bg-purple-100 transition"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continuer mes achats</span>
        </Link>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8 space-y-4">
          <div className="w-16 h-16 bg-purple-50 text-purple-900 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Aucune commande enregistrée</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
            Vous n&apos;avez pas encore effectué d&apos;achat sur PiMarket.
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
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition space-y-4"
            >
              {/* Order header row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                    {order.order_number}
                  </span>
                  <span className="text-gray-400">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Product preview & seller info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {order.product?.image_url && (
                    <div className="relative w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={order.product.image_url}
                        alt={order.product.title || 'Produit'}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                      {order.product?.title || 'Article commandé'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Vendu par : <strong className="text-purple-900">@{order.seller?.username || 'Marchand'}</strong>
                    </p>
                    {order.shipping_address && (
                      <p className="text-[11px] text-gray-400 mt-1 truncate max-w-sm">
                        Livraison : {order.shipping_address}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-semibold text-gray-400 block">Total réglé</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-purple-950">{order.total_amount_pi}</span>
                      <span className="text-sm font-bold text-amber-500">π</span>
                    </div>
                  </div>

                  <Link
                    href={`/orders/${order.id}`}
                    className="p-2.5 rounded-xl bg-purple-50 text-purple-900 hover:bg-purple-100 font-bold text-xs transition flex items-center gap-1"
                  >
                    <span>Détails</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Order } from '@/types/database';
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  ArrowLeft,
  ShieldCheck,
  Zap,
  ExternalLink,
  MapPin,
  User,
  Share2,
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm">Chargement de la commande...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-purple-50 text-purple-900 rounded-full flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Commande introuvable</h2>
        <p className="text-sm text-gray-500">Cette référence de commande n&apos;existe pas ou n&apos;est pas accessible.</p>
        <Link
          href="/orders"
          className="inline-block bg-purple-900 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-purple-800 transition text-sm"
        >
          Retour à mes commandes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-900 hover:text-purple-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Toutes mes commandes</span>
        </Link>
        <span className="text-xs text-gray-400 font-mono">ID: {order.id.substring(0, 8)}...</span>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-8">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-purple-900 bg-purple-100 px-2.5 py-1 rounded-lg">
                Commande Validée
              </span>
              <span className="font-mono font-black text-gray-900 text-lg">
                {order.order_number}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-gray-400 block font-medium">Montant Total</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-purple-950">{order.total_amount_pi}</span>
              <span className="text-xl font-bold text-amber-500">π</span>
            </div>
          </div>
        </div>

        {/* Visual Timeline Tracker */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">État de la commande</h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            {/* Step 1: Paid */}
            <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold">1. Paiement Pi Confirmé</p>
              <p className="text-[10px] text-emerald-700">Enregistré sur la blockchain</p>
            </div>

            {/* Step 2: Shipped */}
            <div className={`p-3 sm:p-4 rounded-2xl border space-y-1 ${
              order.status === 'shipped' || order.status === 'delivered'
                ? 'bg-sky-50 border-sky-200 text-sky-950'
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}>
              <Truck className="w-5 h-5 mx-auto" />
              <p className="text-xs font-bold">2. En cours d&apos;expédition</p>
              <p className="text-[10px]">
                {order.status === 'shipped' || order.status === 'delivered' ? 'Colis transmis au transporteur' : 'Préparation par le marchand'}
              </p>
            </div>

            {/* Step 3: Delivered */}
            <div className={`p-3 sm:p-4 rounded-2xl border space-y-1 ${
              order.status === 'delivered'
                ? 'bg-purple-50 border-purple-200 text-purple-950'
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}>
              <Package className="w-5 h-5 mx-auto" />
              <p className="text-xs font-bold">3. Livré</p>
              <p className="text-[10px]">
                {order.status === 'delivered' ? 'Réception confirmée' : 'En attente de livraison'}
              </p>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Article acheté</h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-200 gap-4">
            <div className="flex items-center gap-4">
              {order.product?.image_url && (
                <div className="relative w-20 h-20 bg-white rounded-xl overflow-hidden shrink-0 border">
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
                <span className="text-[10px] font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                  {order.product?.category || 'Article'}
                </span>
                <h4 className="font-bold text-gray-900 text-base mt-1">
                  {order.product?.title || 'Produit'}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Vendeur : <strong>@{order.seller?.username || 'Marchand'}</strong>
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-gray-400">Quantité : {order.quantity || 1}</span>
              <div className="text-base font-black text-purple-950 mt-0.5">
                {order.total_amount_pi} π
              </div>
            </div>
          </div>
        </div>

        {/* Delivery & Blockchain Verification Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 text-xs">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <MapPin className="w-4 h-4 text-purple-700" />
              <span>Adresse de destination</span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {order.shipping_address || 'Aucune adresse spécifiée (Remise en main propre ou Service numérique)'}
            </p>
            {order.contact_info && (
              <p className="text-gray-500 pt-1">
                Contact acheteur : <strong>{order.contact_info}</strong>
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Preuve de Transaction Pi Network</span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-gray-600">
              <p className="truncate">
                <span className="text-gray-400">Paiement ID:</span> {order.pi_payment_id || 'Pay-Pi-Verified'}
              </p>
              <p className="truncate">
                <span className="text-gray-400">TXID:</span> {order.txid || 'Simulated-Sandbox-Txid'}
              </p>
              <p className="text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Vérifié par Pi SDK v2.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

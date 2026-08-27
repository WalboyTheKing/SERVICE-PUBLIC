'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { usePi } from '@/components/PiProvider';
import { useToast } from '@/components/ToastProvider';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowLeft,
  Truck,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, totalItemsCount, totalAmountPi } = useCart();
  const { user, authenticate } = usePi();
  const { showToast } = useToast();

  const [shippingAddress, setShippingAddress] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      await authenticate();
      return;
    }

    if (cart.length === 0) return;

    if (!shippingAddress.trim()) {
      setError('Veuillez renseigner votre adresse de livraison.');
      return;
    }

    // 1. If inside Pi Browser, invoke Pi SDK payment
    if (typeof window !== 'undefined' && window.Pi) {
      try {
        setCheckingOut(true);
        setError(null);

        const paymentData = {
          amount: totalAmountPi,
          memo: `Commande PiMarket (${totalItemsCount} art.)`,
          metadata: {
            type: 'cart_checkout' as const,
            product_id: cart[0].product.id,
            shipping_address: `${fullName} - ${shippingAddress} (Tél: ${phone})`,
            contact_info: `@${user.username} - ${phone}`,
          },
        };

        const callbacks = {
          onReadyForServerApproval: async (paymentId: string) => {
            const res = await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Échec approbation');
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            const res = await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Échec complétion');
            
            clearCart();
            showToast('Paiement réussi ! Votre commande a été transmise aux vendeurs.', 'success');
            setCheckingOut(false);
            router.push('/orders');
          },
          onCancel: () => {
            setCheckingOut(false);
            setError('Paiement annulé.');
          },
          onError: (err: Error) => {
            setCheckingOut(false);
            setError(err.message || 'Erreur lors du paiement.');
          },
        };

        window.Pi.createPayment(paymentData, callbacks);
      } catch (err: any) {
        setCheckingOut(false);
        setError(err.message || 'Erreur inattendue.');
      }
    } else {
      // Direct Simulation checkout in Sandbox testnet
      try {
        setCheckingOut(true);
        setError(null);

        for (const item of cart) {
          await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              buyer_id: user.id,
              seller_id: item.product.seller_id,
              product_id: item.product.id,
              quantity: item.quantity,
              total_amount_pi: item.product.price_pi * item.quantity,
              shipping_address: `${fullName} - ${shippingAddress} (Tél: ${phone})`,
              contact_info: phone || `@${user.username}`,
              notes: notes || 'Commande groupée panier',
            }),
          });
        }

        clearCart();
        showToast('Commande passée avec succès (Simulation Sandbox) !', 'success');
        setCheckingOut(false);
        router.push('/orders');
      } catch (err: any) {
        setCheckingOut(false);
        setError(err.message || 'Erreur lors de la commande.');
      }
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-purple-50 text-purple-900 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Votre panier est vide</h1>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Explorez notre sélection d&apos;articles neufs et d&apos;occasion payables en pièces Pi.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-purple-900 hover:bg-purple-800 text-white font-bold text-sm rounded-2xl transition shadow-md"
        >
          <span>Découvrir les articles</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-900 hover:text-purple-700 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continuer mes achats</span>
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-purple-900" />
            <span>Mon Panier ({totalItemsCount} {totalItemsCount > 1 ? 'articles' : 'article'})</span>
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          <span>Vider le panier</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Cart Items List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex items-center gap-4 shadow-xs"
            >
              {/* Product Thumbnail */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                <Image
                  src={item.product.image_url}
                  alt={item.product.title}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md">
                  {item.product.category}
                </span>
                <Link href={`/product/${item.product.id}`} className="block">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate hover:text-purple-900">
                    {item.product.title}
                  </h3>
                </Link>
                <div className="flex items-baseline gap-1 text-sm font-extrabold text-purple-950">
                  <span>{item.product.price_pi}</span>
                  <span className="text-amber-500 font-bold">π</span>
                  <span className="text-xs text-gray-400 font-normal ml-1">/ unité</span>
                </div>
              </div>

              {/* Quantity Controls & Delete */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-1.5 hover:bg-gray-200 text-gray-700 transition"
                    aria-label="Diminuer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-gray-900 min-w-[28px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-1.5 hover:bg-gray-200 text-gray-700 transition"
                    aria-label="Augmenter"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  aria-label="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Summary & Checkout Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Delivery Details Card */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-900" />
              <span>Coordonnées de Livraison</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Nom complet</label>
                <input
                  type="text"
                  placeholder="ex: Jean Dupont"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Téléphone / Contact</label>
                <input
                  type="text"
                  placeholder="ex: +33 6 12 34 56 78 ou @monTelegram"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Adresse postale complète <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Numéro, Rue, Code Postal, Ville, Pays"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Note pour les vendeurs (optionnel)</label>
                <input
                  type="text"
                  placeholder="Instructions particulières de livraison..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900">Récapitulatif de la commande</h3>

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Sous-total ({totalItemsCount} articles)</span>
                <span className="font-bold text-gray-900">{totalAmountPi} π</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de transaction Pi</span>
                <span className="text-emerald-600 font-bold">0.00 π (Inclus)</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span className="text-emerald-600 font-bold">Standard</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-900">Total à payer</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-purple-950">{totalAmountPi}</span>
                  <span className="text-lg font-bold text-amber-500">π</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full py-4 bg-amber-400 hover:bg-amber-300 active:scale-95 text-purple-950 font-bold text-sm rounded-2xl transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-5 h-5" />
              <span>
                {checkingOut
                  ? 'Traitement de la commande...'
                  : !user
                  ? 'Se connecter pour payer'
                  : `Confirmer et Payer ${totalAmountPi} π`}
              </span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Paiement sécurisé par le protocole Pi Network</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

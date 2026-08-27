'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { usePi } from '@/components/PiProvider';
import { useCart } from '@/components/CartProvider';
import { useFavorites } from '@/components/FavoritesProvider';
import { useToast } from '@/components/ToastProvider';
import { Product } from '@/types/database';
import { ProductCard } from '@/components/ProductCard';
import {
  Heart,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Share2,
  Check,
  ArrowLeft,
  User,
  Truck,
  MessageSquare,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, authenticate, isPiBrowser } = usePi();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [shippingAddress, setShippingAddress] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [sellerMessage, setSellerMessage] = useState('');

  const productId = params?.id as string;

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (data.product) {
          setProduct(data.product);

          // Fetch similar products in same category
          const simRes = await fetch(`/api/products?category=${encodeURIComponent(data.product.category)}&includeDemo=true`);
          const simData = await simRes.json();
          if (simData.products) {
            setSimilarProducts(simData.products.filter((p: Product) => p.id !== productId).slice(0, 4));
          }
        }
      } catch (err) {
        console.warn('Erreur chargement produit:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  const imagesList = product ? (product.images && product.images.length > 0 ? product.images : [product.image_url]) : [];

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      try {
        if (navigator.share) {
          await navigator.share({
            title: product?.title || 'Produit PiMarket',
            text: `Regarde cet article sur PiMarket : ${product?.title} (${product?.price_pi} π)`,
            url: window.location.href,
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          showToast('Lien du produit copié dans le presse-papier !', 'success');
        }
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleBuyProduct = async () => {
    if (!user) {
      await authenticate();
      return;
    }

    if (!product) return;

    // If inside Pi Browser, use native Pi SDK
    if (typeof window !== 'undefined' && window.Pi) {
      try {
        setPurchasing(true);
        setError(null);
        setStatusMessage('Initialisation de la transaction Pi Network...');

        console.log(`[PI PAYMENT] createPayment initiated for product_purchase (${product.price_pi} π, id=${product.id})`);

        const paymentData = {
          amount: product.price_pi,
          memo: `Achat PiMarket: ${product.title.substring(0, 20)}`,
          metadata: {
            type: 'product_purchase' as const,
            username: user.username,
            product_id: product.id,
            shipping_address: shippingAddress || 'Non spécifiée',
            contact_info: contactInfo || `@${user.username}`,
          },
        };

        const callbacks = {
          onReadyForServerApproval: async (paymentId: string) => {
            console.log('[PI PAYMENT] onReadyForServerApproval received paymentId:', paymentId);
            setStatusMessage('Vérification et approbation serveur...');
            const res = await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
              console.error('[PI PAYMENT] Product buy approval error:', data.error);
              throw new Error(data.error || 'Échec de l\'approbation serveur');
            }
            console.log('[PI PAYMENT] Server approval confirmed for paymentId:', paymentId);
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log('[PI PAYMENT] onReadyForServerCompletion received. paymentId:', paymentId, 'txid:', txid);
            setStatusMessage('Enregistrement et complétion de la commande...');
            const res = await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
              console.error('[PI PAYMENT] Product buy completion error:', data.error);
              throw new Error(data.error || 'Échec de la complétion serveur');
            }
            console.log('[PI PAYMENT] final status: COMPLETED for single product purchase');
            setStatusMessage('Paiement Pi confirmé avec succès !');
            showToast('Votre commande a été enregistrée avec succès !', 'success');
            setPurchasing(false);
            if (data.orderId) {
              router.push(`/orders/${data.orderId}`);
            } else {
              router.push('/orders');
            }
          },
          onCancel: (paymentId?: string) => {
            console.log('[PI PAYMENT] Product payment cancelled by user:', paymentId);
            setPurchasing(false);
            setStatusMessage(null);
            setError('Transaction Pi annulée par l\'utilisateur.');
          },
          onError: (err: Error) => {
            console.error('[PI PAYMENT] Product payment error callback:', err);
            setPurchasing(false);
            setStatusMessage(null);
            setError(err.message || 'Erreur lors du règlement Pi.');
          },
        };

        window.Pi.createPayment(paymentData, callbacks);
      } catch (err: any) {
        console.error('[PI PAYMENT] Unexpected product buy error:', err);
        setPurchasing(false);
        setStatusMessage(null);
        setError(err.message || 'Erreur inattendue.');
      }
    } else {
      // Sandbox Browser Direct Checkout Simulation
      try {
        setPurchasing(true);
        setError(null);
        setStatusMessage('Simulation de paiement Sandbox Testnet...');

        const orderRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyer_id: user.id,
            seller_id: product.seller_id,
            product_id: product.id,
            quantity: 1,
            total_amount_pi: product.price_pi,
            shipping_address: shippingAddress || 'Adresse enregistrée sur le compte',
            contact_info: contactInfo || `@${user.username}`,
            notes: 'Paiement simulé Sandbox Testnet',
          }),
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.error || 'Échec création de commande');

        showToast('Commande créée avec succès (Simulation Sandbox) !', 'success');
        setPurchasing(false);
        if (orderData.order?.id) {
          router.push(`/orders/${orderData.order.id}`);
        } else {
          router.push('/orders');
        }
      } catch (err: any) {
        setPurchasing(false);
        setStatusMessage(null);
        setError(err.message || 'Erreur de commande');
      }
    }
  };

  const handleSendSellerMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerMessage.trim()) return;
    showToast(`Message envoyé au vendeur @${product?.seller?.username || 'Marchand'} !`, 'success');
    setSellerMessage('');
    setContactModalOpen(false);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm">Chargement des détails du produit...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-purple-50 text-purple-900 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Produit introuvable</h2>
        <p className="text-sm text-gray-500">L&apos;article demandé n&apos;existe pas ou a été retiré de la vente.</p>
        <Link
          href="/products"
          className="inline-block bg-purple-900 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-purple-800 transition text-sm"
        >
          Retourner au catalogue
        </Link>
      </div>
    );
  }

  const isFav = isFavorite(product.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Top Breadcrumbs & Back */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 font-semibold text-purple-900 hover:text-purple-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au catalogue</span>
        </Link>
        <div className="flex items-center gap-2">
          <span>Rayon :</span>
          <Link
            href={`/category/${encodeURIComponent(product.category)}`}
            className="font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md hover:bg-purple-100 transition"
          >
            {product.category}
          </Link>
        </div>
      </div>

      {/* Main Product Layout */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-6 p-6 sm:p-8 bg-gray-50/50 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-200">
          <div className="space-y-4">
            {/* Main Active Image */}
            <div className="relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
              <Image
                src={imagesList[selectedImageIndex] || product.image_url}
                alt={product.title}
                fill
                priority
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 bg-purple-950/90 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs">
                {product.category}
              </span>
              {product.is_demo && (
                <span className="absolute top-3 right-3 bg-amber-400 text-purple-950 text-xs font-black px-2.5 py-1 rounded-lg shadow-xs">
                  Article Démo
                </span>
              )}
            </div>

            {/* Thumbnail list */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      selectedImageIndex === idx ? 'border-purple-900 ring-2 ring-purple-600' : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Aperçu ${idx}`} fill className="object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick share & report links */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200/80 text-xs text-gray-500 mt-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-purple-900 font-semibold transition"
            >
              <Share2 className="w-4 h-4 text-purple-700" />
              <span>Partager l&apos;article</span>
            </button>
            <button
              onClick={() => setContactModalOpen(true)}
              className="flex items-center gap-1.5 hover:text-purple-900 font-semibold transition"
            >
              <MessageSquare className="w-4 h-4 text-purple-700" />
              <span>Poser une question</span>
            </button>
          </div>
        </div>

        {/* Right Column: Details & Purchase Actions (6 cols) */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <User className="w-4 h-4 text-purple-700" />
                  <span>Vendeur :</span>
                  <span className="text-purple-950 font-bold">@{product.seller?.username || 'Marchand_Pi'}</span>
                  <span title="Marchand vérifié">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </span>
                </div>

                <button
                  onClick={() => toggleFavorite(product)}
                  className={`p-2 rounded-xl transition ${
                    isFav ? 'bg-rose-50 text-rose-500' : 'bg-gray-100 text-gray-500 hover:text-rose-500'
                  }`}
                  aria-label="Favoris"
                >
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-purple-950">
                    {product.price_pi}
                  </span>
                  <span className="text-2xl font-bold text-amber-500">π</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">Paiement net en Pi Network</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Description détaillée</h3>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Stock & Delivery summary */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-700" />
                <div>
                  <span className="font-bold text-purple-950 block">Livraison</span>
                  <span className="text-purple-700">Partout dans le monde</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-700" />
                <div>
                  <span className="font-bold text-purple-950 block">Disponibilité</span>
                  <span className="text-purple-700">En stock ({product.stock || 1} ex.)</span>
                </div>
              </div>
            </div>

            {/* Optional Shipping input */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-gray-700 block">
                Adresse de livraison (optionnelle pour les services)
              </label>
              <input
                type="text"
                placeholder="ex: 12 Rue de la Paix, 75002 Paris, France"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-xs rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            {statusMessage && (
              <div className="p-3.5 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl text-xs flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => addToCart(product, 1)}
                className="py-3.5 px-4 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-950 font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Ajouter au panier</span>
              </button>

              <button
                onClick={handleBuyProduct}
                disabled={purchasing}
                className="py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-purple-950 font-bold text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-purple-950" />
                <span>
                  {purchasing
                    ? 'Transaction...'
                    : !user
                    ? 'Se connecter pour payer'
                    : `Acheter maintenant (${product.price_pi} π)`}
                </span>
              </button>
            </div>

            <p className="text-center text-[11px] text-gray-400">
              Transactions approuvées et sécurisées par le serveur PiMarket via Pi SDK v2.0
            </p>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-black text-gray-900">Articles similaires dans ce rayon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map((simProd) => (
              <ProductCard key={simProd.id} product={simProd} />
            ))}
          </div>
        </section>
      )}

      {/* Contact Seller Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="text-lg font-bold text-gray-900">
              Contacter @{product.seller?.username || 'Marchand'}
            </h3>
            <p className="text-xs text-gray-500">
              Posez vos questions sur l&apos;état du produit, les délais d&apos;expédition ou les modalités de livraison.
            </p>
            <form onSubmit={handleSendSellerMessage} className="space-y-3">
              <textarea
                rows={4}
                required
                placeholder="Votre message au vendeur..."
                value={sellerMessage}
                onChange={(e) => setSellerMessage(e.target.value)}
                className="w-full p-3 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setContactModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-900 text-white hover:bg-purple-800"
                >
                  Envoyer le message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { usePi } from '@/components/PiProvider';
import { useToast } from '@/components/ToastProvider';
import { Product, Order } from '@/types/database';
import { PI_PRICING, PRODUCT_CATEGORIES } from '@/lib/constants';
import {
  Store,
  Plus,
  Package,
  TrendingUp,
  Truck,
  CheckCircle2,
  Clock,
  Zap,
  DollarSign,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Eye,
  Trash2,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: userLoading, authenticate, isSandbox } = usePi();
  const router = useRouter();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [salesOrders, setSalesOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'sales'>('products');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricePi, setPricePi] = useState('');
  const [category, setCategory] = useState<string>(PRODUCT_CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState('1');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      // 1. Load Seller's Products
      const prodRes = await fetch(`/api/products?sellerId=${user.id}`);
      const prodData = await prodRes.json();
      if (prodData.products) setProducts(prodData.products);

      // 2. Load Seller's Received Orders
      const orderRes = await fetch(`/api/orders?userId=${user.id}&role=seller`);
      const orderData = await orderRes.json();
      if (orderData.orders) setSalesOrders(orderData.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du téléversement');
      setImageUrl(data.url);
      showToast('Image téléversée avec succès !', 'success');
    } catch (err: any) {
      setError(err.message || 'Erreur téléversement');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Échec mise à jour statut');
      showToast(`Statut de la commande mis à jour (${newStatus}) !`, 'success');
      loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Erreur statut', 'error');
    }
  };

  const handlePublishProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsedPrice = parseFloat(pricePi);
    if (!title || !description || isNaN(parsedPrice) || parsedPrice <= 0 || !imageUrl) {
      setError('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    const parsedStock = parseInt(stock) || 1;

    // Inside Native Pi Browser
    if (typeof window !== 'undefined' && window.Pi) {
      try {
        setSubmitting(true);
        setError(null);
        setStatusMessage('Préparation du paiement des frais de publication (0.001 π)...');

        const productPayload = {
          title,
          description,
          price_pi: parsedPrice,
          category,
          image_url: imageUrl,
          stock: parsedStock,
        };

        const paymentData = {
          amount: PI_PRICING.PRODUCT_PUBLICATION,
          memo: `Publication: ${title.substring(0, 20)}`,
          metadata: {
            type: 'product_publication' as const,
            product_data: productPayload,
          },
        };

        const callbacks = {
          onReadyForServerApproval: async (paymentId: string) => {
            setStatusMessage('Approbation serveur...');
            const res = await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Échec approbation');
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            setStatusMessage('Enregistrement du produit...');
            const res = await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Échec complétion');

            showToast('Produit publié avec succès sur PiMarket !', 'success');
            setShowAddModal(false);
            setTitle('');
            setDescription('');
            setPricePi('');
            setImageUrl('');
            setSubmitting(false);
            setStatusMessage(null);
            loadDashboardData();
          },
          onCancel: () => {
            setSubmitting(false);
            setStatusMessage(null);
            setError('Publication annulée.');
          },
          onError: (err: Error) => {
            setSubmitting(false);
            setStatusMessage(null);
            setError(err.message || 'Erreur lors du paiement.');
          },
        };

        window.Pi.createPayment(paymentData, callbacks);
      } catch (err: any) {
        setSubmitting(false);
        setStatusMessage(null);
        setError(err.message || 'Erreur inattendue.');
      }
    } else {
      // Sandbox / Testnet direct creation simulation
      try {
        setSubmitting(true);
        setError(null);
        setStatusMessage('Publication en mode Testnet / Sandbox...');

        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            price_pi: parsedPrice,
            category,
            image_url: imageUrl,
            stock: parsedStock,
            seller_id: user.id,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Échec publication');

        showToast('Article publié avec succès (Simulation Sandbox) !', 'success');
        setShowAddModal(false);
        setTitle('');
        setDescription('');
        setPricePi('');
        setImageUrl('');
        setSubmitting(false);
        setStatusMessage(null);
        loadDashboardData();
      } catch (err: any) {
        setSubmitting(false);
        setStatusMessage(null);
        setError(err.message || 'Erreur de publication.');
      }
    }
  };

  if (userLoading) {
    return <div className="text-center py-16 text-gray-400 text-sm">Chargement de votre compte...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-purple-50 text-purple-900 rounded-full flex items-center justify-center mx-auto">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Espace Vendeur</h2>
        <p className="text-xs sm:text-sm text-gray-500">Veuillez vous connecter pour gérer vos ventes et produits.</p>
        <button
          onClick={authenticate}
          className="w-full bg-purple-900 text-white font-bold py-3 rounded-xl hover:bg-purple-800 transition text-sm"
        >
          Se connecter avec Pi
        </button>
      </div>
    );
  }

  if (!user.is_seller) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Accès Restreint</h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Vous devez activer votre compte vendeur (0.01 π) pour accéder au tableau de bord des marchands.
        </p>
        <Link
          href="/seller"
          className="block w-full bg-amber-400 text-purple-950 font-bold py-3 rounded-xl hover:bg-amber-300 transition text-sm shadow-xs"
        >
          Devenir Vendeur sur PiMarket
        </Link>
      </div>
    );
  }

  const totalRevenuePi = Math.round(
    salesOrders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total_amount_pi), 0) * 100
  ) / 100;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Store className="w-8 h-8 text-purple-900" />
              <span>Tableau de Bord Marchand</span>
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg">
              Marchand Certifié
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Gérez votre catalogue, suivez vos commandes et encaissez vos ventes en Pi
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs transition shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publier un Produit</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block font-medium">Articles en vente</span>
            <span className="text-xl font-black text-gray-900">{products.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block font-medium">Commandes reçues</span>
            <span className="text-xl font-black text-gray-900">{salesOrders.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <span className="font-black text-xl">π</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block font-medium">Chiffre d&apos;affaires Pi</span>
            <span className="text-xl font-black text-purple-950">{totalRevenuePi} π</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'products' ? 'bg-purple-900 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Mes Articles ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'sales' ? 'bg-purple-900 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Ventes & Expéditions ({salesOrders.length})
        </button>
      </div>

      {/* Tab Content: Products */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {loading ? (
            <p className="text-xs text-gray-400">Chargement...</p>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 p-8 space-y-4">
              <Package className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="font-bold text-gray-900 text-base">Vous n&apos;avez aucun article actif</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Commencez à vendre vos biens et services aux membres de la communauté Pi Network.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-purple-900 text-white font-bold text-xs rounded-xl"
              >
                + Publier un article ({PI_PRICING.PRODUCT_PUBLICATION} π)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div className="relative w-full aspect-4/3 bg-gray-100">
                    <Image
                      src={p.image_url}
                      alt={p.title}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2 left-2 bg-purple-950/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {p.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{p.title}</h3>
                    <p className="text-gray-500 text-xs line-clamp-2">{p.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="text-sm font-black text-purple-950">
                        {p.price_pi} <span className="text-amber-500">π</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {p.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
                    <Link
                      href={`/product/${p.id}`}
                      className="text-purple-900 font-bold hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Voir</span>
                    </Link>
                    <span className="text-gray-400 text-[11px]">Stock: {p.stock || 1}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Sales Orders */}
      {activeTab === 'sales' && (
        <div className="space-y-4">
          {salesOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 text-xs text-gray-500">
              Aucune commande reçue pour le moment.
            </div>
          ) : (
            salesOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                      {order.order_number}
                    </span>
                    <span className="text-gray-400">
                      Acheteur: <strong>@{order.buyer?.username || 'Pionnier'}</strong>
                    </span>
                  </div>
                  <div className="font-black text-purple-950 text-sm">
                    {order.total_amount_pi} π
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-gray-900">{order.product?.title || 'Article'}</h4>
                    <p className="text-gray-500 mt-0.5">Adresse : {order.shipping_address || 'Non spécifiée'}</p>
                    {order.contact_info && (
                      <p className="text-gray-400 text-[11px]">Contact : {order.contact_info}</p>
                    )}
                  </div>

                  {/* Actions to update fulfillment status */}
                  <div className="flex items-center gap-2">
                    {order.status === 'paid' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                        className="px-3 py-1.5 rounded-lg bg-sky-100 text-sky-800 font-bold hover:bg-sky-200 transition"
                      >
                        Marquer Expédiée
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold hover:bg-emerald-200 transition"
                      >
                        Marquer Livrée
                      </button>
                    )}
                    <span className="font-semibold text-gray-500 capitalize">
                      Statut: {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-gray-900">Publier un Nouveau Produit</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError(null);
                  setStatusMessage(null);
                }}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Titre du produit <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: Montre connectée Pi Explorer v1"
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Catégorie <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden bg-white"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Prix en Pi (π) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    required
                    value={pricePi}
                    onChange={(e) => setPricePi(e.target.value)}
                    placeholder="ex: 15.5"
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Description détaillée <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="État du produit, garantie, spécifications techniques..."
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Image du produit <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-900 hover:file:bg-purple-100"
                  />
                  {uploadingImage && <span className="text-xs text-purple-700 animate-pulse">Téléversement...</span>}
                </div>

                {imageUrl && (
                  <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border">
                    <Image src={imageUrl} alt="Aperçu" fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}

                {!imageUrl && (
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Ou collez une URL d'image directe (https://...)"
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs mt-2 focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                )}
              </div>

              <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-xs text-purple-900 flex justify-between items-center">
                <span>Frais de publication Pi Network :</span>
                <span className="font-bold">{PI_PRICING.PRODUCT_PUBLICATION} π</span>
              </div>

              {statusMessage && (
                <div className="p-3 bg-purple-50 text-purple-900 rounded-xl text-xs flex items-center gap-2 animate-pulse">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-3 text-xs font-semibold border rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="w-1/2 py-3 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-purple-950 rounded-xl transition disabled:opacity-50"
                >
                  {submitting ? 'Publication...' : 'Payer & Publier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

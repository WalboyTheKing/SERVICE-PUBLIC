'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { usePi } from '@/components/PiProvider';
import { useToast } from '@/components/ToastProvider';
import { PI_PRICING, PRODUCT_CATEGORIES } from '@/lib/constants';
import { ArrowLeft, Store, Zap, Sparkles, Upload } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const { user, authenticate } = usePi();
  const { showToast } = useToast();

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

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      await authenticate();
      return;
    }

    const parsedPrice = parseFloat(pricePi);
    if (!title || !description || isNaN(parsedPrice) || parsedPrice <= 0 || !imageUrl) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const parsedStock = parseInt(stock) || 1;

    if (typeof window !== 'undefined' && window.Pi) {
      try {
        setSubmitting(true);
        setError(null);
        setStatusMessage('Initialisation du paiement des frais de publication (0.001 π)...');

        const productPayload = {
          title,
          description,
          price_pi: parsedPrice,
          category,
          image_url: imageUrl,
          stock: parsedStock,
        };

        console.log(`[PI PAYMENT] createPayment initiated for product_publication (${PI_PRICING.PRODUCT_PUBLICATION} π)`);

        const paymentData = {
          amount: PI_PRICING.PRODUCT_PUBLICATION,
          memo: `Publication: ${title.substring(0, 20)}`,
          metadata: {
            type: 'product_publication' as const,
            username: user.username,
            product_data: productPayload,
          },
        };

        const callbacks = {
          onReadyForServerApproval: async (paymentId: string) => {
            console.log('[PI PAYMENT] onReadyForServerApproval received paymentId:', paymentId);
            setStatusMessage('Approbation serveur...');
            const res = await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
              console.error('[PI PAYMENT] Publish approval error:', data.error);
              throw new Error(data.error || 'Échec approbation');
            }
            console.log('[PI PAYMENT] Server approval confirmed for paymentId:', paymentId);
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log('[PI PAYMENT] onReadyForServerCompletion received. paymentId:', paymentId, 'txid:', txid);
            setStatusMessage('Enregistrement du produit...');
            const res = await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
              console.error('[PI PAYMENT] Publish completion error:', data.error);
              throw new Error(data.error || 'Échec complétion');
            }

            console.log('[PI PAYMENT] final status: COMPLETED for product publication');
            showToast('Produit publié avec succès !', 'success');
            router.push('/dashboard');
          },
          onCancel: (paymentId?: string) => {
            console.log('[PI PAYMENT] Publication payment cancelled by user:', paymentId);
            setSubmitting(false);
            setStatusMessage(null);
            setError('Publication annulée par l\'utilisateur.');
          },
          onError: (err: Error) => {
            console.error('[PI PAYMENT] Publication payment error callback:', err);
            setSubmitting(false);
            setStatusMessage(null);
            setError(err.message || 'Erreur paiement.');
          },
        };

        window.Pi.createPayment(paymentData, callbacks);
      } catch (err: any) {
        console.error('[PI PAYMENT] Unexpected publish payment error:', err);
        setSubmitting(false);
        setStatusMessage(null);
        setError(err.message || 'Erreur inattendue.');
      }
    } else {
      // Sandbox mode simulation
      try {
        setSubmitting(true);
        setError(null);
        setStatusMessage('Publication en mode Simulation Testnet...');

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
        router.push('/dashboard');
      } catch (err: any) {
        setSubmitting(false);
        setStatusMessage(null);
        setError(err.message || 'Erreur publication.');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-900 hover:text-purple-700 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Retour au Tableau de bord</span>
      </Link>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-purple-900" />
            <span>Publier un Nouvel Article</span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Remplissez les détails pour mettre votre produit en vente sur PiMarket
          </p>
        </div>

        <form onSubmit={handlePublish} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
              Titre du produit <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Apple iPad Air M2 128Go Gris Sidéral"
              className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                placeholder="ex: 45.0"
                className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
              Description complète <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails du produit, état (neuf/occasion), garanties, conditions de livraison..."
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
              <div className="mt-3 relative w-28 h-28 rounded-2xl overflow-hidden border">
                <Image src={imageUrl} alt="Aperçu" fill className="object-cover" referrerPolicy="no-referrer" />
              </div>
            )}

            {!imageUrl && (
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Ou collez directement une URL d'image web (https://...)"
                className="w-full border border-gray-300 rounded-xl p-3 text-xs mt-2 focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
              />
            )}
          </div>

          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-xs text-purple-900 flex justify-between items-center">
            <div>
              <p className="font-bold">Frais de publication Pi Network</p>
              <p className="text-[11px] text-purple-700">Sécurisé et validé par le SDK Pi v2.0</p>
            </div>
            <span className="text-base font-black">{PI_PRICING.PRODUCT_PUBLICATION} π</span>
          </div>

          {statusMessage && (
            <div className="p-3.5 bg-purple-50 text-purple-900 rounded-xl text-xs flex items-center gap-2 animate-pulse">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="w-full py-4 text-sm font-black bg-amber-400 hover:bg-amber-300 text-purple-950 rounded-2xl transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              <span>{submitting ? 'Publication en cours...' : `Payer & Publier (${PI_PRICING.PRODUCT_PUBLICATION} π)`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

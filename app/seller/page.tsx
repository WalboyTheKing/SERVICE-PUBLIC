'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePi } from '@/components/PiProvider';
import { PI_PRICING } from '@/lib/constants';
import { Store, ShieldCheck, Zap, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function SellerPage() {
  const { user, loading, authenticate, refetchUser, isSandbox } = usePi();
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const router = useRouter();

  const handleBecomeSeller = async () => {
    if (!user) {
      await authenticate();
      return;
    }

    if (typeof window !== 'undefined' && window.Pi) {
      try {
        setProcessing(true);
        setError(null);
        setStatusMessage('Initialisation du paiement Pi Network (0.01 π)...');

        console.log('[PI PAYMENT] createPayment initiated for seller_registration (0.01 π)');

        const paymentData = {
          amount: PI_PRICING.SELLER_REGISTRATION,
          memo: 'Inscription Vendeur - PiMarket',
          metadata: {
            type: 'seller_registration' as const,
            username: user.username,
          },
        };

        const callbacks = {
          onReadyForServerApproval: async (paymentId: string) => {
            console.log('[PI PAYMENT] onReadyForServerApproval received paymentId:', paymentId);
            setStatusMessage('Approbation du paiement par le serveur...');
            const res = await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
              console.error('[PI PAYMENT] Approval error:', data.error);
              throw new Error(data.error || 'Échec de l\'approbation serveur');
            }
            console.log('[PI PAYMENT] Server approval confirmed for paymentId:', paymentId);
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log('[PI PAYMENT] onReadyForServerCompletion received. paymentId:', paymentId, 'txid:', txid);
            setStatusMessage('Validation finale de la transaction blockchain...');
            const res = await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
              console.error('[PI PAYMENT] Completion error:', data.error);
              throw new Error(data.error || 'Échec de la complétion serveur');
            }
            console.log('[PI PAYMENT] final status: COMPLETED for seller registration');
            setStatusMessage('Félicitations ! Vous êtes désormais vendeur officiel.');
            showToast('Statut vendeur activé avec succès !', 'success');
            await refetchUser();
            setTimeout(() => {
              router.push('/dashboard');
            }, 1200);
          },
          onCancel: (paymentId?: string) => {
            console.log('[PI PAYMENT] Payment cancelled by user:', paymentId);
            setProcessing(false);
            setStatusMessage(null);
            setError('Paiement annulé par l\'utilisateur.');
          },
          onError: (err: Error) => {
            console.error('[PI PAYMENT] Payment error callback:', err);
            setProcessing(false);
            setStatusMessage(null);
            setError(err.message || 'Une erreur est survenue lors du paiement.');
          },
        };

        window.Pi.createPayment(paymentData, callbacks);
      } catch (err: any) {
        console.error('[PI PAYMENT] Unexpected createPayment error:', err);
        setProcessing(false);
        setStatusMessage(null);
        setError(err.message || 'Erreur inattendue lors du paiement.');
      }
    } else {
      // Standard browser simulation for dev/sandbox preview
      try {
        setProcessing(true);
        setError(null);
        setStatusMessage('Activation du compte vendeur (Mode Simulation Testnet)...');

        const res = await fetch('/api/pi/authenticate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.pi_uid,
            username: user.username,
            makeSeller: true,
          }),
        });

        if (!res.ok) throw new Error('Échec activation vendeur.');

        showToast('Compte vendeur activé en mode Testnet !', 'success');
        await refetchUser();
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (err: any) {
        setProcessing(false);
        setStatusMessage(null);
        setError(err.message || 'Erreur lors de l\'activation.');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center text-gray-500 text-sm">
        Chargement de vos informations...
      </div>
    );
  }

  if (user?.is_seller) {
    return (
      <div className="max-w-lg mx-auto my-12 bg-white rounded-3xl p-8 border border-gray-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-gray-900">Compte Marchand Actif</h1>
        <p className="text-gray-600 text-xs sm:text-sm">
          Vous êtes déjà enregistré comme vendeur certifié sur PiMarket.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full bg-purple-900 text-white font-bold py-3.5 rounded-2xl hover:bg-purple-800 transition text-sm shadow-sm flex items-center justify-center gap-2"
        >
          <span>Accéder au Tableau de Bord</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-6 space-y-6">
      <div className="bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-amber-400 text-purple-950 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Programme Marchand Pi</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
          Devenez Vendeur sur PiMarket
        </h1>
        <p className="text-purple-200 text-xs sm:text-sm leading-relaxed">
          Publiez vos produits, vendez à la communauté mondiale des pionniers et recevez vos paiements directs en pièces Pi.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">Vos avantages exclusifs</h2>
          <ul className="space-y-2.5 text-xs text-gray-600">
            <li className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-900 flex items-center justify-center font-bold text-xs">✓</span>
              <span>Publication illimitée d&apos;articles physiques et services numériques</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-900 flex items-center justify-center font-bold text-xs">✓</span>
              <span>Transactions directes et sécurisées via le Pi SDK v2.0</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-900 flex items-center justify-center font-bold text-xs">✓</span>
              <span>Tableau de bord de gestion des commandes et statistiques des ventes</span>
            </li>
          </ul>
        </div>

        <div className="bg-purple-50/70 rounded-2xl p-4 border border-purple-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-purple-700 font-bold uppercase tracking-wider">Frais d&apos;inscription unique</p>
            <p className="text-2xl font-black text-purple-950">
              {PI_PRICING.SELLER_REGISTRATION} <span className="text-amber-500 font-bold">π</span>
            </p>
          </div>
          <span className="text-xs bg-white text-purple-900 px-3 py-1.5 rounded-xl border border-purple-200 font-bold shadow-2xs">
            Accès Illimité à Vie
          </span>
        </div>

        {statusMessage && (
          <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl text-xs flex items-center gap-2 animate-pulse">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
            {error}
          </div>
        )}

        <button
          onClick={handleBecomeSeller}
          disabled={processing}
          className="w-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-purple-950 font-black py-4 rounded-2xl transition disabled:opacity-50 text-center text-sm shadow-md flex items-center justify-center gap-2"
        >
          <Store className="w-5 h-5" />
          <span>
            {processing
              ? 'Transaction en cours...'
              : !user
              ? 'Se connecter pour continuer'
              : `Activer mon statut Vendeur (${PI_PRICING.SELLER_REGISTRATION} π)`}
          </span>
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePi } from '@/components/PiProvider';
import {
  ShieldCheck,
  Users,
  Package,
  DollarSign,
  Layers,
  ArrowLeft,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';

export default function AdminPage() {
  const { user, isSandbox } = usePi();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-900 hover:text-purple-700 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à l&apos;accueil</span>
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-purple-900" />
            <span>Administration PiMarket</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Supervision de la marketplace, des transactions et de la base de données
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 text-purple-900 font-bold text-xs hover:bg-purple-100 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser les données</span>
        </button>
      </div>

      {/* Network & Config Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Réseau Pi</span>
            <span className="text-sm font-black text-purple-950">
              {isSandbox ? 'Sandbox / Testnet' : 'Pi Mainnet'}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Statut Backend Supabase</span>
            <span className="text-sm font-bold text-emerald-700">
              {stats?.configured ? 'Connecté & Opérationnel' : 'Mode Démo & Mock'}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">SDK Pi API</span>
            <span className="text-sm font-bold text-gray-900">
              v2.0 Client & Server
            </span>
          </div>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase">Pionniers Inscrits</span>
            <Users className="w-5 h-5 text-purple-900" />
          </div>
          <p className="text-3xl font-black text-gray-900">
            {stats?.usersCount ?? 0}
          </p>
          <p className="text-[11px] text-gray-400">
            dont <strong>{stats?.sellersCount ?? 0}</strong> vendeurs certifiés
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase">Articles en vente</span>
            <Package className="w-5 h-5 text-purple-900" />
          </div>
          <p className="text-3xl font-black text-gray-900">
            {stats?.productsCount ?? 0}
          </p>
          <p className="text-[11px] text-gray-400">
            dont <strong>{stats?.demoProductsCount ?? 0}</strong> articles de démonstration
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase">Commandes Passées</span>
            <Layers className="w-5 h-5 text-purple-900" />
          </div>
          <p className="text-3xl font-black text-gray-900">
            {stats?.ordersCount ?? 0}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">
            Transactions enregistrées
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase">Volume Total Pi</span>
            <span className="font-bold text-amber-500 text-lg">π</span>
          </div>
          <p className="text-3xl font-black text-purple-950">
            {stats?.totalVolumePi ?? 0} π
          </p>
          <p className="text-[11px] text-gray-400">
            Volume transigé sur PiMarket
          </p>
        </div>
      </div>

      {/* Technical Architecture Notes */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-gray-900">Sécurité & Architecture des Paiements</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          PiMarket applique une architecture stricte <strong>Server-Side Verification</strong>. Aucun paiement n&apos;est validé sans vérification cryptographique auprès des serveurs de la Pi Core Team via les routes <code>/api/pi/approve</code> et <code>/api/pi/complete</code>. Les clés secrètes d&apos;administration restent hermétiquement isolées dans les variables d&apos;environnement backend.
        </p>
      </div>
    </div>
  );
}

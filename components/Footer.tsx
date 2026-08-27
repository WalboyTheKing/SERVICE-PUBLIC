'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap, Lock, HeartHandshake, Phone, MessageCircle, UserCheck } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '@/lib/constants';

export const Footer = () => {
  return (
    <footer className="bg-purple-950 text-gray-300 border-t border-purple-900 mt-20">
      {/* Top trust badges section */}
      <div className="border-b border-purple-900/70 bg-purple-900/30 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-800 text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Paiements Pi SDK v2.0</h4>
              <p className="text-purple-200/70 text-xs mt-0.5">Transactions sécurisées sans intermédiaires</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-800 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Vendeurs Vérifiés</h4>
              <p className="text-purple-200/70 text-xs mt-0.5">Validation et traçabilité sur la blockchain Pi</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-800 text-sky-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Sécurité Backend</h4>
              <p className="text-purple-200/70 text-xs mt-0.5">Approbation et validation stricte côté serveur</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-800 text-pink-400 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Marketplace Ouverte</h4>
              <p className="text-purple-200/70 text-xs mt-0.5">Pour les pionniers et marchands du monde entier</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Col 1: Brand & Owner info */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold text-2xl tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-purple-950 flex items-center justify-center font-black text-lg">
              π
            </div>
            <span className="text-white font-black">PiMarket</span>
          </Link>
          <p className="text-purple-200/80 text-xs leading-relaxed max-w-sm">
            La marketplace décentralisée moderne construite pour l&apos;écosystème Pi Network. Achetez, vendez et échangez des biens réels et services numériques en toute confiance avec vos pièces Pi.
          </p>

          {/* Propriétaire du site et Contact */}
          <div className="p-3.5 bg-purple-900/50 rounded-2xl border border-purple-800 space-y-2 max-w-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Propriétaire : KPASSENON Jonas</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 text-xs text-purple-200 pt-1">
              <a
                href="tel:0164848148"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-800/80 hover:bg-purple-700 text-white font-semibold transition"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Appel : 01 64 84 81 48</span>
              </a>
              <a
                href="https://wa.me/2290164848148"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white font-semibold transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-white" />
                <span>WhatsApp : 01 64 84 81 48</span>
              </a>
            </div>
          </div>

          <div className="pt-1 text-xs text-purple-300">
            <p>Conforme aux directives Pi Apps Platform v2.0</p>
          </div>
        </div>

        {/* Col 2: Marketplace */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Marketplace</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/products" className="hover:text-white transition">Tous les articles</Link></li>
            <li><Link href="/categories" className="hover:text-white transition">Toutes les catégories</Link></li>
            <li><Link href="/cart" className="hover:text-white transition">Mon Panier</Link></li>
            <li><Link href="/favorites" className="hover:text-white transition">Mes Favoris</Link></li>
            <li><Link href="/orders" className="hover:text-white transition">Suivi de commande</Link></li>
          </ul>
        </div>

        {/* Col 3: Vendre */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Espace Marchand</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/seller" className="hover:text-white transition">Devenir Vendeur (0.01 π)</Link></li>
            <li><Link href="/dashboard" className="hover:text-white transition">Tableau de bord Vendeur</Link></li>
            <li><Link href="/seller/products/new" className="hover:text-white transition">Publier un produit</Link></li>
            <li><Link href="/seller" className="hover:text-white transition">Guide du marchand Pi</Link></li>
          </ul>
        </div>

        {/* Col 4: Top Categories */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Top Rayons</h4>
          <ul className="space-y-2 text-xs">
            {PRODUCT_CATEGORIES.slice(0, 5).map((cat) => (
              <li key={cat}>
                <Link href={`/category/${encodeURIComponent(cat)}`} className="hover:text-white transition">
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Disclaimer */}
      <div className="border-t border-purple-900/60 py-6 px-4 text-center text-xs text-purple-300/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} PiMarket. Tous droits réservés. Développé pour la communauté Pi Network.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/terms" className="hover:text-white transition">Conditions d&apos;utilisation</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-white transition">Confidentialité</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-white transition">Administration</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};


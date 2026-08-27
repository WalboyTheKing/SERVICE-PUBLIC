'use client';

import Link from 'next/link';
import { usePi } from './PiProvider';

export const Navbar = () => {
  const { user, loading, authenticate } = usePi();

  return (
    <nav className="bg-purple-900 text-white shadow-md border-b border-purple-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="bg-amber-400 text-purple-950 px-2 py-0.5 rounded text-sm font-black">π</span>
          <span>PiMarket</span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/">Produits</Link>
          {user?.is_seller ? (
            <Link href="/dashboard" className="bg-purple-800 px-3 py-1.5 rounded-lg">Dashboard</Link>
          ) : (
            <Link href="/seller" className="bg-amber-400 text-purple-950 font-semibold px-3 py-1.5 rounded-lg">Devenir Vendeur</Link>
          )}
          {loading ? (
            <div className="h-8 w-20 bg-purple-800 animate-pulse rounded-md" />
          ) : user ? (
            <span className="font-mono text-xs bg-purple-950 px-3 py-1.5 rounded-full border border-purple-700">@{user.username}</span>
          ) : (
            <button onClick={authenticate} className="bg-purple-700 px-3 py-1.5 rounded-lg text-xs">Connexion</button>
          )}
        </div>
      </div>
    </nav>
  );
};
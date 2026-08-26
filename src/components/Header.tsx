import React from "react";
import { UserAccount } from "../types";
import {
  Store,
  ShoppingBag,
  Package,
  ShieldAlert,
  LogOut,
  RefreshCw,
  Crown,
  ShieldCheck,
  Zap,
  Sparkles
} from "lucide-react";

interface HeaderProps {
  currentUser: UserAccount | null;
  currentTab: 'market' | 'seller' | 'orders' | 'admin';
  onChangeTab: (tab: 'market' | 'seller' | 'orders' | 'admin') => void;
  pendingOrdersCount?: number;
  onLogout: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
  isPiBrowser: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentTab,
  onChangeTab,
  pendingOrdersCount = 0,
  onLogout,
  onRefresh,
  isLoading = false,
  isPiBrowser,
}) => {
  return (
    <header className="bg-gradient-to-r from-[#2c0c45] via-[#4d1f7d] to-[#25083d] text-white shadow-xl sticky top-0 z-40 border-b border-purple-900/50">
      {/* Top Banner indicating Pi Browser Status */}
      <div className="bg-purple-950/90 text-purple-200 text-[11px] py-1 px-4 border-b border-purple-800/40">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isPiBrowser ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <span>
              {isPiBrowser ? "⚡ Connecté via Pi Browser (Pi SDK actif • Mainnet)" : "ℹ️ Pi Browser recommandé pour les transactions Mainnet"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Frais vendeur : 0.0001 π • Publication : 0.00001 π</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onChangeTab('market')}
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-purple-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-400/20 border-2 border-amber-300 transform -rotate-1">
              π
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                  PI MARKET
                </span>
                <span className="text-[10px] font-bold bg-amber-400 text-purple-950 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Place de marché
                </span>
              </div>
              <p className="text-[11px] text-purple-200/90 font-medium">
                Achetez et vendez des produits & services en Pi
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        {currentUser && (
          <div className="flex items-center bg-purple-950/70 p-1 rounded-2xl border border-purple-400/20 text-xs font-semibold overflow-x-auto max-w-full">
            <button
              id="tab-market-btn"
              onClick={() => onChangeTab('market')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                currentTab === 'market'
                  ? 'bg-amber-400 text-purple-950 font-black shadow-xs'
                  : 'text-purple-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Marché Public</span>
            </button>

            <button
              id="tab-seller-btn"
              onClick={() => onChangeTab('seller')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 relative cursor-pointer shrink-0 ${
                currentTab === 'seller'
                  ? 'bg-amber-400 text-purple-950 font-black shadow-xs'
                  : 'text-purple-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Espace Vendeur</span>
              {currentUser.is_seller ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              ) : (
                <span className="text-[9px] bg-amber-500/30 text-amber-300 px-1.5 rounded">0.0001π</span>
              )}
            </button>

            <button
              id="tab-orders-btn"
              onClick={() => onChangeTab('orders')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 relative cursor-pointer shrink-0 ${
                currentTab === 'orders'
                  ? 'bg-amber-400 text-purple-950 font-black shadow-xs'
                  : 'text-purple-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Mes Commandes</span>
              {pendingOrdersCount > 0 && (
                <span className="w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            {currentUser.role === "ADMIN" && (
              <button
                id="tab-admin-btn"
                onClick={() => onChangeTab('admin')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  currentTab === 'admin'
                    ? 'bg-rose-500 text-white font-black shadow-xs'
                    : 'text-rose-300 hover:text-white hover:bg-rose-500/20'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}
          </div>
        )}

        {/* User Status pill */}
        {currentUser && (
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-2xl text-xs shrink-0">
            <div className="w-7 h-7 rounded-xl bg-purple-400/30 flex items-center justify-center text-amber-300 font-bold border border-amber-400/40">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <div className="font-bold text-white leading-tight flex items-center gap-1">
                @{currentUser.username}
                {currentUser.is_seller && (
                  <span title="Vendeur Certifié">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </span>
                )}
                {currentUser.role === "ADMIN" && (
                  <span className="text-[9px] font-black bg-rose-500/80 text-white px-1 rounded">ADMIN</span>
                )}
              </div>
              <div className="text-[10px]">
                {currentUser.is_seller ? (
                  <span className="text-emerald-300">✓ Vendeur Activé</span>
                ) : (
                  <span className="text-purple-200">Acheteur</span>
                )}
              </div>
            </div>

            <div className="h-5 w-px bg-white/15 mx-1" />

            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Rafraîchir"
              className="p-1 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={onLogout}
              title="Déconnexion"
              className="p-1 text-purple-200 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

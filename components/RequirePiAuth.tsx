'use client';

import React, { useState } from 'react';
import { usePi } from './PiProvider';
import {
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  Zap,
  Lock,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';

export const RequirePiAuth = ({ children }: { children: React.ReactNode }) => {
  const {
    user,
    authStatus,
    loading,
    error,
    authenticate,
    simulateSandboxLogin,
    isPiBrowser,
    isSandbox,
  } = usePi();

  const [customUsername, setCustomUsername] = useState('');
  const [asSeller, setAsSeller] = useState(false);

  // 1. Loading / Authenticating state
  if (authStatus === 'initializing' || authStatus === 'authenticating') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 flex flex-col items-center justify-center p-4 text-white select-none">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Glowing Animated Pi Badge */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-amber-400/20 blur-xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 text-purple-950 flex items-center justify-center font-black text-5xl shadow-2xl border-2 border-amber-200/50">
              π
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Connexion à Pi Network...
            </h1>
            <p className="text-purple-200 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
              Authentification sécurisée avec le SDK Pi v2.0 et synchronisation de votre profil Pionnier.
            </p>
          </div>

          {/* Progress bar & indicator */}
          <div className="bg-purple-900/60 border border-purple-700/50 rounded-2xl p-5 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-center gap-2.5 text-xs font-semibold text-amber-300">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Vérification de la session en cours</span>
            </div>
            <div className="w-full bg-purple-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-amber-300 h-full w-2/3 rounded-full animate-pulse" />
            </div>
            <p className="text-[11px] text-purple-300">
              Si une fenêtre d&apos;autorisation Pi Browser s&apos;ouvre, veuillez accepter pour accéder au marché.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated / Error state - The Mandatory Pi Auth Gate Screen
  if (authStatus === 'unauthenticated' || authStatus === 'error' || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-purple-950">
        {/* Top Minimal Branding Header */}
        <header className="border-b border-purple-900/40 bg-purple-950/40 backdrop-blur-md py-4 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-purple-950 flex items-center justify-center font-black text-lg shadow-sm">
                π
              </div>
              <div>
                <span className="text-white font-black text-lg tracking-tight block leading-none">
                  PiMarket
                </span>
                <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest">
                  Marketplace Publique Pi
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-purple-200 bg-purple-900/60 border border-purple-800/80 px-2.5 py-1 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Pi SDK v2.0</span>
              </span>
            </div>
          </div>
        </header>

        {/* Central Auth Gate Content */}
        <main className="max-w-4xl mx-auto px-4 py-10 sm:py-16 w-full flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Context & Guarantees */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/60 border border-purple-700/60 text-amber-300 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Accès Restreint & Sécurisé</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  Connexion Pi Network requise
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Bienvenue sur <strong>PiMarket</strong>. Pour consulter les catalogues, passer commande et effectuer des transactions directes en Pi (π), vous devez vous authentifier avec votre compte Pi officiel.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-purple-950/50 border border-purple-900/50">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Paiements Natifs en Pi (π)</h3>
                    <p className="text-[11px] text-slate-400">Achetez et vendez sans conversion ni carte bancaire, directement depuis votre wallet Pi.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-purple-950/50 border border-purple-900/50">
                  <div className="w-8 h-8 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Sécurité Cryptographique</h3>
                    <p className="text-[11px] text-slate-400">Votre identité est vérifiée auprès de la Pi Core Team sans mot de passe à retenir.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Login Box */}
            <div className="lg:col-span-6">
              <div className="bg-slate-900/90 border border-purple-800/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

                {error && (
                  <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Primary Button: Pi SDK Auth */}
                <div className="space-y-3">
                  <button
                    onClick={() => authenticate()}
                    disabled={loading}
                    className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-black text-sm transition-all shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2.5 group"
                  >
                    <Smartphone className="w-5 h-5 text-purple-950" />
                    <span>{loading ? 'Connexion en cours...' : 'Se connecter avec Pi'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <p className="text-[11px] text-slate-400 text-center">
                    Utilise l&apos;API officielle <code>Pi.authenticate()</code>
                  </p>
                </div>

                {/* Testnet & Sandbox Quick Access */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      Mode Sandbox / Testnet
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Simulateur SDK</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => simulateSandboxLogin('Pioneer_Alex', false)}
                      className="p-3 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-800 text-left transition flex flex-col gap-1 group"
                    >
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-purple-400" />
                        @Pioneer_Alex
                      </span>
                      <span className="text-[10px] text-slate-400">Compte Acheteur</span>
                    </button>

                    <button
                      onClick={() => simulateSandboxLogin('PiMerchant_Pro', true)}
                      className="p-3 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-800 text-left transition flex flex-col gap-1 group"
                    >
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        @PiMerchant_Pro
                      </span>
                      <span className="text-[10px] text-slate-400">Compte Vendeur</span>
                    </button>
                  </div>

                  {/* Custom Test Username */}
                  <div className="pt-2 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Autre pseudonyme Pi..."
                        value={customUsername}
                        onChange={(e) => setCustomUsername(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                      />
                      <button
                        onClick={() =>
                          simulateSandboxLogin(customUsername.trim() || 'Pioneer_Custom', asSeller)
                        }
                        disabled={!customUsername.trim()}
                        className="px-3.5 py-2 bg-purple-800 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition"
                      >
                        Entrer
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="as-seller-check"
                        checked={asSeller}
                        onChange={(e) => setAsSeller(e.target.checked)}
                        className="rounded text-amber-400 focus:ring-amber-400 bg-slate-950 border-slate-700"
                      />
                      <label htmlFor="as-seller-check" className="text-[11px] text-slate-400 cursor-pointer">
                        Activer le statut vendeur pour ce compte test
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-purple-950/60 py-6 px-4 text-center text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} PiMarket • Application certifiée pour l&apos;écosystème Pi Network</p>
        </footer>
      </div>
    );
  }

  // 3. Authenticated state: render the protected application
  return <>{children}</>;
};

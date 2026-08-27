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
  RefreshCw,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Terminal,
} from 'lucide-react';

export const RequirePiAuth = ({ children }: { children: React.ReactNode }) => {
  const {
    user,
    authStatus,
    loading,
    error,
    diagnostics,
    authenticate,
    simulateSandboxLogin,
    isPiBrowser,
    isSandbox,
  } = usePi();

  const [customUsername, setCustomUsername] = useState('');
  const [asSeller, setAsSeller] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(true);

  // 1. Authenticated state: directly render the marketplace
  if (authStatus === 'AUTHENTICATED' && user) {
    return <>{children}</>;
  }

  // Diagnostic box helper component
  const DiagnosticBox = () => (
    <div className="mt-6 border border-purple-800/60 bg-slate-950/80 rounded-2xl p-4 text-xs font-mono text-slate-300 space-y-2.5 shadow-inner">
      <div className="flex items-center justify-between border-b border-purple-900/60 pb-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Terminal className="w-4 h-4" />
          <span>Diagnostic Pi SDK (Temps Réel)</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-800">
          {isSandbox ? 'Mode Sandbox' : 'Mode Production / Mainnet'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        {/* Pi SDK detection */}
        <div className="flex items-center justify-between bg-purple-950/40 p-2 rounded-lg border border-purple-900/30">
          <span className="text-slate-400">Pi SDK :</span>
          {diagnostics.sdkDetected ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Détecté
            </span>
          ) : authStatus === 'SDK_LOADING' ? (
            <span className="text-amber-300 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> Chargement...
            </span>
          ) : (
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Non détecté
            </span>
          )}
        </div>

        {/* Pi Browser detection */}
        <div className="flex items-center justify-between bg-purple-950/40 p-2 rounded-lg border border-purple-900/30">
          <span className="text-slate-400">Pi Browser :</span>
          {diagnostics.isPiBrowser ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Détecté
            </span>
          ) : (
            <span className="text-slate-400 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Navigateur standard
            </span>
          )}
        </div>

        {/* Init status */}
        <div className="flex items-center justify-between bg-purple-950/40 p-2 rounded-lg border border-purple-900/30">
          <span className="text-slate-400">Initialisation :</span>
          {diagnostics.initStatus === 'OK' ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> OK (v2.0)
            </span>
          ) : diagnostics.initStatus === 'ERROR' ? (
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Erreur
            </span>
          ) : (
            <span className="text-amber-300 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> En attente
            </span>
          )}
        </div>

        {/* Auth status */}
        <div className="flex items-center justify-between bg-purple-950/40 p-2 rounded-lg border border-purple-900/30">
          <span className="text-slate-400">Authentification :</span>
          {diagnostics.authStatus === 'SUCCESS' ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Réussie
            </span>
          ) : diagnostics.authStatus === 'IN_PROGRESS' ? (
            <span className="text-amber-300 font-bold flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> En cours...
            </span>
          ) : diagnostics.authStatus === 'FAILED' ? (
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Échouée
            </span>
          ) : (
            <span className="text-slate-400">Non démarrée</span>
          )}
        </div>

        {/* User state */}
        <div className="col-span-1 sm:col-span-2 flex items-center justify-between bg-purple-950/40 p-2 rounded-lg border border-purple-900/30">
          <span className="text-slate-400">Utilisateur :</span>
          <span className="font-bold text-white">
            {diagnostics.username ? `@${diagnostics.username}` : 'Aucun'}
          </span>
        </div>
      </div>

      {diagnostics.errorMessage && (
        <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-900 text-rose-300 text-[11px]">
          <strong>Erreur :</strong> {diagnostics.errorMessage}
        </div>
      )}
    </div>
  );

  // 2. Loading / Initializing screen (during SDK load or active Pi.authenticate popup)
  if (authStatus === 'SDK_LOADING' || authStatus === 'AUTHENTICATING') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 flex flex-col items-center justify-center p-4 text-white select-none">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          {/* Animated Pi Badge */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-amber-400/20 blur-xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 text-purple-950 flex items-center justify-center font-black text-5xl shadow-2xl border-2 border-amber-200/50">
              π
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {authStatus === 'AUTHENTICATING' ? 'Autorisation Pi en cours...' : 'Connexion à Pi Network...'}
            </h1>
            <p className="text-purple-200 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
              {authStatus === 'AUTHENTICATING'
                ? 'Veuillez accepter la demande d\'autorisation sur votre écran dans Pi Browser pour continuer.'
                : 'Détection du SDK Pi v2.0 et vérification sécurisée de votre session.'}
            </p>
          </div>

          {/* Progress bar & indicator */}
          <div className="bg-purple-900/60 border border-purple-700/50 rounded-2xl p-4 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-300">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>
                {authStatus === 'AUTHENTICATING' ? 'En attente de votre confirmation Pi...' : 'Initialisation du Pi SDK'}
              </span>
            </div>
            <div className="w-full bg-purple-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-amber-300 h-full w-2/3 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Interactive Diagnostic Box */}
          <DiagnosticBox />
        </div>
      </div>
    );
  }

  // 3. Unauthenticated / Error / SDK_UNAVAILABLE state - Mandatory Pi Auth Gate
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-purple-950">
      {/* Top Header */}
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-10 sm:py-14 w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Information */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/60 border border-purple-700/60 text-amber-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Authentification Pi Requise</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {authStatus === 'SDK_UNAVAILABLE'
                  ? "Pi Network n'est pas disponible"
                  : 'Connectez votre compte Pi Network'}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {authStatus === 'SDK_UNAVAILABLE'
                  ? "Cette application requiert le SDK Pi Network. Veuillez ouvrir l'adresse du site directement dans l'application officielle Pi Browser sur votre téléphone."
                  : 'Bienvenue sur PiMarket. Authentifiez-vous en un clic avec votre compte Pi pour consulter les catalogues et effectuer vos achats en toute sécurité.'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-purple-950/50 border border-purple-900/50">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Paiements Directs en Pi (π)</h3>
                  <p className="text-[11px] text-slate-400">Achetez et vendez facilement sans intermédiaire bancaire.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-purple-950/50 border border-purple-900/50">
                <div className="w-8 h-8 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Authentification Sécurisée</h3>
                  <p className="text-[11px] text-slate-400">Connexion cryptographique via l&apos;API officielle Pi Network.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interaction & Diagnostics */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900/90 border border-purple-800/50 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">Statut de la tentative :</p>
                    <p className="text-[11px] opacity-90">{error}</p>
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              <div className="space-y-2.5">
                <button
                  onClick={() => authenticate()}
                  disabled={loading}
                  className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-black text-sm transition-all shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2.5 group"
                >
                  <Smartphone className="w-5 h-5 text-purple-950" />
                  <span>
                    {authStatus === 'AUTH_FAILED' || authStatus === 'SDK_UNAVAILABLE'
                      ? 'Réessayer la connexion Pi'
                      : 'Se connecter avec Pi'}
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Appelle <code>Pi.authenticate([&apos;username&apos;, &apos;payments&apos;])</code>
                </p>
              </div>

              {/* Sandbox / Testnet Quick Login */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Mode Testnet &amp; Sandbox
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Test unitaire</span>
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

                {/* Custom Sandbox Username */}
                <div className="pt-2 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Autre pseudonyme test..."
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
                      Tester
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
                      Activer le statut vendeur pour ce profil
                    </label>
                  </div>
                </div>
              </div>

              {/* Real-time Diagnostic box */}
              <DiagnosticBox />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-950/60 py-6 px-4 text-center text-slate-500 text-xs">
        <p>© {new Date().getFullYear()} PiMarket • Conforme aux standards Pi Network SDK v2.0</p>
      </footer>
    </div>
  );
};

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, Smartphone, Store, Info, HelpCircle, ExternalLink, UserCheck, Terminal } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
  onGuestLogin?: () => void;
  onOpenPiTest?: () => void;
  isLoading: boolean;
  isPiBrowser: boolean;
  error?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onGuestLogin,
  onOpenPiTest,
  isLoading,
  isPiBrowser,
  error,
}) => {
  const [showPortalHelp, setShowPortalHelp] = useState(false);

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-purple-100 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

        {/* Brand Icon */}
        <div className="relative z-10 mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#3a1558] to-[#5c2d91] text-amber-400 font-black text-4xl flex items-center justify-center shadow-xl shadow-purple-900/20 border-2 border-amber-300/60 mb-6 transform -rotate-3">
          π
        </div>

        <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <Store className="w-3.5 h-3.5 text-amber-500" />
          <span>Marché Décentralisé Pi Network</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">
          Pi Market
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto mb-6 leading-relaxed">
          La marketplace globale dédiée aux Pionniers : achetez des biens du quotidien, commandez des services locaux et vendez avec vos Pi.
        </p>

        {/* Pi Browser Warning / Badge */}
        <div className={`p-4 rounded-2xl mb-6 text-xs text-left border ${
          isPiBrowser 
            ? "bg-emerald-50 text-emerald-900 border-emerald-200"
            : "bg-amber-50 text-amber-950 border-amber-200"
        }`}>
          {isPiBrowser ? (
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-black text-emerald-950 flex items-center gap-1.5 flex-wrap">
                  <span>✓ Pi Browser</span>
                  <span>•</span>
                  <span>✓ Pi SDK injecté</span>
                  <span>•</span>
                  <span className="text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded font-black">Sandbox (Testnet)</span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                  Environnement Pi Browser détecté. L'application communique directement avec le SDK Pi officiel.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5">
              <Smartphone className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-black text-amber-950">
                  Pi Browser recommandé
                </div>
                <p className="text-[11px] text-amber-900 mt-1 leading-relaxed">
                  Pour payer ou encaisser en Pi réels, ouvrez l'adresse dans <strong>Pi Browser</strong>. Vous pouvez aussi explorer en mode Invité ci-dessous.
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl mb-4 text-left leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 text-rose-900 mb-1">
              <Info className="w-4 h-4 text-rose-700 shrink-0" />
              <span>Information sur l'autorisation Pi Network</span>
            </div>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setShowPortalHelp(!showPortalHelp)}
              className="mt-2 text-[11px] font-bold text-purple-800 underline flex items-center gap-1 hover:text-purple-950 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Pourquoi la popup d'autorisation ne s'affiche pas ?</span>
            </button>
          </div>
        )}

        {/* Developer Portal Explanation Box */}
        {showPortalHelp && (
          <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-xl text-left text-xs text-purple-950 mb-4 space-y-2 leading-relaxed">
            <div className="font-black flex items-center gap-1.5 text-purple-900">
              <span>Configuration Developer Portal Pi (develop.pi) :</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-purple-900">
              <li>Dans Pi Browser, tapez <strong>develop.pi</strong> dans la barre d'adresse.</li>
              <li>Ouvrez ou créez votre application.</li>
              <li>Dans le champ <strong>App URL</strong>, collez l'URL de votre application.</li>
              <li>Lancez l'application depuis le portail pour autoriser le domaine.</li>
            </ol>
          </div>
        )}

        {/* Connect Button */}
        <button
          id="btn-login-pi"
          onClick={onLogin}
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-2xl bg-[#5c2d91] hover:bg-[#472272] text-white font-black text-sm shadow-xl shadow-purple-950/20 flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
              <span>Authentification Pi SDK en cours...</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-lg bg-amber-400 text-purple-950 font-black text-sm flex items-center justify-center">
                π
              </div>
              <span>Se connecter avec Pi Network</span>
              <ArrowRight className="w-4 h-4 text-amber-300 ml-auto" />
            </>
          )}
        </button>

        {/* Guest explorer button */}
        {onGuestLogin && (
          <button
            type="button"
            id="btn-guest-mode"
            onClick={onGuestLogin}
            disabled={isLoading}
            className="w-full mt-3 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-slate-500" />
            <span>Continuer en tant que Pionnier Invité (Mode Découverte)</span>
          </button>
        )}

        {/* Diagnostic / pi-test standalone tool */}
        {onOpenPiTest && (
          <button
            type="button"
            id="btn-pi-test"
            onClick={onOpenPiTest}
            className="w-full mt-2 py-2.5 px-3 rounded-xl border border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50 text-purple-900 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-purple-600" />
            <span>Mode Diagnostic Pi SDK (/pi-test autonome)</span>
          </button>
        )}

        {/* Economic model summary */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-3 text-left">
          <div className="flex items-start gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Consultation & Commandes 100% gratuites</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Accès vendeur à vie : 0.0001 π</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Mise en ligne anti-spam : 0.00001 π</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Contact direct WhatsApp & Télégram</span>
          </div>
        </div>
      </div>
    </div>
  );
};

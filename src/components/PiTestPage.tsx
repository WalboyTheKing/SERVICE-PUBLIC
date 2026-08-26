import React, { useState, useEffect } from "react";
import { ArrowLeft, ShieldCheck, UserCheck, AlertCircle, RefreshCw, Terminal, CheckCircle2 } from "lucide-react";

export function PiTestPage({ onBackToMarket }: { onBackToMarket?: () => void }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authUser, setAuthUser] = useState<{ uid: string; username: string; accessToken: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPiAvailable, setIsPiAvailable] = useState<boolean>(false);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  useEffect(() => {
    addLog("=== Page /pi-test autonome chargée ===");
    addLog(`URL actuelle: ${window.location.href}`);
    addLog(`User-Agent: ${navigator.userAgent}`);
    
    const available = typeof window !== "undefined" && typeof (window as any).Pi !== "undefined";
    setIsPiAvailable(available);
    addLog(`window.Pi détecté immédiatement: ${available ? "OUI ✅" : "NON ❌"}`);

    if (available) {
      initDirectSdk();
    } else {
      addLog("Attente passive de l'injection de window.Pi par Pi Browser...");
      let checks = 0;
      const interval = setInterval(() => {
        checks++;
        if (typeof (window as any).Pi !== "undefined") {
          clearInterval(interval);
          setIsPiAvailable(true);
          addLog(`window.Pi est apparu après ${checks * 200}ms ✅`);
          initDirectSdk();
        } else if (checks > 25) {
          clearInterval(interval);
          addLog("Délai d'attente dépassé (5s) : window.Pi est toujours absent.");
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  const initDirectSdk = () => {
    try {
      setIsInitializing(true);
      addLog("Appel de window.Pi.init({ version: '2.0', sandbox: true })...");
      (window as any).Pi.init({ version: "2.0", sandbox: true });
      addLog("Pi.init() exécuté avec succès ✅ (Sandbox: true)");
    } catch (e: any) {
      addLog(`Pi.init() erreur / note: ${e?.message || e}`);
    } finally {
      setIsInitializing(false);
    }
  };

  const [selectedScope, setSelectedScope] = useState<"username" | "both">("username");

  const handleTestAuthenticate = async (scopeChoice?: "username" | "both") => {
    const scopeToUse = scopeChoice || selectedScope;
    const scopes = scopeToUse === "username" ? ["username"] : ["username", "payments"];

    setError(null);
    setAuthUser(null);
    setIsAuthenticating(true);
    
    addLog("-------------------------------------------");
    addLog(`1. Bouton cliqué (Scopes: ${JSON.stringify(scopes)})`);

    if (typeof (window as any).Pi === "undefined") {
      const err = "2. ERREUR : window.Pi absent. Ouvrez dans Pi Browser.";
      setError(err);
      addLog(err);
      setIsAuthenticating(false);
      return;
    }

    addLog("2. window.Pi présent");

    try {
      addLog("3. Pi.init({ version: '2.0', sandbox: true })");
      try {
        (window as any).Pi.init({
          version: "2.0",
          sandbox: true,
        });
        addLog("4. Pi.init() terminé (Sandbox: true)");
      } catch (initErr: any) {
        addLog(`4. Note Pi.init: ${initErr?.message || initErr}`);
      }

      addLog(`5. APPEL Pi.authenticate(${JSON.stringify(scopes)})...`);

      const result = await (window as any).Pi.authenticate(
        scopes,
        (payment: any) => {
          addLog("6. Paiement incomplet détecté");
          addLog(JSON.stringify(payment));
          console.log("[Pi-Test] Incomplete Payment:", payment);
        }
      );

      addLog("7. AUTHENTIFICATION TERMINÉE 🎉");
      addLog(JSON.stringify(result));

      if (result && result.user) {
        setAuthUser({
          uid: result.user.uid,
          username: result.user.username,
          accessToken: result.accessToken,
        });
      }
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      setError(errMsg);
      addLog("ERREUR AUTHENTIFICATION ❌");
      addLog(errMsg);
    } finally {
      setIsAuthenticating(false);
      addLog("-------------------------------------------");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Navigation retour */}
        {onBackToMarket && (
          <button
            onClick={onBackToMarket}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'application Marketplace
          </button>
        )}

        {/* En-tête */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                <Terminal className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Page de Test Minimal Pi SDK</h1>
                <p className="text-xs text-slate-400">Isolation totale (0 Supabase, 0 API backend, 0 logique complexe)</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${isPiAvailable ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
              {isPiAvailable ? "Pi SDK Détecté" : "Hors Pi Browser"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-slate-500">URL testée:</span>
              <p className="font-mono text-slate-300 truncate">{window.location.origin}</p>
            </div>
            <div>
              <span className="text-slate-500">Mode SDK:</span>
              <p className="font-mono text-amber-400">v2.0 (Sandbox: true / Testnet)</p>
            </div>
          </div>
        </div>

        {/* Bouton d'action */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-center">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300">Test d'Authentification Pi Isolé</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedScope("username")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  selectedScope === "username"
                    ? "bg-purple-600 border-purple-400 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                ["username"] (Recommandé)
              </button>
              <button
                type="button"
                onClick={() => setSelectedScope("both")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  selectedScope === "both"
                    ? "bg-purple-600 border-purple-400 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                ["username", "payments"]
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleTestAuthenticate("username")}
              disabled={isAuthenticating}
              className={`py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                isAuthenticating && selectedScope === "username"
                  ? "bg-purple-900/50 text-purple-200 border border-purple-500/30 cursor-wait"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white hover:shadow-purple-500/25 active:scale-[0.99]"
              }`}
            >
              {isAuthenticating && selectedScope === "username" ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Appel en cours...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Tester scope: ["username"]
                </>
              )}
            </button>

            <button
              onClick={() => handleTestAuthenticate("both")}
              disabled={isAuthenticating}
              className={`py-3.5 px-4 rounded-xl font-semibold text-sm transition-all border flex items-center justify-center gap-2 ${
                isAuthenticating && selectedScope === "both"
                  ? "bg-slate-800 text-slate-400 border-slate-700 cursor-wait"
                  : "bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600 active:scale-[0.99]"
              }`}
            >
              {isAuthenticating && selectedScope === "both" ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Appel en cours...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Tester: ["username", "payments"]
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {authUser && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs space-y-2 text-left">
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Authentification Pi Réussie !
              </div>
              <div className="font-mono space-y-1 bg-slate-950/80 p-3 rounded-lg border border-emerald-500/20">
                <p><span className="text-slate-400">Username Pi:</span> <strong className="text-white">{authUser.username}</strong></p>
                <p><span className="text-slate-400">UID:</span> <span className="text-slate-300">{authUser.uid}</span></p>
                <p><span className="text-slate-400">AccessToken:</span> <span className="text-slate-500 truncate block">{authUser.accessToken}</span></p>
              </div>
            </div>
          )}
        </div>

        {/* Terminal de debug en direct */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Journal de Test en Direct (Logs Mobile)
            </div>
            <button
              onClick={() => setLogs([])}
              className="text-[11px] text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded transition-colors"
            >
              Effacer
            </button>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 max-h-72 overflow-y-auto font-mono text-xs space-y-1.5 select-text">
            {logs.length === 0 ? (
              <p className="text-slate-600 italic">Aucun log enregistré.</p>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`break-all ${
                    log.includes("❌") || log.includes("ERREUR")
                      ? "text-rose-400 font-semibold"
                      : log.includes("🎉") || log.includes("Réussie") || log.includes("✅")
                      ? "text-emerald-300 font-semibold"
                      : log.includes("👉") || log.includes("authenticate")
                      ? "text-amber-300"
                      : "text-slate-300"
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

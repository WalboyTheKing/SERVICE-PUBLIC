import { Component, type ErrorInfo, type ReactNode } from "react";
import { logPi } from "../pi-sdk-helper";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    const errMsg = `[REACT ERROR] ${error.name}: ${error.message}`;
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    logPi(errMsg);
    if (error.stack) {
      logPi(`[STACK] ${error.stack.split("\n").slice(0, 3).join(" -> ")}`);
    }
  }

  override render() {
    if (this.state.hasError) {
      const error = this.state.error;
      const errorInfo = this.state.errorInfo;

      return (
        <div className="min-h-screen bg-rose-950 text-white p-6 flex flex-col justify-center items-center font-sans select-text">
          <div className="max-w-xl w-full bg-rose-900/90 border-2 border-rose-500 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center font-bold text-xl text-white shadow-inner">
                ⚠️
              </div>
              <div>
                <h1 className="text-xl font-black tracking-wider text-rose-100 uppercase">
                  ERREUR APPLICATION
                </h1>
                <p className="text-xs text-rose-200">
                  Une exception JavaScript/React est survenue après le rendu.
                </p>
              </div>
            </div>

            <div className="p-4 bg-black/60 rounded-xl border border-rose-700/50 space-y-2">
              <div className="text-xs font-bold text-rose-300">Message :</div>
              <div className="font-mono text-sm text-yellow-300 break-words leading-snug">
                {error?.message || "Erreur inconnue"}
              </div>
            </div>

            {error?.stack && (
              <div className="p-4 bg-black/60 rounded-xl border border-rose-700/50 space-y-2">
                <div className="text-xs font-bold text-rose-300">Stack Trace :</div>
                <pre className="font-mono text-[11px] text-rose-200 max-h-48 overflow-y-auto whitespace-pre-wrap break-all leading-tight">
                  {error.stack}
                </pre>
              </div>
            )}

            {errorInfo?.componentStack && (
              <div className="p-4 bg-black/60 rounded-xl border border-rose-700/50 space-y-2">
                <div className="text-xs font-bold text-rose-300">Composant React :</div>
                <pre className="font-mono text-[10px] text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap break-all leading-tight">
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow transition-all cursor-pointer text-center text-sm"
              >
                🔄 Recharger la page
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                  } catch {
                    window.location.reload();
                  }
                }}
                className="py-3 px-4 bg-rose-800 hover:bg-rose-700 text-rose-200 font-semibold rounded-xl border border-rose-600 transition-all cursor-pointer text-xs"
              >
                Vider cache & Recharger
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

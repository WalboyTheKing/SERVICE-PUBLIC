import { PiUser } from "./types";

type LogListener = (msg: string) => void;
const logListeners: Set<LogListener> = new Set();

export function subscribePiLogs(listener: LogListener) {
  logListeners.add(listener);
  return () => {
    logListeners.delete(listener);
  };
}

export function logPi(msg: string, ...args: any[]) {
  const fullMsg = args.length > 0 ? `${msg} ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}` : msg;
  console.log(fullMsg);
  logListeners.forEach(l => {
    try {
      l(fullMsg);
    } catch {
      // ignore
    }
  });
}

declare global {
  interface Window {
    Pi?: {
      init: (config: {
        version: string;
        sandbox?: boolean;
      }) => void;

      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: any) => void
      ) => Promise<{
        accessToken: string;
        user: {
          uid: string;
          username: string;
        };
      }>;

      createPayment: (
        paymentData: {
          amount: number;
          memo: string;
          metadata: Record<string, any>;
        },
        callbacks: {
          onReadyForServerApproval: (paymentId: string) => void;
          onReadyForServerCompletion: (paymentId: string, txid: string) => void;
          onCancel: (paymentId: string) => void;
          onError: (error: Error, payment?: any) => void;
        }
      ) => void;
    };
  }
}

export function isPiBrowserAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.Pi !== "undefined"
  );
}

export function initPiSdk(): boolean {
  if (typeof window === "undefined") {
    logPi("[Pi] window indisponible");
    return false;
  }

  if (!window.Pi) {
    logPi("[Pi] window.Pi absent");
    return false;
  }

  logPi("[Pi] Pi trouvé");
  logPi("[Pi] Initialisation...");

  try {
    window.Pi.init({
      version: "2.0",
      sandbox: true,
    });

    logPi("[Pi] Pi.init terminé");
    return true;
  } catch (error) {
    logPi("[Pi] Erreur Pi.init:", error);
    return false;
  }
}

export async function authenticateWithPi(
  onIncompletePayment?: (payment: any) => void,
  scopes: string[] = ["username"]
): Promise<PiUser | null> {
  logPi("[Pi] ===== AUTHENTIFICATION =====");
  logPi("[Pi] Scopes demandés:", scopes.join(", "));

  if (typeof window === "undefined") {
    throw new Error("Window indisponible");
  }

  if (!window.Pi) {
    throw new Error(
      "Pi Browser requis. window.Pi est absent."
    );
  }

  logPi("[Pi] window.Pi disponible");
  logPi(`[Pi] Appel direct Pi.authenticate(${JSON.stringify(scopes)})...`);

  const auth = await window.Pi.authenticate(
    scopes,
    (payment) => {
      logPi(
        "[Pi] Paiement incomplet:",
        payment
      );
      onIncompletePayment?.(payment);
    }
  );

  logPi(
    "[Pi] Réponse authenticate:",
    auth
  );

  if (!auth?.user) {
    throw new Error(
      "Pi n'a retourné aucun utilisateur."
    );
  }

  logPi(
    "[Pi] Utilisateur connecté:",
    auth.user.username
  );

  return {
    uid: auth.user.uid,
    username: auth.user.username,
    accessToken: auth.accessToken,
  };
}

export async function executePiPayment({
  amount,
  memo,
  metadata,
  onApprove,
  onComplete,
  onCancel,
  onError,
}: {
  amount: number;
  memo: string;
  metadata: Record<string, any>;
  onApprove: (paymentId: string) => Promise<void>;
  onComplete: (paymentId: string, txid: string) => Promise<void>;
  onCancel?: (paymentId: string) => void;
  onError?: (err: Error) => void;
}) {
  if (typeof window === "undefined" || !window.Pi) {
    throw new Error("Pi SDK non disponible. Veuillez ouvrir l'application dans Pi Browser.");
  }

  try {
    window.Pi.init({ version: "2.0", sandbox: false });
  } catch (e) {
    // ignore
  }

  window.Pi.createPayment(
    { amount, memo, metadata },
    {
      onReadyForServerApproval: async (paymentId: string) => {
        try {
          await onApprove(paymentId);
        } catch (e: any) {
          console.error("[Pi] onReadyForServerApproval error:", e);
          if (onError) onError(e);
        }
      },
      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        try {
          await onComplete(paymentId, txid);
        } catch (e: any) {
          console.error("[Pi] onReadyForServerCompletion error:", e);
          if (onError) onError(e);
        }
      },
      onCancel: (paymentId: string) => {
        console.log("[Pi] Paiement annulé par l'utilisateur", paymentId);
        if (onCancel) onCancel(paymentId);
      },
      onError: (error: Error) => {
        console.error("[Pi] Erreur createPayment:", error);
        if (onError) onError(error);
      },
    }
  );
}

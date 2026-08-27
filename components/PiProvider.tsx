'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { User } from '@/types/database';
import { IS_SANDBOX } from '@/lib/constants';

export type AuthStatus =
  | 'SDK_LOADING'
  | 'SDK_READY'
  | 'AUTHENTICATING'
  | 'AUTHENTICATED'
  | 'AUTH_FAILED'
  | 'SDK_UNAVAILABLE';

export interface PiDiagnostics {
  sdkDetected: boolean;
  isPiBrowser: boolean;
  initStatus: 'PENDING' | 'OK' | 'ERROR';
  authStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
  username: string | null;
  userAgent: string;
  errorMessage: string | null;
  lastAttemptTime: string | null;
}

export interface PiContextType {
  user: User | null;
  authStatus: AuthStatus;
  loading: boolean;
  error: string | null;
  isSandbox: boolean;
  isPiBrowser: boolean;
  diagnostics: PiDiagnostics;
  authenticate: () => Promise<void>;
  simulateSandboxLogin: (customUsername?: string, asSeller?: boolean) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const PiContext = createContext<PiContextType>({
  user: null,
  authStatus: 'SDK_LOADING',
  loading: true,
  error: null,
  isSandbox: IS_SANDBOX,
  isPiBrowser: false,
  diagnostics: {
    sdkDetected: false,
    isPiBrowser: false,
    initStatus: 'PENDING',
    authStatus: 'NOT_STARTED',
    username: null,
    userAgent: '',
    errorMessage: null,
    lastAttemptTime: null,
  },
  authenticate: async () => {},
  simulateSandboxLogin: async () => {},
  logout: () => {},
  refetchUser: async () => {},
});

const DEMO_USER_STORAGE_KEY = 'pimarket_auth_user';

export const PiProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('SDK_LOADING');
  const [error, setError] = useState<string | null>(null);
  const [isPiBrowser, setIsPiBrowser] = useState<boolean>(false);

  const [diagnostics, setDiagnostics] = useState<PiDiagnostics>({
    sdkDetected: false,
    isPiBrowser: false,
    initStatus: 'PENDING',
    authStatus: 'NOT_STARTED',
    username: null,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    errorMessage: null,
    lastAttemptTime: null,
  });

  // Strict execution locks
  const isAuthenticatingRef = useRef<boolean>(false);
  const hasInitializedRef = useRef<boolean>(false);
  const hasAutoAttemptedRef = useRef<boolean>(false);

  const handleIncompletePayment = useCallback(async (payment: any) => {
    try {
      console.log('[Pi SDK] Traitement paiement incomplet détecté:', payment);
      await fetch('/api/pi/incomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment }),
      });
    } catch (e) {
      console.error('[Pi SDK] Erreur traitement paiement incomplet:', e);
    }
  }, []);

  const authenticate = useCallback(async () => {
    if (typeof window === 'undefined') return;

    if (isAuthenticatingRef.current) {
      console.log('[Pi SDK] Authentification déjà en cours.');
      return;
    }

    isAuthenticatingRef.current = true;
    setError(null);
    setAuthStatus('AUTHENTICATING');
    const nowTime = new Date().toLocaleTimeString();

    setDiagnostics((prev) => ({
      ...prev,
      authStatus: 'IN_PROGRESS',
      errorMessage: null,
      lastAttemptTime: nowTime,
    }));

    if (!window.Pi) {
      const errMsg = "Pi SDK non disponible. Veuillez ouvrir cette application dans l'application officielle Pi Browser.";
      console.warn('[Pi SDK]', errMsg);
      setError(errMsg);
      setAuthStatus('SDK_UNAVAILABLE');
      setDiagnostics((prev) => ({
        ...prev,
        sdkDetected: false,
        authStatus: 'FAILED',
        errorMessage: errMsg,
      }));
      isAuthenticatingRef.current = false;
      return;
    }

    // Ensure Pi.init is called
    if (!hasInitializedRef.current) {
      try {
        console.log('[Pi SDK] Initialisation window.Pi.init...', { version: '2.0', sandbox: IS_SANDBOX });
        window.Pi.init({ version: '2.0', sandbox: IS_SANDBOX });
        hasInitializedRef.current = true;
        setDiagnostics((prev) => ({ ...prev, sdkDetected: true, initStatus: 'OK' }));
      } catch (initErr: any) {
        console.warn('[Pi SDK] Avertissement Pi.init():', initErr);
        hasInitializedRef.current = true;
      }
    }

    try {
      console.log('[Pi SDK] Appel de Pi.authenticate([username, payments])...');
      const auth = await window.Pi.authenticate(['username', 'payments'], handleIncompletePayment);

      console.log('[Pi SDK] Réponse reçue de Pi.authenticate():', auth);

      if (!auth || !auth.user || !auth.user.username) {
        throw new Error("Données utilisateur incomplètes ou autorisation rejetée.");
      }

      // Verify token with backend /api/pi/authenticate
      const res = await fetch('/api/pi/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: auth.user.uid,
          username: auth.user.username,
          accessToken: auth.accessToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.user) {
        throw new Error(data.error || 'Erreur de synchronisation du compte Pi avec le serveur.');
      }

      setUser(data.user);
      try {
        localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(data.user));
      } catch (lsErr) {
        console.warn('Erreur stockage local:', lsErr);
      }

      setDiagnostics((prev) => ({
        ...prev,
        authStatus: 'SUCCESS',
        username: data.user.username,
        errorMessage: null,
      }));

      setAuthStatus('AUTHENTICATED');
      console.log('[Pi SDK] Authentification réussie pour:', data.user.username);
    } catch (err: any) {
      console.error('[Pi SDK] Échec de Pi.authenticate():', err);
      const msg = err.message || 'Authentification refusée ou fermée par l’utilisateur.';
      setError(msg);
      setAuthStatus('AUTH_FAILED');
      setDiagnostics((prev) => ({
        ...prev,
        authStatus: 'FAILED',
        errorMessage: msg,
      }));
    } finally {
      isAuthenticatingRef.current = false;
    }
  }, [handleIncompletePayment]);

  const simulateSandboxLogin = async (customUsername = 'Pioneer_Tester', asSeller = false) => {
    try {
      setAuthStatus('AUTHENTICATING');
      setError(null);
      const testUid = `pi-sandbox-${customUsername.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

      const res = await fetch('/api/pi/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: testUid, username: customUsername }),
      });

      const data = await res.json();
      let finalUser: User;

      if (res.ok && data.user) {
        finalUser = data.user;
        if (asSeller && !finalUser.is_seller) {
          finalUser = { ...finalUser, is_seller: true };
        }
      } else {
        finalUser = {
          id: `usr-${Date.now()}`,
          pi_uid: testUid,
          username: customUsername,
          is_seller: asSeller,
          seller_payment_id: asSeller ? 'sandbox-seller-pay-id' : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      setUser(finalUser);
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(finalUser));

      setDiagnostics((prev) => ({
        ...prev,
        authStatus: 'SUCCESS',
        username: finalUser.username,
        errorMessage: null,
      }));

      setAuthStatus('AUTHENTICATED');
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la connexion test.');
      setAuthStatus('AUTH_FAILED');
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    hasAutoAttemptedRef.current = true;
    setError(null);
    setDiagnostics((prev) => ({
      ...prev,
      authStatus: 'NOT_STARTED',
      username: null,
      errorMessage: null,
    }));
    setAuthStatus(window?.Pi ? 'SDK_READY' : 'SDK_UNAVAILABLE');
  };

  const refetchUser = async () => {
    if (user?.pi_uid) {
      try {
        const res = await fetch('/api/pi/authenticate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.pi_uid, username: user.username }),
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
          localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(data.user));
        }
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Robust, single-mount initialization and auth sequence
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;
    let attempts = 0;
    const ua = navigator.userAgent || '';
    const inPiBrowser = /pibrowser/i.test(ua);
    setIsPiBrowser(inPiBrowser);

    setDiagnostics((prev) => ({
      ...prev,
      isPiBrowser: inPiBrowser,
      userAgent: ua,
    }));

    const waitForPi = async () => {
      // Poll for window.Pi presence (up to 50 attempts * 100ms = 5 seconds)
      while (!cancelled && !window.Pi && attempts < 50) {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (cancelled) return;

      if (!window.Pi) {
        console.log('[Pi SDK] window.Pi non détecté après attente.');
        setAuthStatus('SDK_UNAVAILABLE');
        setDiagnostics((prev) => ({
          ...prev,
          sdkDetected: false,
          errorMessage: inPiBrowser
            ? "Pi SDK en attente d'injection par Pi Browser."
            : "Pi Browser / Pi SDK non disponible sur ce navigateur.",
        }));
        return;
      }

      try {
        setDiagnostics((prev) => ({
          ...prev,
          sdkDetected: true,
        }));

        if (!hasInitializedRef.current) {
          console.log('[Pi SDK] Initialisation window.Pi.init({ version: 2.0, sandbox:', IS_SANDBOX, '})');
          window.Pi.init({
            version: '2.0',
            sandbox: IS_SANDBOX,
          });

          hasInitializedRef.current = true;

          setDiagnostics((prev) => ({
            ...prev,
            sdkDetected: true,
            initStatus: 'OK',
          }));
        }

        if (!hasAutoAttemptedRef.current) {
          hasAutoAttemptedRef.current = true;
          await authenticate();
        }
      } catch (error: any) {
        console.error('[Pi SDK] Initialisation/authentification automatique:', error);
        setError(error?.message || 'Impossible de démarrer l’authentification Pi.');
        setAuthStatus('AUTH_FAILED');
      }
    };

    waitForPi();

    return () => {
      cancelled = true;
    };
  }, [authenticate]);

  const loading = authStatus === 'SDK_LOADING' || authStatus === 'AUTHENTICATING';

  return (
    <PiContext.Provider
      value={{
        user,
        authStatus,
        loading,
        error,
        isSandbox: IS_SANDBOX,
        isPiBrowser,
        diagnostics,
        authenticate,
        simulateSandboxLogin,
        logout,
        refetchUser,
      }}
    >
      <Script
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="beforeInteractive"
      />
      {children}
    </PiContext.Provider>
  );
};

export const usePi = () => useContext(PiContext);



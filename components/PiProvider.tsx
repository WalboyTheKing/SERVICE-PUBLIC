'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { User } from '@/types/database';
import { IS_SANDBOX } from '@/lib/constants';

export type AuthStatus = 'initializing' | 'authenticating' | 'authenticated' | 'unauthenticated' | 'error';

export interface PiContextType {
  user: User | null;
  authStatus: AuthStatus;
  loading: boolean;
  error: string | null;
  isSandbox: boolean;
  isPiBrowser: boolean;
  authenticate: () => Promise<void>;
  simulateSandboxLogin: (customUsername?: string, asSeller?: boolean) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const PiContext = createContext<PiContextType>({
  user: null,
  authStatus: 'initializing',
  loading: true,
  error: null,
  isSandbox: IS_SANDBOX,
  isPiBrowser: false,
  authenticate: async () => {},
  simulateSandboxLogin: async () => {},
  logout: () => {},
  refetchUser: async () => {},
});

const DEMO_USER_STORAGE_KEY = 'pimarket_auth_user';

export const PiProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('initializing');
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState<boolean>(false);
  const [isPiBrowser, setIsPiBrowser] = useState<boolean>(false);

  // Ref to guarantee we only auto-attempt authentication ONCE per page load to prevent infinite loops
  const hasAutoAttemptedRef = useRef<boolean>(false);

  const handleIncompletePayment = async (payment: any) => {
    try {
      await fetch('/api/pi/incomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment }),
      });
    } catch (e) {
      console.error('Erreur traitement paiement incomplet:', e);
    }
  };

  const initPiSDK = useCallback(() => {
    if (typeof window !== 'undefined' && window.Pi) {
      try {
        window.Pi.init({ version: '2.0', sandbox: IS_SANDBOX });
        setSdkReady(true);
        setIsPiBrowser(true);
      } catch (e) {
        console.warn('Pi SDK Init warning:', e);
        setSdkReady(true);
      }
    }
  }, []);

  const authenticate = useCallback(async () => {
    if (typeof window === 'undefined') return;

    setError(null);
    setAuthStatus('authenticating');

    if (!window.Pi) {
      setError('Pi SDK non détecté. Ouvrez PiMarket dans Pi Browser sur mobile ou connectez-vous avec le mode Testnet Sandbox ci-dessous.');
      setAuthStatus('unauthenticated');
      return;
    }

    try {
      const auth = await window.Pi.authenticate(['username', 'payments'], handleIncompletePayment);

      if (!auth || !auth.user || !auth.user.username) {
        throw new Error('Authentification Pi incomplète ou annulée.');
      }

      const res = await fetch('/api/pi/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: auth.user.uid, username: auth.user.username }),
      });

      const data = await res.json();
      if (!res.ok || !data.user) {
        throw new Error(data.error || 'Erreur lors de la synchronisation du compte Pi.');
      }

      setUser(data.user);
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(data.user));
      setAuthStatus('authenticated');
    } catch (err: any) {
      console.warn('Pi Auth Error:', err);
      const msg = err.message || 'Authentification refusée ou annulée.';
      setError(msg);
      setAuthStatus('unauthenticated');
    }
  }, []);

  const simulateSandboxLogin = async (customUsername = 'Pioneer_Tester', asSeller = false) => {
    try {
      setAuthStatus('authenticating');
      setError(null);
      const testUid = `pi-sandbox-${customUsername.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

      const res = await fetch('/api/pi/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: testUid, username: customUsername }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        let finalUser = data.user;
        if (asSeller && !finalUser.is_seller) {
          finalUser = { ...finalUser, is_seller: true };
        }
        setUser(finalUser);
        localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(finalUser));
        setAuthStatus('authenticated');
      } else {
        const fallbackUser: User = {
          id: `usr-${Date.now()}`,
          pi_uid: testUid,
          username: customUsername,
          is_seller: asSeller,
          seller_payment_id: asSeller ? 'sandbox-seller-pay-id' : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(fallbackUser);
        localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(fallbackUser));
        setAuthStatus('authenticated');
      }
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la connexion test.');
      setAuthStatus('unauthenticated');
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    // Prevent auto-auth from immediately running again after manual logout
    hasAutoAttemptedRef.current = true;
    setError(null);
    setAuthStatus('unauthenticated');
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

  // Step 1: Check localStorage on initial mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.username) {
          setUser(parsed);
          setAuthStatus('authenticated');
          return;
        }
      }
    } catch (e) {
      console.warn('LocalStorage read error:', e);
    }

    // If no saved user, check if window.Pi is already available
    if (typeof window !== 'undefined' && window.Pi) {
      initPiSDK();
    }
  }, [initPiSDK]);

  // Step 2: Once SDK is ready or if we are still initializing, attempt automatic authentication once
  useEffect(() => {
    if (authStatus === 'authenticated') return;

    if (sdkReady && !hasAutoAttemptedRef.current) {
      hasAutoAttemptedRef.current = true;
      authenticate();
    }
  }, [sdkReady, authStatus, authenticate]);

  // Step 3: Fallback timer to prevent getting stuck on 'initializing' if outside Pi Browser or script delayed
  useEffect(() => {
    if (authStatus === 'initializing') {
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined' && window.Pi && !hasAutoAttemptedRef.current) {
          initPiSDK();
          hasAutoAttemptedRef.current = true;
          authenticate();
        } else if (authStatus === 'initializing') {
          setAuthStatus('unauthenticated');
        }
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [authStatus, initPiSDK, authenticate]);

  const loading = authStatus === 'initializing' || authStatus === 'authenticating';

  return (
    <PiContext.Provider
      value={{
        user,
        authStatus,
        loading,
        error,
        isSandbox: IS_SANDBOX,
        isPiBrowser,
        authenticate,
        simulateSandboxLogin,
        logout,
        refetchUser,
      }}
    >
      <Script
        src="https://sdk.minepi.com/pi-sdk.js"
        onLoad={initPiSDK}
        strategy="afterInteractive"
      />
      {children}
    </PiContext.Provider>
  );
};

export const usePi = () => useContext(PiContext);

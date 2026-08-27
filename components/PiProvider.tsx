'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Script from 'next/script';
import { User } from '@/types/database';
import { IS_SANDBOX } from '@/lib/constants';

interface PiContextType {
  user: User | null;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState<boolean>(false);
  const [isPiBrowser, setIsPiBrowser] = useState<boolean>(false);

  // Check saved session in local storage first
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const initPiSDK = () => {
    if (typeof window !== 'undefined' && window.Pi) {
      try {
        window.Pi.init({ version: '2.0', sandbox: IS_SANDBOX });
        setSdkReady(true);
        setIsPiBrowser(true);
      } catch (e) {
        console.warn('Pi SDK Init error:', e);
      }
    }
  };

  const handleIncompletePayment = async (payment: any) => {
    try {
      await fetch('/api/pi/incomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment }),
      });
    } catch (e) {
      console.error('Erreur paiement incomplet:', e);
    }
  };

  const authenticate = useCallback(async () => {
    if (typeof window === 'undefined') return;

    if (!window.Pi) {
      // In normal browser outside Pi Browser
      setError('Ouvrez l\'application dans Pi Browser ou utilisez le mode Test Sandbox.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const auth = await window.Pi.authenticate(['username', 'payments'], handleIncompletePayment);

      const res = await fetch('/api/pi/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: auth.user.uid, username: auth.user.username }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Échec authentification');
      
      setUser(data.user);
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(data.user));
    } catch (err: any) {
      setError(err.message || 'Authentification annulée');
    } finally {
      setLoading(false);
    }
  }, []);

  const simulateSandboxLogin = async (customUsername = 'Pioneer_Tester', asSeller = false) => {
    try {
      setLoading(true);
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
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
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

  useEffect(() => {
    if (sdkReady && !user) {
      authenticate();
    }
  }, [sdkReady, authenticate, user]);

  return (
    <PiContext.Provider
      value={{
        user,
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
      <Script src="https://sdk.minepi.com/pi-sdk.js" onLoad={initPiSDK} strategy="afterInteractive" />
      {children}
    </PiContext.Provider>
  );
};

export const usePi = () => useContext(PiContext);

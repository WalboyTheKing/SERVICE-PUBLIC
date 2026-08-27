'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Script from 'next/script';
import { User } from '@/types/database';
import { IS_SANDBOX } from '@/lib/constants';

interface PiContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  authenticate: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const PiContext = createContext<PiContextType>({
  user: null,
  loading: true,
  error: null,
  authenticate: async () => {},
  refetchUser: async () => {},
});

export const PiProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState<boolean>(false);

  const initPiSDK = () => {
    if (window.Pi) {
      window.Pi.init({ version: '2.0', sandbox: IS_SANDBOX });
      setSdkReady(true);
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

  const authenticate = async () => {
    if (!window.Pi) {
      setError('Ouvrez l\'application dans Pi Browser.');
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
    } catch (err: any) {
      setError(err.message || 'Authentification annulée');
    } finally {
      setLoading(false);
    }
  };

  const refetchUser = async () => {
    if (user?.pi_uid) {
      const res = await fetch('/api/pi/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.pi_uid, username: user.username }),
      });
      const data = await res.json();
      if (res.ok) setUser(data.user);
    }
  };

  useEffect(() => {
    if (sdkReady) authenticate();
  }, [sdkReady]);

  return (
    <PiContext.Provider value={{ user, loading, error, authenticate, refetchUser }}>
      <Script src="https://sdk.minepi.com/pi-sdk.js" onLoad={initPiSDK} strategy="afterInteractive" />
      {children}
    </PiContext.Provider>
  );
};

export const usePi = () => useContext(PiContext);
'use client';

import React, { useState } from 'react';
import { usePi } from './PiProvider';
import { X, Smartphone, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from './ToastProvider';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { isPiBrowser, authenticate, simulateSandboxLogin, loading, isSandbox } = usePi();
  const [customName, setCustomName] = useState('');
  const [asSeller, setAsSeller] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handlePiBrowserAuth = async () => {
    try {
      await authenticate();
      showToast('Authentification Pi réussie !', 'success');
      onClose();
    } catch (e: any) {
      showToast(e.message || 'Échec de connexion Pi', 'error');
    }
  };

  const handleSandboxAuth = async (name = 'Pioneer_User', seller = false) => {
    try {
      await simulateSandboxLogin(name, seller);
      showToast(`Connecté en tant que @${name} (${seller ? 'Vendeur' : 'Acheteur'})`, 'success');
      onClose();
    } catch (e: any) {
      showToast(e.message || 'Erreur de connexion', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-purple-950 font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            π
          </div>
          <h2 className="text-xl font-bold">Connexion à PiMarket</h2>
          <p className="text-purple-200 text-xs mt-1">
            {isSandbox ? 'Environnement Pi Network Testnet / Sandbox' : 'Réseau officiel Pi Network'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {isPiBrowser ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-sm text-purple-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Pi Browser détecté.</strong> Vous pouvez vous authentifier directement avec votre compte Pi officiel.
                </p>
              </div>
              <button
                onClick={handlePiBrowserAuth}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-purple-900 hover:bg-purple-800 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-md"
              >
                <Smartphone className="w-5 h-5" />
                {loading ? 'Connexion en cours...' : 'Se connecter avec Pi SDK'}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <p className="font-semibold mb-1">Navigateur standard détecté</p>
                <p>
                  Dans l&apos;application mobile Pi Browser, l&apos;authentification est 100% native via le SDK Pi. Pour tester le site, utilisez le mode Sandbox ci-dessous :
                </p>
              </div>

              {/* Quick test accounts */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Comptes de test rapides</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSandboxAuth('Pioneer_Alex', false)}
                    className="p-3 rounded-xl border border-gray-200 hover:border-purple-600 hover:bg-purple-50/50 text-left transition flex flex-col gap-1"
                  >
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-purple-700" />
                      @Pioneer_Alex
                    </span>
                    <span className="text-[11px] text-gray-500">Profil Acheteur</span>
                  </button>
                  <button
                    onClick={() => handleSandboxAuth('PiMerchant_Pro', true)}
                    className="p-3 rounded-xl border border-amber-300 bg-amber-50/40 hover:border-amber-500 text-left transition flex flex-col gap-1"
                  >
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      @PiMerchant_Pro
                    </span>
                    <span className="text-[11px] text-amber-700">Profil Vendeur certifié</span>
                  </button>
                </div>
              </div>

              {/* Custom Username */}
              <div className="pt-3 border-t border-gray-100 space-y-3">
                <label className="text-xs font-semibold text-gray-700 block">
                  Ou choisir un pseudonyme personnalisé
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ex: WalboyPioneer"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    onClick={() => handleSandboxAuth(customName || 'Pioneer_Custom', asSeller)}
                    disabled={!customName.trim()}
                    className="px-4 py-2.5 bg-purple-900 hover:bg-purple-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition"
                  >
                    Entrer
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="modal-seller-check"
                    checked={asSeller}
                    onChange={(e) => setAsSeller(e.target.checked)}
                    className="rounded text-purple-900 focus:ring-purple-600"
                  />
                  <label htmlFor="modal-seller-check" className="text-xs text-gray-600 cursor-pointer">
                    Activer les privilèges de vendeur pour ce compte
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

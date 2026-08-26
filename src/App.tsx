import React, { useEffect, useState, useCallback } from "react";
import {
  PiUser,
  UserAccount,
  ProductItem,
  OrderRequest,
  PaymentRecord,
  UserRole,
  ReportReason,
} from "./types";
import {
  initPiSdk,
  authenticateWithPi,
  executePiPayment,
  isPiBrowserAvailable,
  subscribePiLogs,
  logPi,
} from "./pi-sdk-helper";
import { Header } from "./components/Header";
import { LoginScreen } from "./components/LoginScreen";
import { MarketplaceScreen } from "./components/MarketplaceScreen";
import { SellerDashboard } from "./components/SellerDashboard";
import { MyOrdersView } from "./components/MyOrdersView";
import { AdminDashboard } from "./components/AdminDashboard";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { OrderModal } from "./components/OrderModal";
import { PublishProductModal } from "./components/PublishProductModal";
import { ReportModal } from "./components/ReportModal";
import { PiTestPage } from "./components/PiTestPage";

export function App() {
  logPi("[APP] App rendu");

  // Check URL for /pi-test or ?pi-test or #pi-test
  const isInitialPiTest = typeof window !== "undefined" && (
    window.location.pathname === "/pi-test" ||
    window.location.pathname.includes("pi-test") ||
    window.location.search.includes("pi-test") ||
    window.location.hash.includes("pi-test")
  );

  const [showPiTest, setShowPiTest] = useState<boolean>(isInitialPiTest);

  // Authentication & User State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [currentTab, setCurrentTab] = useState<'market' | 'seller' | 'orders' | 'admin'>('market');

  // Marketplace Data
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [orderTargetProduct, setOrderTargetProduct] = useState<ProductItem | null>(null);
  const [reportTargetProduct, setReportTargetProduct] = useState<ProductItem | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Status & Loading states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPiBrowser, setIsPiBrowser] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogsOverlay, setShowLogsOverlay] = useState<boolean>(true);

  const addLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-40), `[${time}] ${msg}`]);
  }, []);

  // Subscribe to SDK logs
  useEffect(() => {
    const unsubscribe = subscribePiLogs((msg) => {
      addLog(msg);
    });
    return unsubscribe;
  }, [addLog]);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    logPi("[APP] fetchProducts démarré");
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
      logPi("[APP] fetchProducts terminé");
    } catch (err) {
      logPi("[APP] fetchProducts erreur:", err);
      console.error("Erreur récupération produits:", err);
    }
  }, []);

  // Fetch user orders
  const fetchOrders = useCallback(async (uid: string) => {
    try {
      const res = await fetch(`/api/orders?uid=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Erreur récupération commandes:", err);
    }
  }, []);

  // Fetch user payments
  const fetchPayments = useCallback(async (uid: string) => {
    try {
      const res = await fetch(`/api/payments?uid=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error("Erreur récupération paiements:", err);
    }
  }, []);

  // Fetch user profile and status from backend
  const loadUserData = useCallback(
    async (uid: string, username?: string) => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/user/status?uid=${encodeURIComponent(uid)}${
            username ? `&username=${encodeURIComponent(username)}` : ""
          }`
        );
        if (res.ok) {
          const userObj: UserAccount = await res.json();
          setCurrentUser(userObj);
          localStorage.setItem("pi_market_user", JSON.stringify({ uid: userObj.uid, username: userObj.username }));
          await Promise.all([
            fetchProducts(),
            fetchOrders(userObj.uid),
            fetchPayments(userObj.uid),
          ]);
        }
      } catch (err) {
        console.error("Erreur chargement utilisateur:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProducts, fetchOrders, fetchPayments]
  );

  // Initialize Pi SDK & fetch public catalog on mount (Mainnet production)
  useEffect(() => {
    logPi("[APP] useEffect démarré");
    logPi("[APP] Pi initialisation démarrée");
    const initialized = initPiSdk();
    logPi("[APP] Pi initialisation terminée", initialized ? "(succès)" : "(absent ou attente)");
    setIsPiBrowser(isPiBrowserAvailable());
    fetchProducts();

    const savedUser = localStorage.getItem("pi_market_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        loadUserData(parsed.uid, parsed.username);
      } catch {
        localStorage.removeItem("pi_market_user");
      }
    }
  }, [fetchProducts, loadUserData]);

  // Authenticate Pi User (Pi Network Mainnet)
  const handleLogin = async () => {
    logPi("[LOGIN] ===== DÉBUT =====");
    setIsLoading(true);
    setErrorMsg(null);

    try {
      logPi("[LOGIN] Avant authenticateWithPi");

      const user = await authenticateWithPi((payment) => {
        logPi("[LOGIN] Paiement incomplet:", payment);
      });

      logPi("[LOGIN] APRÈS authenticateWithPi:", user);

      if (!user) {
        throw new Error("Aucun utilisateur retourné par Pi.");
      }

      logPi(`[LOGIN] UID: ${user.uid} | Username: ${user.username}`);

      setIsPiBrowser(true);

      logPi("[LOGIN] Avant loadUserData");

      await loadUserData(user.uid, user.username);

      logPi("[LOGIN] loadUserData terminé -> Redirection vers la Marketplace");
      setCurrentTab("market");
    } catch (error: any) {
      logPi("[LOGIN] ERREUR:", error?.message || error);
      setErrorMsg(error?.message || "Erreur d'authentification Pi.");
    } finally {
      logPi("[LOGIN] FINALLY");
      setIsLoading(false);
    }
  };

  // Guest Explorer Mode (Allows immediate browsing & testing)
  const handleGuestLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const guestUid = `pioneer_guest_${Math.floor(1000 + Math.random() * 9000)}`;
      const guestUsername = `Pionnier_${Math.floor(100 + Math.random() * 900)}`;
      await loadUserData(guestUid, guestUsername);
    } catch (err: any) {
      console.error("Erreur mode invité:", err);
      setErrorMsg("Impossible de charger le mode invité.");
    } finally {
      setIsLoading(false);
    }
  };

  // Seller Activation (0.0001 Pi one-time fee)
  const handleActivateSeller = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setErrorMsg(null);

    const completeActivationOnServer = async (paymentId: string, txid?: string) => {
      const res = await fetch("/api/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          txid: txid || `tx_act_${Date.now()}`,
          uid: currentUser.uid,
          username: currentUser.username,
          purpose: "SELLER_ACTIVATION",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Échec de l'activation vendeur sur le serveur");
      }

      await loadUserData(currentUser.uid, currentUser.username);
      setCurrentTab("seller");
    };

    if (isPiBrowserAvailable()) {
      executePiPayment({
        amount: 0.0001,
        memo: "Activation Espace Vendeur Pi Market (Accès à vie)",
        metadata: {
          uid: currentUser.uid,
          purpose: "SELLER_ACTIVATION",
        },
        onApprove: async (paymentId) => {
          await fetch("/api/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId }),
          });
        },
        onComplete: async (paymentId, txid) => {
          await completeActivationOnServer(paymentId, txid);
          setIsLoading(false);
        },
        onCancel: () => {
          setIsLoading(false);
          setErrorMsg("Paiement de l'activation vendeur annulé.");
        },
        onError: (err) => {
          setIsLoading(false);
          setErrorMsg(err.message || "Erreur de paiement Pi.");
        },
      });
      return;
    }

    setIsLoading(false);
    setErrorMsg("Pi Browser requis : veuillez ouvrir l'application dans Pi Browser pour régler les frais d'activation vendeur de 0.0001 π.");
  };

  // Submit order to seller
  const handleSubmitOrder = async (orderData: {
    product_id: number;
    buyer_contact: string;
    buyer_message: string;
    delivery_location?: string;
  }) => {
    if (!currentUser) return false;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderData,
          buyer_uid: currentUser.uid,
          buyer_username: currentUser.username,
        }),
      });

      if (!res.ok) return false;
      await fetchOrders(currentUser.uid);
      return true;
    } catch (err) {
      console.error("Erreur création commande:", err);
      return false;
    }
  };

  // Submit product report
  const handleSubmitReport = async (reportData: {
    product_id: number;
    reason: ReportReason;
    details: string;
  }) => {
    if (!currentUser) return false;
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reportData,
          reporter_uid: currentUser.uid,
          reporter_username: currentUser.username,
        }),
      });

      return res.ok;
    } catch (err) {
      console.error("Erreur envoi signalement:", err);
      return false;
    }
  };

  // Update product status (available, sold, archived)
  const handleUpdateProductStatus = async (productId: number, status: 'available' | 'sold' | 'archived') => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/products/${productId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller_uid: currentUser.uid,
          status,
        }),
      });

      if (res.ok) {
        await fetchProducts();
      }
    } catch (err) {
      console.error("Erreur maj statut produit:", err);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: number) => {
    if (!currentUser) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) return;

    try {
      const res = await fetch(`/api/products/${productId}?uid=${encodeURIComponent(currentUser.uid)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchProducts();
      }
    } catch (err) {
      console.error("Erreur suppression produit:", err);
    }
  };

  // Update order status (accepted, completed, cancelled)
  const handleUpdateOrderStatus = async (orderId: number, status: 'accepted' | 'completed' | 'cancelled') => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller_uid: currentUser.uid,
          status,
        }),
      });

      if (res.ok) {
        await fetchOrders(currentUser.uid);
      }
    } catch (err) {
      console.error("Erreur maj statut commande:", err);
    }
  };

  // Update seller profile
  const handleUpdateSellerProfile = async (profileData: {
    shop_name: string;
    bio: string;
    city: string;
    country: string;
    whatsapp: string;
    telegram: string;
    phone: string;
  }) => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`/api/user/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: currentUser.uid,
          ...profileData,
        }),
      });

      if (res.ok) {
        await loadUserData(currentUser.uid, currentUser.username);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Erreur maj profil:", err);
      return false;
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("pi_market_user");
    setCurrentUser(null);
    setProducts([]);
    setOrders([]);
    setPayments([]);
    setCurrentTab("market");
  };

  const pendingReceivedOrdersCount = currentUser?.is_seller
    ? orders.filter((o) => o.seller_uid === currentUser.uid && o.status === "pending").length
    : 0;

  if (showPiTest) {
    return <PiTestPage onBackToMarket={() => setShowPiTest(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#faf9fc] text-slate-900 flex flex-col font-sans">
      {/* Header Bar */}
      <Header
        currentUser={currentUser}
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        pendingOrdersCount={pendingReceivedOrdersCount}
        onLogout={handleLogout}
        onRefresh={() => currentUser && loadUserData(currentUser.uid, currentUser.username)}
        isLoading={isLoading}
        isPiBrowser={isPiBrowser}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center justify-start">
        {/* Not Logged in: Login Screen */}
        {!currentUser && (
          <div className="my-auto w-full">
            <LoginScreen
              onLogin={handleLogin}
              onGuestLogin={handleGuestLogin}
              onOpenPiTest={() => setShowPiTest(true)}
              isLoading={isLoading}
              isPiBrowser={isPiBrowser}
              error={errorMsg}
            />
          </div>
        )}

        {/* Logged in Views */}
        {currentUser && (
          <div className="w-full">
            {/* View 1: Public Market */}
            {currentTab === "market" && (
              <MarketplaceScreen
                currentUser={currentUser}
                products={products}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onQuickOrder={(p) => setOrderTargetProduct(p)}
                onGoToSellerDashboard={() => setCurrentTab("seller")}
              />
            )}

            {/* View 2: Seller Dashboard */}
            {currentTab === "seller" && (
              <SellerDashboard
                currentUser={currentUser}
                products={products}
                orders={orders}
                payments={payments}
                onActivateSeller={handleActivateSeller}
                onOpenPublishModal={() => setIsPublishModalOpen(true)}
                onUpdateProductStatus={handleUpdateProductStatus}
                onDeleteProduct={handleDeleteProduct}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onUpdateProfile={handleUpdateSellerProfile}
                isLoading={isLoading}
              />
            )}

            {/* View 3: Buyer Orders */}
            {currentTab === "orders" && (
              <MyOrdersView
                currentUser={currentUser}
                orders={orders}
                onRefresh={() => fetchOrders(currentUser.uid)}
                isLoading={isLoading}
              />
            )}

            {/* View 4: Admin Dashboard */}
            {currentTab === "admin" && currentUser.role === "ADMIN" && (
              <AdminDashboard
                currentUser={currentUser}
                products={products}
                onRefreshAll={() => {
                  fetchProducts();
                  loadUserData(currentUser.uid, currentUser.username);
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        currentUser={currentUser}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOrder={(p) => setOrderTargetProduct(p)}
        onReport={(p) => setReportTargetProduct(p)}
      />

      {/* Direct Order / Booking Modal */}
      <OrderModal
        product={orderTargetProduct}
        currentUser={currentUser}
        isOpen={!!orderTargetProduct}
        onClose={() => setOrderTargetProduct(null)}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* Publish New Product / Service Modal (0.00001 Pi fee) */}
      {currentUser && (
        <PublishProductModal
          currentUser={currentUser}
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          onSuccess={async () => {
            await fetchProducts();
            if (currentUser) {
              await fetchPayments(currentUser.uid);
            }
          }}
        />
      )}

      {/* Report Modal */}
      <ReportModal
        product={reportTargetProduct}
        currentUser={currentUser}
        isOpen={!!reportTargetProduct}
        onClose={() => setReportTargetProduct(null)}
        onSubmitReport={handleSubmitReport}
      />

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/80 bg-white space-y-2">
        <p className="font-semibold text-slate-700">
          Pi Market — Place de Marché Décentralisée de Produits & Services
        </p>
        <p className="text-[11px] text-slate-400">
          Propulsé par le SDK Pi Network v2.0 • Micro-frais sécurisés côté serveur
        </p>
        <div>
          <button
            onClick={() => setShowPiTest(true)}
            className="text-[11px] text-purple-700 hover:text-purple-900 underline font-medium cursor-pointer"
          >
            Ouvrir la page de test isolée Pi SDK (/pi-test)
          </button>
        </div>
      </footer>

      {/* On-Screen Mobile Debug Logs Overlay */}
      <div className="fixed bottom-3 right-3 z-50 max-w-sm w-[calc(100vw-24px)] md:w-96 shadow-2xl rounded-xl border border-slate-700 bg-slate-900/95 text-slate-100 backdrop-blur-md text-xs overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-emerald-400 tracking-wide">Journal Pi SDK Mobile</span>
            <span className="text-[10px] text-slate-400">({logs.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setLogs([])}
              className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-[10px] text-slate-300 transition-colors"
              title="Effacer les logs"
            >
              Effacer
            </button>
            <button
              onClick={() => setShowLogsOverlay(!showLogsOverlay)}
              className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-[10px] text-slate-300 font-bold transition-colors"
            >
              {showLogsOverlay ? "Réduire" : "Développer"}
            </button>
          </div>
        </div>

        {showLogsOverlay && (
          <div className="p-3 max-h-52 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 select-text">
            {logs.length === 0 ? (
              <p className="text-slate-500 italic">En attente des événements Pi SDK...</p>
            ) : (
              logs.map((logItem, idx) => (
                <div
                  key={idx}
                  className={`break-all py-0.5 border-b border-slate-800/50 last:border-none ${
                    logItem.includes("ERREUR") || logItem.includes("Erreur")
                      ? "text-rose-400 font-semibold"
                      : logItem.includes("RÉUSSIE") || logItem.includes("terminé") || logItem.includes("disponible")
                      ? "text-emerald-300"
                      : logItem.includes("[LOGIN]") || logItem.includes("AUTHENTIFICATION")
                      ? "text-amber-300 font-medium"
                      : "text-slate-300"
                  }`}
                >
                  {logItem}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

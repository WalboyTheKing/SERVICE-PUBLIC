import React, { useState, useEffect } from "react";
import { UserAccount, ProductItem, ReportItem, PaymentRecord, AdminStats } from "../types";
import {
  ShieldAlert,
  Users,
  Package,
  ShoppingBag,
  Receipt,
  CheckCircle,
  XCircle,
  Trash2,
  Crown,
  RefreshCw,
  Search,
  Eye,
  Lock,
  Unlock,
  AlertTriangle,
  Sparkles
} from "lucide-react";

interface AdminDashboardProps {
  currentUser: UserAccount;
  products: ProductItem[];
  onRefreshAll: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  products,
  onRefreshAll,
}) => {
  const [adminTab, setAdminTab] = useState<"stats" | "moderation" | "products" | "users" | "payments">("stats");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, reportsRes, usersRes, paymentsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/reports"),
        fetch("/api/admin/users"),
        fetch("/api/admin/payments"),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (reportsRes.ok) setReports(await reportsRes.json());
      if (usersRes.ok) setUsersList(await usersRes.json());
      if (paymentsRes.ok) setPaymentsList(await paymentsRes.json());
    } catch (err) {
      console.error("Erreur récupération données admin:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResolveReport = async (reportId: number, action: 'resolved' | 'dismissed', deleteProduct: boolean = false) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, deleteProduct }),
      });
      if (res.ok) {
        await fetchAdminData();
        onRefreshAll();
      }
    } catch (err) {
      console.error("Erreur résolution signalement:", err);
    }
  };

  const handleToggleUserSeller = async (user: UserAccount) => {
    try {
      const res = await fetch(`/api/admin/users/${user.uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_seller: !user.is_seller }),
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error("Erreur toggle seller:", err);
    }
  };

  const handleToggleUserBan = async (user: UserAccount) => {
    try {
      const res = await fetch(`/api/admin/users/${user.uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_banned: !user.is_banned }),
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error("Erreur toggle ban:", err);
    }
  };

  const handleDeleteProductAdmin = async (productId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette annonce ?")) return;
    try {
      const res = await fetch(`/api/products/${productId}?uid=${encodeURIComponent(currentUser.uid)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchAdminData();
        onRefreshAll();
      }
    } catch (err) {
      console.error("Erreur suppression produit:", err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-left space-y-6">
      {/* Admin Title Bar */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-900 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-purple-950 flex items-center justify-center font-black text-xl shadow-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-white">
                Centre d'Administration Pi Market
              </h2>
              <span className="bg-amber-400 text-purple-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Admin Root
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-0.5">
              Supervision de la marketplace, modération des signalements, gestion des utilisateurs et audit des paiements Pi.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={isLoading}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto border border-white/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto text-xs font-bold gap-1">
        <button
          onClick={() => setAdminTab("stats")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            adminTab === "stats" ? "bg-[#5c2d91] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Statistiques & Vue globale</span>
        </button>

        <button
          onClick={() => setAdminTab("moderation")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer relative ${
            adminTab === "moderation" ? "bg-[#5c2d91] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Signalements & Modération</span>
          {reports.filter((r) => r.status === "pending").length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white">
              {reports.filter((r) => r.status === "pending").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab("products")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            adminTab === "products" ? "bg-[#5c2d91] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Tous les Produits ({products.length})</span>
        </button>

        <button
          onClick={() => setAdminTab("users")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            adminTab === "users" ? "bg-[#5c2d91] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Utilisateurs ({usersList.length})</span>
        </button>

        <button
          onClick={() => setAdminTab("payments")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            adminTab === "payments" ? "bg-[#5c2d91] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Paiements Pi ({paymentsList.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW STATS */}
      {adminTab === "stats" && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Utilisateurs Inscrits
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {stats.total_users}
              </p>
              <span className="text-[11px] text-purple-700 font-bold mt-1 block">
                {stats.total_sellers} vendeurs activés
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Annonces Publiées
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {stats.total_products}
              </p>
              <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
                Disponibles sur le marché
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Commandes Passées
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {stats.total_orders}
              </p>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                Total transactions directes
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50/50 to-amber-50/50 shadow-xs">
              <span className="text-[10px] text-purple-900 uppercase font-bold tracking-wider">
                Frais Pi Encaissés
              </span>
              <p className="text-2xl font-black text-[#5c2d91] mt-1">
                {stats.total_pi_fees} π
              </p>
              <span className="text-[11px] text-amber-700 font-bold mt-1 block">
                Via Pi SDK blockchain
              </span>
            </div>
          </div>

          {/* Recent Payments Table in Stats */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 mb-3">
              Derniers micro-paiements vérifiés
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {stats.recent_payments.length === 0 ? (
                <p className="text-slate-400 py-4 text-center">Aucun paiement récent</p>
              ) : (
                stats.recent_payments.slice(0, 5).map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">
                        @{p.username} • {p.purpose}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        TxID: {p.txid}
                      </span>
                    </div>
                    <span className="font-black text-[#5c2d91]">
                      {p.amount} π
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODERATION & REPORTS */}
      {adminTab === "moderation" && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Aucun signalement en attente
              </h3>
              <p className="text-xs text-slate-500">
                La communauté Pi Market est saine et aucun abus n'est actuellement signalé.
              </p>
            </div>
          ) : (
            reports.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-900">
                        Motif : {r.reason}
                      </span>
                      <span className="text-xs text-slate-400">
                        Signalé par @{r.reporter_username} le {new Date(r.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm mt-1">
                      Produit #{r.product_id} : "{r.product_title}" (Vendeur: @{r.seller_username})
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      r.status === "pending"
                        ? "bg-amber-100 text-amber-900"
                        : r.status === "resolved"
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                {r.details && (
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <strong>Détails du plaignant :</strong> {r.details}
                  </p>
                )}

                {r.status === "pending" && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleResolveReport(r.id, "dismissed", false)}
                      className="px-3 py-1.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 text-xs cursor-pointer"
                    >
                      Rejeter le signalement
                    </button>
                    <button
                      onClick={() => handleResolveReport(r.id, "resolved", true)}
                      className="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer shadow-xs"
                    >
                      Supprimer le produit & Résoudre
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: PRODUCTS MANAGEMENT */}
      {adminTab === "products" && (
        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 truncate">
                    #{p.id} {p.title}
                  </span>
                  <span className="text-[10px] text-purple-800 font-semibold bg-purple-50 px-2 py-0.5 rounded">
                    {p.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Vendeur : @{p.seller_username} • Prix : <strong>{p.price_pi} π</strong> • {p.views_count} vues
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDeleteProductAdmin(p.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 cursor-pointer"
                  title="Supprimer l'annonce"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: USERS MANAGEMENT */}
      {adminTab === "users" && (
        <div className="space-y-3">
          {usersList.map((u) => (
            <div
              key={u.uid}
              className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900">
                    @{u.username}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {u.role}
                  </span>
                  {u.is_seller && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      ✓ Vendeur
                    </span>
                  )}
                  {u.is_banned && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      Banni
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  UID: {u.uid}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleUserSeller(u)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[11px] cursor-pointer transition-colors ${
                    u.is_seller
                      ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                      : "bg-purple-100 text-purple-900 hover:bg-purple-200"
                  }`}
                >
                  {u.is_seller ? "Désactiver Vendeur" : "Activer Vendeur"}
                </button>

                <button
                  onClick={() => handleToggleUserBan(u)}
                  className={`p-1.5 rounded-xl font-bold text-[11px] cursor-pointer ${
                    u.is_banned ? "text-emerald-600 hover:bg-emerald-50" : "text-rose-600 hover:bg-rose-50"
                  }`}
                  title={u.is_banned ? "Débannir" : "Bannir"}
                >
                  {u.is_banned ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: PAYMENTS AUDIT */}
      {adminTab === "payments" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900">
            Grand Livre des Micro-Paiements Pi Network
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {paymentsList.length === 0 ? (
              <p className="py-6 text-center text-slate-400">Aucun paiement enregistré</p>
            ) : (
              paymentsList.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 block">
                      @{p.username} • {p.purpose}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      TxID: {p.txid} • {new Date(p.created_at).toLocaleString("fr-FR")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#5c2d91] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 inline-block">
                      {p.amount} π
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block">
                      ✓ Validé
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

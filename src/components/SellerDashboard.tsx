import React, { useState } from "react";
import { UserAccount, ProductItem, OrderRequest, PaymentRecord } from "../types";
import {
  Store,
  PlusCircle,
  Package,
  ShoppingBag,
  Receipt,
  Settings,
  ShieldCheck,
  Star,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  MapPin,
  ExternalLink,
  MessageCircle,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  Check,
  AlertCircle
} from "lucide-react";

interface SellerDashboardProps {
  currentUser: UserAccount;
  products: ProductItem[];
  orders: OrderRequest[];
  payments: PaymentRecord[];
  onActivateSeller: () => void;
  onOpenPublishModal: () => void;
  onUpdateProductStatus: (id: number, status: 'available' | 'sold' | 'archived') => void;
  onDeleteProduct: (id: number) => void;
  onUpdateOrderStatus: (orderId: number, status: 'accepted' | 'completed' | 'cancelled') => void;
  onUpdateProfile: (profileData: {
    shop_name: string;
    bio: string;
    city: string;
    country: string;
    whatsapp: string;
    telegram: string;
    phone: string;
  }) => Promise<boolean>;
  isLoading: boolean;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  currentUser,
  products,
  orders,
  payments,
  onActivateSeller,
  onOpenPublishModal,
  onUpdateProductStatus,
  onDeleteProduct,
  onUpdateOrderStatus,
  onUpdateProfile,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<"listings" | "orders" | "payments" | "profile">("listings");

  // Profile Edit State
  const [shopName, setShopName] = useState(currentUser.profile?.shop_name || "");
  const [bio, setBio] = useState(currentUser.profile?.bio || "");
  const [city, setCity] = useState(currentUser.profile?.city || "");
  const [country, setCountry] = useState(currentUser.profile?.country || "");
  const [whatsapp, setWhatsapp] = useState(currentUser.profile?.whatsapp || "");
  const [telegram, setTelegram] = useState(currentUser.profile?.telegram || "");
  const [phone, setPhone] = useState(currentUser.profile?.phone || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  const myProducts = products.filter((p) => p.seller_uid === currentUser.uid);
  const myReceivedOrders = orders.filter((o) => o.seller_uid === currentUser.uid);
  const mySellerPayments = payments.filter((p) => p.user_uid === currentUser.uid);
  const pendingOrdersCount = myReceivedOrders.filter((o) => o.status === "pending").length;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    const ok = await onUpdateProfile({
      shop_name: shopName.trim(),
      bio: bio.trim(),
      city: city.trim(),
      country: country.trim(),
      whatsapp: whatsapp.trim(),
      telegram: telegram.trim(),
      phone: phone.trim(),
    });
    setProfileSaving(false);
    if (ok) {
      setProfileSavedMsg(true);
      setTimeout(() => setProfileSavedMsg(false), 2500);
    }
  };

  // IF NOT ACTIVATED AS SELLER YET: SHOW SELLER PAYWALL
  if (!currentUser.is_seller) {
    return (
      <div className="w-full max-w-xl mx-auto text-left py-6">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-purple-100 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Accès Espace Vendeur</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-[#5c2d91]">0.0001 π</span>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Paiement Unique à Vie
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-snug mb-2">
            Devenez Vendeur Certifié sur Pi Market
          </h2>

          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            Activez votre statut vendeur pour débloquer votre boutique en ligne, publier des produits physiques et proposer vos prestations de services aux millions de pionniers du réseau Pi.
          </p>

          {/* Benefits */}
          <div className="bg-purple-50/60 rounded-2xl p-5 border border-purple-100 mb-6 space-y-3">
            <div className="text-xs font-black text-purple-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Avantages de l'activation vendeur :</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                <span><strong>Statut permanent :</strong> Ne repayez jamais les 0.0001 Pi d'accès.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                <span><strong>Mise en ligne anti-spam :</strong> Publication flexible à seulement 0.00001 Pi par produit.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                <span><strong>Profil & Badge Vendeur :</strong> Boutique personnalisée avec liens WhatsApp & Télégram directs.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                <span><strong>Gestion des commandes :</strong> Suivi des demandes d'achat et carnet de vente Pi.</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <button
            id="btn-activate-seller"
            onClick={onActivateSeller}
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-[#5c2d91] hover:bg-[#472272] text-white font-black text-sm shadow-xl shadow-purple-900/20 flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                <span>Validation du paiement Pi...</span>
              </>
            ) : (
              <>
                <div className="w-6 h-6 rounded-lg bg-amber-400 text-purple-950 font-black text-sm flex items-center justify-center">
                  π
                </div>
                <span>Payer 0.0001 π & Activer mon Compte Vendeur</span>
                <ArrowRight className="w-4 h-4 text-amber-300 ml-auto" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ACTIVATED SELLER VIEW
  return (
    <div className="w-full max-w-4xl mx-auto text-left space-y-6">
      {/* Seller Header Summary Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#5c2d91] text-amber-300 flex items-center justify-center font-black text-xl border-2 border-amber-300 shadow-md">
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 leading-tight">
                {currentUser.profile?.shop_name || `Boutique de @${currentUser.username}`}
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Vendeur Actif
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              @{currentUser.username} {currentUser.profile?.city && `• ${currentUser.profile.city}`}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span className="flex items-center text-amber-600 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 mr-1" />
                {currentUser.profile?.rating || 5.0} / 5.0
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-semibold">
                {currentUser.profile?.total_sales || 0} ventes réalisées
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action: Publish */}
        <button
          id="btn-seller-publish-new"
          onClick={onOpenPublishModal}
          className="px-5 py-3 rounded-2xl bg-[#5c2d91] hover:bg-[#472272] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-amber-300" />
          <span>Publier un article (0.00001 π)</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto text-xs font-bold gap-1">
        <button
          onClick={() => setActiveTab("listings")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "listings"
              ? "bg-[#5c2d91] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Mes Annonces</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-900/30 text-white">
            {myProducts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "orders"
              ? "bg-[#5c2d91] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Commandes Reçues</span>
          {pendingOrdersCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white animate-pulse">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "payments"
              ? "bg-[#5c2d91] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Historique Pi</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-[#5c2d91] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Boutique & Coordonnées</span>
        </button>
      </div>

      {/* TAB 1: MY LISTINGS */}
      {activeTab === "listings" && (
        <div className="space-y-4">
          {myProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
              <Package className="w-12 h-12 text-purple-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Vous n'avez pas encore d'annonce publiée
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Mettez en vente vos produits ou services sur le marché public pour 0.00001 Pi par publication.
              </p>
              <button
                onClick={onOpenPublishModal}
                className="px-5 py-2.5 bg-[#5c2d91] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Créer ma première annonce
              </button>
            </div>
          ) : (
            myProducts.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 flex-1">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-purple-50 text-purple-900 font-bold flex items-center justify-center text-xs shrink-0 border border-purple-100">
                      π Market
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          item.status === "available"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "sold"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.status === "available" ? "● En vente" : item.status === "sold" ? "Vendu" : "Archivé"}
                      </span>
                    </div>

                    <h4 className="font-black text-slate-900 text-sm">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="font-black text-[#5c2d91] text-xs">
                        {item.price_pi} π
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.views_count || 0} vues
                      </span>
                      <span>•</span>
                      <span>
                        Publié le {new Date(item.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.status === "available" ? (
                    <button
                      onClick={() => onUpdateProductStatus(item.id, "sold")}
                      className="px-3 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl cursor-pointer"
                    >
                      Marquer Vendu
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateProductStatus(item.id, "available")}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl cursor-pointer"
                    >
                      Remettre en vente
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteProduct(item.id)}
                    title="Supprimer l'annonce"
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: RECEIVED ORDERS */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {myReceivedOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
              <ShoppingBag className="w-12 h-12 text-purple-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Aucune commande ou demande pour le moment
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Dès qu'un acheteur passera une commande sur vos articles, elle apparaîtra ici avec ses coordonnées directes.
              </p>
            </div>
          ) : (
            myReceivedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Commande #{order.id} • {new Date(order.created_at).toLocaleDateString("fr-FR")}
                    </span>
                    <h4 className="font-black text-slate-900 text-sm">
                      {order.product_title}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-[#5c2d91]">
                      {order.product_price_pi} π
                    </span>
                    <span
                      className={`block text-[10px] font-bold uppercase tracking-wider ${
                        order.status === "pending"
                          ? "text-amber-600"
                          : order.status === "accepted"
                          ? "text-purple-700"
                          : order.status === "completed"
                          ? "text-emerald-700"
                          : "text-slate-400"
                      }`}
                    >
                      {order.status === "pending"
                        ? "En attente"
                        : order.status === "accepted"
                        ? "Acceptée"
                        : order.status === "completed"
                        ? "Complétée"
                        : "Annulée"}
                    </span>
                  </div>
                </div>

                {/* Buyer info & message */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Acheteur : @{order.buyer_username}
                    </span>
                    <span className="text-purple-900 font-semibold flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {order.buyer_contact}
                    </span>
                  </div>
                  {order.delivery_location && (
                    <p className="text-slate-600">
                      <strong>Lieu de livraison :</strong> {order.delivery_location}
                    </p>
                  )}
                  {order.buyer_message && (
                    <p className="text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100">
                      "{order.buyer_message}"
                    </p>
                  )}
                </div>

                {/* Status action buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {order.status === "pending" && (
                    <>
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, "cancelled")}
                        className="px-3 py-1.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 text-xs cursor-pointer"
                      >
                        Refuser
                      </button>
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, "accepted")}
                        className="px-4 py-1.5 rounded-xl bg-purple-100 text-purple-900 hover:bg-purple-200 font-bold text-xs cursor-pointer"
                      >
                        Accepter la commande
                      </button>
                    </>
                  )}

                  {order.status === "accepted" && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, "completed")}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer shadow-xs"
                    >
                      ✓ Marquer comme livrée / terminée
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: PI PAYMENTS AUDIT */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Historique des Paiements Pi Network
            </h3>
            <p className="text-xs text-slate-500">
              Reçus de vos micro-paiements pour l'activation vendeur et la mise en ligne d'annonces.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {mySellerPayments.length === 0 ? (
              <p className="py-6 text-center text-slate-400">
                Aucun historique de paiement pour l'instant.
              </p>
            ) : (
              mySellerPayments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">
                      {p.purpose === "SELLER_ACTIVATION"
                        ? "Activation Compte Vendeur à Vie"
                        : p.purpose === "PRODUCT_PUBLICATION"
                        ? `Frais de mise en ligne : ${p.product_title || "Article"}`
                        : "Option Premium"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      TxID: {p.txid} • {new Date(p.created_at).toLocaleString("fr-FR")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#5c2d91] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 inline-block">
                      {p.amount} π
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                      ✓ Validé
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: STORE PROFILE CONFIG */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900">
              Paramètres de votre Boutique Vendeur
            </h3>
            <p className="text-xs text-slate-500">
              Ces coordonnées s'afficheront sur vos fiches produits pour permettre aux pionniers de vous joindre.
            </p>
          </div>

          {profileSavedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl mb-4 flex items-center gap-2 font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Modifications enregistrées avec succès !</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nom de votre boutique / Enseigne commerciale
              </label>
              <input
                type="text"
                placeholder="Ex: High-Tech Pi Express, Atelier Cuir & Mode..."
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Biographie / Présentation de votre activité
              </label>
              <textarea
                rows={3}
                placeholder="Décrivez votre expérience, votre rapidité de livraison ou vos conditions de service..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ville principale
                </label>
                <input
                  type="text"
                  placeholder="Ex: Paris, Abidjan, Lyon..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pays
                </label>
                <input
                  type="text"
                  placeholder="Ex: France, Côte d'Ivoire..."
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  WhatsApp vendeur
                </label>
                <input
                  type="text"
                  placeholder="+33612345678"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Telegram
                </label>
                <input
                  type="text"
                  placeholder="@mon_pseudo"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Téléphone direct
                </label>
                <input
                  type="text"
                  placeholder="+33 6 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-2.5 bg-[#5c2d91] hover:bg-[#472272] text-white font-black rounded-xl cursor-pointer shadow-md disabled:opacity-50"
              >
                {profileSaving ? "Enregistrement..." : "Sauvegarder ma boutique"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

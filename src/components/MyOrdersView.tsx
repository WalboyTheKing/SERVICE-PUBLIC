import React from "react";
import { OrderRequest, UserAccount } from "../types";
import { ShoppingBag, Clock, CheckCircle, XCircle, MessageCircle, MapPin, ExternalLink, RefreshCw } from "lucide-react";

interface MyOrdersViewProps {
  currentUser: UserAccount;
  orders: OrderRequest[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({
  currentUser,
  orders,
  onRefresh,
  isLoading,
}) => {
  const mySentOrders = orders.filter((o) => o.buyer_uid === currentUser.uid);

  return (
    <div className="w-full max-w-4xl mx-auto text-left space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 leading-tight">
              Mes Commandes & Réservations
            </h2>
            <span className="bg-purple-100 text-purple-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {mySentOrders.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Suivez l'état de vos demandes d'achats et prises de contact auprès des vendeurs Pi.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {mySentOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
            <ShoppingBag className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Vous n'avez pas encore passé de commande
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              Explorez le marché public, sélectionnez un produit ou service et envoyez votre demande directement au vendeur en quelques secondes.
            </p>
          </div>
        ) : (
          mySentOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Commande #{order.id}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-500">
                      Passée le {new Date(order.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-base mt-0.5">
                    {order.product_title}
                  </h3>
                  <p className="text-xs text-purple-900 font-semibold mt-0.5">
                    Vendeur : @{order.seller_username}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-base font-black text-[#5c2d91] bg-purple-50 px-3 py-1 rounded-xl border border-purple-200 inline-block shadow-2xs">
                    {order.product_price_pi} π
                  </span>
                  <div className="mt-1">
                    {order.status === "pending" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                        <Clock className="w-3 h-3" />
                        En attente du vendeur
                      </span>
                    )}
                    {order.status === "accepted" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-md border border-purple-200">
                        <CheckCircle className="w-3 h-3 text-purple-600" />
                        Acceptée par le vendeur
                      </span>
                    )}
                    {order.status === "completed" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Terminée / Livrée
                      </span>
                    )}
                    {order.status === "cancelled" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        Annulée
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details and Message */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <p className="text-slate-700">
                  <strong>Votre contact fourni :</strong> {order.buyer_contact}
                </p>
                {order.delivery_location && (
                  <p className="text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-700" />
                    <span><strong>Lieu :</strong> {order.delivery_location}</span>
                  </p>
                )}
                {order.buyer_message && (
                  <p className="text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100">
                    "{order.buyer_message}"
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { ProductItem, PiUser } from "../types";
import { Send, X, ShoppingBag, MapPin, MessageSquare, Phone, CheckCircle } from "lucide-react";

interface OrderModalProps {
  product: ProductItem | null;
  currentUser: PiUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitOrder: (data: {
    product_id: number;
    buyer_contact: string;
    buyer_message: string;
    delivery_location?: string;
  }) => Promise<boolean>;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  product,
  currentUser,
  isOpen,
  onClose,
  onSubmitOrder,
}) => {
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) {
      setError("Veuillez fournir un moyen de contact direct (WhatsApp, Télégram, Téléphone ou Email).");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const ok = await onSubmitOrder({
      product_id: product.id,
      buyer_contact: contact.trim(),
      buyer_message: message.trim(),
      delivery_location: location.trim() || undefined,
    });

    setIsSubmitting(false);

    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setContact("");
        setMessage("");
        setLocation("");
        onClose();
      }, 2000);
    } else {
      setError("Erreur lors de la transmission de la commande.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 animate-fadeIn text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#5c2d91] flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 leading-tight">
                {product.type === "service" ? "Demander une prestation" : "Commander cet article"}
              </h3>
              <p className="text-[11px] text-slate-400">
                Transmission directe au vendeur @{product.seller_username}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3 animate-bounce" />
            <h4 className="font-black text-slate-900 text-base mb-1">
              Demande envoyée avec succès !
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Le vendeur a été notifié de votre demande. Il prendra contact avec vous très rapidement via les coordonnées fournies.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Product recap pill */}
            <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-700 block">
                  {product.category}
                </span>
                <p className="font-bold text-slate-800 text-xs line-clamp-1">
                  {product.title}
                </p>
                <span className="text-[11px] text-slate-500">
                  Vendeur : <strong>@{product.seller_username}</strong>
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base font-black text-[#5c2d91] bg-white px-2.5 py-1 rounded-xl border border-purple-200 shadow-2xs block">
                  {product.price_pi} π
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
                {error}
              </div>
            )}

            {/* Buyer contact */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-purple-700" />
                Votre contact direct (WhatsApp, Télégram, Téléphone ou Email) *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: https://wa.me/33612345678, @mon_telegram, ou +33 6 12 34 56 78"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
              />
            </div>

            {/* Delivery address / Zone */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-purple-700" />
                Adresse de livraison ou Ville souhaitée
              </label>
              <input
                type="text"
                placeholder="Ex: Paris 15ème, Abidjan Cocody, ou Remise en main propre"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
              />
            </div>

            {/* Message to seller */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-purple-700" />
                Message / Précisions pour le vendeur
              </label>
              <textarea
                rows={3}
                placeholder="Indiquez vos disponibilités, quantité souhaitée, questions particulières..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500">
              💡 Le règlement s'effectue directement en Pi Network selon les modalités convenues avec le vendeur lors de la livraison ou prestation.
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#5c2d91] hover:bg-[#472272] text-white font-black flex items-center gap-2 shadow-lg shadow-purple-900/20 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>{isSubmitting ? "Envoi..." : "Confirmer ma demande"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

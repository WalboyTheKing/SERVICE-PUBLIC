import React, { useState } from "react";
import { ProductItem, PiUser, ReportReason } from "../types";
import { AlertTriangle, X, ShieldAlert, CheckCircle } from "lucide-react";

interface ReportModalProps {
  product: ProductItem | null;
  currentUser: PiUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (data: {
    product_id: number;
    reason: ReportReason;
    details: string;
  }) => Promise<boolean>;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  product,
  currentUser,
  isOpen,
  onClose,
  onSubmitReport,
}) => {
  const [reason, setReason] = useState<ReportReason>("scam");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const ok = await onSubmitReport({
      product_id: product.id,
      reason,
      details: details.trim(),
    });

    setIsSubmitting(false);

    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDetails("");
        onClose();
      }, 2000);
    } else {
      setError("Une erreur est survenue lors de l'envoi du signalement.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2 text-rose-700">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-black text-base text-slate-900">
              Signaler une annonce
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              Signalement envoyé
            </h4>
            <p className="text-xs text-slate-500">
              Merci pour votre contribution. Notre équipe de modération va examiner cette annonce sous peu.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Annonce concernée
              </span>
              <p className="font-bold text-slate-800 text-xs truncate">
                {product.title}
              </p>
              <span className="text-[11px] text-purple-900 font-semibold">
                Vendeur : @{product.seller_username}
              </span>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Motif du signalement *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
              >
                <option value="scam">Arnaque / Faux vendeur</option>
                <option value="fake_item">Produit contrefait ou trompeur</option>
                <option value="prohibited">Article ou service illégal / interdit</option>
                <option value="incorrect_price">Prix ou modalité abusive</option>
                <option value="offensive">Contenu offensant ou inapproprié</option>
                <option value="other">Autre motif</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Précisions & Détails (facultatif)
              </label>
              <textarea
                rows={3}
                placeholder="Décrivez brièvement le problème rencontré avec cette annonce..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Envoi..." : "Envoyer le signalement"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

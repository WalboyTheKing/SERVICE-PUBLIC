import React, { useState } from "react";
import { ProductItem, PiUser } from "../types";
import {
  X,
  MapPin,
  Tag,
  ShieldCheck,
  Star,
  MessageCircle,
  Phone,
  Send,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Sparkles,
  Calendar,
  Eye,
  Store,
  Crown
} from "lucide-react";

interface ProductDetailModalProps {
  product: ProductItem | null;
  currentUser: PiUser | null;
  isOpen: boolean;
  onClose: () => void;
  onOrder: (product: ProductItem) => void;
  onReport: (product: ProductItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currentUser,
  isOpen,
  onClose,
  onOrder,
  onReport,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  const isAuthor = currentUser?.uid === product.seller_uid;

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case "new":
        return "✨ Neuf / Sous emballage";
      case "used_like_new":
        return "💎 Comme neuf (Parfait état)";
      case "used_good":
        return "👍 Bon état d'usage";
      case "service":
        return "🛠️ Prestation / Service";
      default:
        return condition;
    }
  };

  const getContactUrl = (contact?: string) => {
    if (!contact) return null;
    const trimmed = contact.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    if (trimmed.startsWith("@")) return `https://t.me/${trimmed.replace("@", "")}`;
    if (trimmed.toLowerCase().includes("t.me/")) return `https://${trimmed.replace(/^https?:\/\//, "")}`;
    if (/^[0-9+ ]{8,}$/.test(trimmed)) {
      const clean = trimmed.replace(/[^0-9]/g, "");
      return `https://wa.me/${clean}`;
    }
    if (trimmed.includes("@") && trimmed.includes(".")) {
      return `mailto:${trimmed}?subject=Pi%20Market:%20${encodeURIComponent(product.title)}`;
    }
    return null;
  };

  const primaryContact = product.contact_whatsapp || product.contact_telegram || product.contact_phone || product.contact_email;
  const contactUrl = getContactUrl(primaryContact);

  const handleCopyContact = () => {
    if (primaryContact) {
      navigator.clipboard.writeText(primaryContact);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-6 overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn text-left flex flex-col max-h-[90vh]">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase font-bold tracking-wider bg-purple-100 text-purple-900 px-2.5 py-1 rounded-lg">
              {product.category}
            </span>
            {product.is_featured && (
              <span className="text-[11px] font-black bg-gradient-to-r from-amber-400 to-amber-300 text-purple-950 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
                <Crown className="w-3 h-3 fill-purple-950" />
                Certifié Pro
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Main Photo if available */}
          {product.image_url && (
            <div className="w-full h-64 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner relative group">
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{product.views_count || 1} vues</span>
              </div>
            </div>
          )}

          {/* Title & Price Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1.5 flex-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {product.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-slate-500 text-xs">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-700" />
                  <span>{product.location || "Monde entier"}</span>
                </span>
                <span>•</span>
                <span className="font-semibold text-slate-700">
                  {getConditionLabel(product.condition)}
                </span>
                <span>•</span>
                <span>
                  Publié le {new Date(product.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="text-2xl sm:text-3xl font-black text-[#5c2d91] bg-purple-50 px-4 py-2 rounded-2xl border border-purple-200 inline-block shadow-xs">
                {product.price_pi} π
              </div>
              <span className="text-[10px] text-slate-400 block mt-1 uppercase font-bold">
                Prix direct en Pi
              </span>
            </div>
          </div>

          {/* Seller Profile Card */}
          <div className="bg-gradient-to-r from-purple-50 via-slate-50 to-amber-50/40 p-4 rounded-2xl border border-purple-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#5c2d91] text-amber-300 flex items-center justify-center font-black text-lg border-2 border-amber-300 shadow-md">
                {product.seller_username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-black text-slate-900 text-sm">
                  <span>@{product.seller_username}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  {product.seller_store_name || "Boutique certifiée Pi Network"}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                  <span className="flex items-center text-amber-600 font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500 mr-0.5" />
                    {product.seller_rating || 5.0} / 5.0
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    ✓ Vendeur vérifié
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Contact links */}
            <div className="flex items-center gap-2">
              {contactUrl ? (
                <a
                  href={contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-purple-50 text-slate-800 font-bold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-purple-700" />
                  <span>Contacter</span>
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              ) : primaryContact ? (
                <button
                  onClick={handleCopyContact}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-purple-50 text-slate-800 font-bold border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copié" : "Copier contact"}</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <h4 className="font-black text-slate-900 text-sm mb-2 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-purple-700" />
              <span>Description détaillée</span>
            </h4>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-slate-700 leading-relaxed whitespace-pre-line text-xs font-normal">
              {product.description}
            </div>
          </div>

          {/* Security tips */}
          <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl text-[11px] text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Sécurité Pi Market :</strong> Effectuez toujours vos transferts Pi dans l'écosystème sécurisé. Ne communiquez jamais vos mots de passe ou phrases secrètes (passphrase).
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between gap-3">
          <button
            onClick={() => onReport(product)}
            className="text-slate-400 hover:text-rose-600 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Signaler un abus</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Fermer
            </button>

            {!isAuthor ? (
              <button
                onClick={() => {
                  onClose();
                  onOrder(product);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#5c2d91] hover:bg-[#472272] text-white font-black flex items-center gap-2 shadow-lg shadow-purple-900/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>
                  {product.type === "service" ? "Demander ce service" : "Commander (Acheter)"}
                </span>
              </button>
            ) : (
              <span className="px-4 py-2 rounded-xl bg-purple-50 text-purple-900 font-bold border border-purple-200">
                Votre annonce
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

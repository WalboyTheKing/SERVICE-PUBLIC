import React, { useState } from "react";
import { PiUser, ItemType, ItemCondition, ProductItem } from "../types";
import { executePiPayment, isPiBrowserAvailable } from "../pi-sdk-helper";
import {
  PlusCircle,
  X,
  Sparkles,
  MapPin,
  Tag,
  DollarSign,
  Image as ImageIcon,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Zap,
  ArrowRight
} from "lucide-react";

interface PublishProductModalProps {
  currentUser: PiUser;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProduct: ProductItem) => void;
}

const CATEGORIES = [
  "Électronique & High-Tech",
  "Informatique & Téléphonie",
  "Mode & Habillement",
  "Alimentation & Produits Locaux",
  "Maison, Déco & Meubles",
  "Services & Artisans",
  "Véhicules & Accessoires",
  "Immobilier & Locations",
  "Santé, Beauté & Bien-être",
  "Autres & Divers",
];

export const PublishProductModal: React.FC<PublishProductModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Électronique & High-Tech");
  const [pricePi, setPricePi] = useState("");
  const [type, setType] = useState<ItemType>("product");
  const [condition, setCondition] = useState<ItemCondition>("new");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");
  const [phone, setPhone] = useState("");

  const [draftProduct, setDraftProduct] = useState<ProductItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Step 1: Create draft on backend
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !pricePi) {
      setError("Veuillez remplir au moins le titre, la description et le prix.");
      return;
    }

    const numericPrice = parseFloat(pricePi);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError("Veuillez saisir un montant en Pi valide supérieur à 0.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/products/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller_uid: currentUser.uid,
          title: title.trim(),
          description: description.trim(),
          category,
          price_pi: numericPrice,
          type,
          condition: type === "service" ? "service" : condition,
          image_url: imageUrl.trim() || undefined,
          location: location.trim() || undefined,
          contact_whatsapp: whatsapp.trim() || undefined,
          contact_telegram: telegram.trim() || undefined,
          contact_phone: phone.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création de l'annonce");
      }

      setDraftProduct(data.product);
      setStep("payment");
    } catch (err: any) {
      setError(err.message || "Erreur de création");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Pay 0.00001 Pi publication fee
  const handlePayPublicationFee = async () => {
    if (!draftProduct) return;
    setIsLoading(true);
    setError(null);

    const completeOnServer = async (paymentId: string, txid?: string) => {
      const res = await fetch("/api/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          txid: txid || `tx_pub_${Date.now()}`,
          uid: currentUser.uid,
          username: currentUser.username,
          purpose: "PRODUCT_PUBLICATION",
          product_id: draftProduct.id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Échec validation paiement");
      }

      const completed = { ...draftProduct, is_published: true };
      setDraftProduct(completed);
      setStep("success");
      onSuccess(completed);
    };

    if (isPiBrowserAvailable()) {
      executePiPayment({
        amount: 0.00001,
        memo: `Frais de mise en ligne Pi Market: ${draftProduct.title.substring(0, 20)}`,
        metadata: {
          uid: currentUser.uid,
          product_id: draftProduct.id,
          purpose: "PRODUCT_PUBLICATION",
        },
        onApprove: async (paymentId) => {
          await fetch("/api/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId }),
          });
        },
        onComplete: async (paymentId, txid) => {
          await completeOnServer(paymentId, txid);
          setIsLoading(false);
        },
        onCancel: () => {
          setIsLoading(false);
          setError("Paiement de mise en ligne annulé.");
        },
        onError: (err) => {
          setIsLoading(false);
          setError(err.message || "Erreur de paiement Pi.");
        },
      });
      return;
    }

    setIsLoading(false);
    setError("Pi Browser requis : veuillez ouvrir l'application dans Pi Browser pour valider votre paiement Pi Mainnet.");
  };

  const handleResetAndClose = () => {
    setStep("form");
    setTitle("");
    setDescription("");
    setPricePi("");
    setImageUrl("");
    setLocation("");
    setDraftProduct(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full my-6 overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn text-left flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#5c2d91] flex items-center justify-center font-black">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base leading-tight">
                Publier sur Pi Market
              </h3>
              <p className="text-[11px] text-slate-500">
                Frais de mise en ligne : <strong>0.00001 π</strong> par annonce
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: FORM */}
          {step === "form" && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* Type selector (Product vs Service) */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setType("product")}
                  className={`py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    type === "product"
                      ? "bg-white text-[#5c2d91] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📦 Produit physique / bien
                </button>
                <button
                  type="button"
                  onClick={() => setType("service")}
                  className={`py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    type === "service"
                      ? "bg-white text-[#5c2d91] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🛠️ Service / Prestation locale
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Titre de l'annonce *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    type === "product"
                      ? "Ex: iPhone 15 Pro Max 256GB, Montre automatique luxe..."
                      : "Ex: Dépannage plomberie express 7j/7, Cours de Maths..."
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
                />
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {type === "product" ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      État du produit *
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as ItemCondition)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
                    >
                      <option value="new">✨ Neuf (Jamais utilisé)</option>
                      <option value="used_like_new">💎 Comme neuf</option>
                      <option value="used_good">👍 Bon état</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Type de service
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Prestation artisanale / numérique"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Price in Pi & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <span className="font-black text-purple-700">π</span>
                    Prix en Pi (π) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Ex: 25.5"
                    value={pricePi}
                    onChange={(e) => setPricePi(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-purple-900 bg-slate-50 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-700" />
                    Ville / Localisation
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Paris 11ème, Abidjan Cocody, ou En ligne..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-purple-700" />
                  Lien URL de la photo (facultatif mais recommandé)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... ou lien de votre image"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Description détaillée de l'article ou du service *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Détaillez les caractéristiques, l'état, les conditions de remise ou d'expédition..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
                />
              </div>

              {/* Contact options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Numéro WhatsApp vendeur
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: +33612345678 ou +22507112233"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Telegram ou Téléphone
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: @mon_pseudo_tg"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 bg-slate-50 focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Footer submit */}
              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#5c2d91] hover:bg-[#472272] text-white font-black flex items-center gap-2 shadow-lg shadow-purple-900/20 cursor-pointer disabled:opacity-50"
                >
                  <span>Continuer vers la mise en ligne (0.00001 π)</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT 0.00001 PI */}
          {step === "payment" && draftProduct && (
            <div className="py-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-purple-950 flex items-center justify-center font-black text-2xl mx-auto shadow-md border-2 border-amber-300">
                π
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900 mb-1">
                  Valider la mise en ligne
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Pour publier votre annonce <strong className="text-purple-900">"{draftProduct.title}"</strong>, réglez les frais symboliques de publication anti-spam.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 max-w-sm mx-auto">
                <span className="text-[10px] text-purple-800 font-bold uppercase tracking-wider block">
                  Frais de publication
                </span>
                <span className="text-2xl font-black text-[#5c2d91]">
                  0.00001 π
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Vérification instantanée sur le serveur Pi Market
                </span>
              </div>

              <button
                onClick={handlePayPublicationFee}
                disabled={isLoading}
                className="w-full max-w-sm mx-auto py-3.5 px-6 rounded-2xl bg-[#5c2d91] hover:bg-[#472272] text-white font-black text-sm shadow-xl shadow-purple-900/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                    <span>Paiement Pi en cours...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Payer 0.00001 π & Mettre en ligne</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400">
                L'annonce sera immédiatement visible par tous les acheteurs du marché public.
              </p>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === "success" && draftProduct && (
            <div className="py-6 text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
              <div>
                <h4 className="text-xl font-black text-slate-900 mb-1">
                  Annonce publiée avec succès !
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Votre article <strong>"{draftProduct.title}"</strong> est désormais actif et disponible pour tous les membres de la communauté Pi Network.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-xl bg-[#5c2d91] hover:bg-[#472272] text-white font-black text-xs cursor-pointer shadow-md"
                >
                  Voir dans la boutique & Espace Vendeur
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

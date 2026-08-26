import React from "react";
import { ProductItem } from "../types";
import {
  MapPin,
  Star,
  ShieldCheck,
  Crown,
  Eye,
  MessageCircle,
  Phone,
  Send,
  ExternalLink,
  Sparkles
} from "lucide-react";

interface ProductCardProps {
  product: ProductItem;
  onSelect: (product: ProductItem) => void;
  onQuickOrder: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickOrder,
}) => {
  const getConditionBadge = (condition: string, type: string) => {
    if (type === "service") {
      return (
        <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md">
          🛠️ Service
        </span>
      );
    }
    switch (condition) {
      case "new":
        return (
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
            ✨ Neuf
          </span>
        );
      case "used_like_new":
        return (
          <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md">
            💎 Comme neuf
          </span>
        );
      case "used_good":
      default:
        return (
          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
            👍 Bon état
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-purple-200 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left"
    >
      {/* Top Media / Thumbnail */}
      <div className="relative w-full h-44 bg-slate-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-slate-100 text-[#5c2d91] p-4 text-center">
            <span className="text-2xl font-black mb-1 opacity-40">π</span>
            <span className="text-[11px] font-bold text-slate-500 line-clamp-1">
              {product.category}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-md">
            {product.category}
          </span>
          {getConditionBadge(product.condition, product.type)}
        </div>

        {product.is_featured && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="text-[10px] font-black bg-amber-400 text-purple-950 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
              <Crown className="w-3 h-3 fill-purple-950" />
              Pro
            </span>
          </div>
        )}

        {/* Views counter */}
        <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>{product.views_count || 1}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Price and location */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-lg font-black text-[#5c2d91] bg-purple-50 px-2.5 py-0.5 rounded-xl border border-purple-100">
              {product.price_pi} π
            </span>
            {product.location && (
              <span className="text-[11px] text-slate-500 flex items-center gap-0.5 truncate max-w-[140px]">
                <MapPin className="w-3 h-3 text-purple-600 shrink-0" />
                <span className="truncate">{product.location}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-[#5c2d91] transition-colors">
            {product.title}
          </h3>

          {/* Short description */}
          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-normal">
            {product.description}
          </p>
        </div>

        {/* Seller footer info */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-purple-100 text-[#5c2d91] flex items-center justify-center font-black text-xs shrink-0">
              {product.seller_username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-800 text-[11px] block truncate">
                @{product.seller_username}
              </span>
              <div className="flex items-center text-[10px] text-amber-600 font-semibold">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500 mr-0.5" />
                {product.seller_rating || 5.0}
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickOrder(product);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#5c2d91] hover:bg-[#472272] text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-3 h-3 text-amber-300" />
            <span>{product.type === "service" ? "Demander" : "Acheter"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

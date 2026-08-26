import React, { useState } from "react";
import { ProductItem, PiUser, ItemType } from "../types";
import { ProductCard } from "./ProductCard";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Sparkles,
  ShoppingBag,
  Package,
  Wrench,
  Layers,
  ArrowUpDown,
  X,
  Store
} from "lucide-react";

interface MarketplaceScreenProps {
  currentUser: PiUser;
  products: ProductItem[];
  onSelectProduct: (product: ProductItem) => void;
  onQuickOrder: (product: ProductItem) => void;
  onGoToSellerDashboard: () => void;
}

const CATEGORIES = [
  "Toutes les catégories",
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

export const MarketplaceScreen: React.FC<MarketplaceScreenProps> = ({
  currentUser,
  products,
  onSelectProduct,
  onQuickOrder,
  onGoToSellerDashboard,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes les catégories");
  const [typeFilter, setTypeFilter] = useState<"all" | ItemType>("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "price_asc" | "price_desc" | "views">("recent");
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Filter and sort products
  const filteredProducts = products
    .filter((item) => {
      // Must be published and available
      if (!item.is_published || item.status === "archived") return false;

      // Search term
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.seller_username.toLowerCase().includes(term) ||
        (item.location && item.location.toLowerCase().includes(term));

      // Category filter
      const matchesCategory =
        selectedCategory === "Toutes les catégories" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      // Type filter
      const matchesType = typeFilter === "all" || item.type === typeFilter;

      // Location filter
      const matchesLocation =
        !locationFilter ||
        (item.location || "").toLowerCase().includes(locationFilter.toLowerCase());

      return matchesSearch && matchesCategory && matchesType && matchesLocation;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price_pi - b.price_pi;
      if (sortBy === "price_desc") return b.price_pi - a.price_pi;
      if (sortBy === "views") return (b.views_count || 0) - (a.views_count || 0);
      // Recent (default)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="w-full max-w-5xl mx-auto text-left space-y-6">
      {/* Banner / Hero header */}
      <div className="bg-gradient-to-r from-[#3a1558] via-[#5c2d91] to-[#250d3c] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-300/30 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Marché Décentralisé Pi Network</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            Achetez & Vendez vos Produits & Services en Pi
          </h2>
          <p className="text-xs text-purple-200 leading-relaxed font-medium">
            Explorez les offres de la communauté internationale Pi Network. Micro-frais transparents, contact direct et transactions sécurisées.
          </p>
        </div>

        <div className="z-10 shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
          <button
            onClick={onGoToSellerDashboard}
            className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-black/30 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Store className="w-4 h-4 fill-purple-950" />
            <span>Ouvrir ma boutique (0.0001 π)</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Rechercher un produit, un service, une ville ou un vendeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-2xl border border-slate-200 focus:border-purple-600 font-medium text-slate-800 bg-slate-50"
            />
          </div>

          {/* Type filters tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setTypeFilter("all")}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                typeFilter === "all" ? "bg-white text-[#5c2d91] shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setTypeFilter("product")}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                typeFilter === "product" ? "bg-white text-[#5c2d91] shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Produits</span>
            </button>
            <button
              onClick={() => setTypeFilter("service")}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                typeFilter === "service" ? "bg-white text-[#5c2d91] shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Services</span>
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="shrink-0 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto p-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 cursor-pointer"
            >
              <option value="recent">⏱️ Plus récents</option>
              <option value="price_asc">📈 Prix : croissant</option>
              <option value="price_desc">📉 Prix : décroissant</option>
              <option value="views">🔥 Les plus vus</option>
            </select>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl shrink-0 font-bold transition-colors cursor-pointer text-[11px] ${
                selectedCategory === cat
                  ? "bg-[#5c2d91] text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div>
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
            <ShoppingBag className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Aucune annonce ne correspond à votre recherche
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              Ajustez vos filtres ou soyez le premier à publier un produit ou service dans cette catégorie !
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("Toutes les catégories");
                setTypeFilter("all");
                setLocationFilter("");
              }}
              className="px-4 py-2 bg-purple-100 text-[#5c2d91] font-bold text-xs rounded-xl hover:bg-purple-200 transition-colors cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onQuickOrder={onQuickOrder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

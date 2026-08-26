import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Economic Model Fees in Pi (π)
export const SELLER_ACTIVATION_FEE_PI = 0.0001;
export const PRODUCT_PUBLICATION_FEE_PI = 0.00001;
export const FEATURED_BOOST_FEE_PI = 0.0005;

// Database storage structure
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

interface SellerProfileRecord {
  shop_name?: string;
  bio?: string;
  city?: string;
  country?: string;
  whatsapp?: string;
  telegram?: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
  rating: number;
  reviews_count: number;
  total_sales: number;
}

interface UserRecord {
  uid: string;
  username: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  is_seller: boolean;
  seller_activated_at?: string;
  seller_txid?: string;
  is_banned?: boolean;
  created_at: string;
  profile?: SellerProfileRecord;
}

interface ProductRecord {
  id: number;
  seller_uid: string;
  seller_username: string;
  seller_store_name?: string;
  seller_rating?: number;
  title: string;
  description: string;
  category: string;
  price_pi: number;
  type: 'product' | 'service';
  condition: 'new' | 'used_like_new' | 'used_good' | 'service';
  image_url?: string;
  location: string;
  contact_whatsapp?: string;
  contact_telegram?: string;
  contact_phone?: string;
  contact_email?: string;
  is_published: boolean;
  is_featured: boolean;
  status: 'available' | 'sold' | 'archived';
  views_count: number;
  publication_txid?: string;
  created_at: string;
}

interface OrderRecord {
  id: number;
  product_id: number;
  product_title: string;
  product_price_pi: number;
  product_type: 'product' | 'service';
  seller_uid: string;
  seller_username: string;
  buyer_uid: string;
  buyer_username: string;
  buyer_contact: string;
  buyer_message: string;
  delivery_location?: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  created_at: string;
}

interface PaymentRecord {
  id: string;
  payment_id: string;
  txid: string;
  user_uid: string;
  username: string;
  amount: number;
  purpose: 'SELLER_ACTIVATION' | 'PRODUCT_PUBLICATION' | 'FEATURED_LISTING';
  product_id?: number;
  product_title?: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

interface ReportRecord {
  id: number;
  product_id: number;
  product_title: string;
  seller_uid: string;
  seller_username: string;
  reporter_uid: string;
  reporter_username: string;
  reason: 'fake_item' | 'scam' | 'offensive' | 'prohibited' | 'incorrect_price' | 'other';
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  products: ProductRecord[];
  orders: OrderRecord[];
  payments: PaymentRecord[];
  reports: ReportRecord[];
}

// Initial seed data with realistic products & services across categories
const initialData: DatabaseSchema = {
  users: [
    {
      uid: "pi_admin_master",
      username: "admin_pi_market",
      role: "ADMIN",
      is_seller: true,
      seller_activated_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
      seller_txid: "tx_admin_genesis",
      created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
      profile: {
        shop_name: "Pi Market Official Hub",
        bio: "Compte officiel d'administration et de certification Pi Market.",
        city: "International",
        country: "Pi Network",
        whatsapp: "+1234567890",
        telegram: "@pimarket_admin",
        rating: 5.0,
        reviews_count: 120,
        total_sales: 85,
      },
    },
    {
      uid: "pi_seller_alex_tech",
      username: "alex_tech_shop",
      role: "SELLER",
      is_seller: true,
      seller_activated_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
      seller_txid: "tx_act_alex982",
      created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
      profile: {
        shop_name: "Alex High-Tech Hub",
        bio: "Vente de smartphones, ordinateurs et accessoires reconditionnés certifiés.",
        city: "Paris",
        country: "France",
        whatsapp: "+33612345678",
        telegram: "@alex_pi_tech",
        phone: "+33 6 12 34 56 78",
        rating: 4.9,
        reviews_count: 42,
        total_sales: 28,
      },
    },
    {
      uid: "pi_seller_amina_mode",
      username: "amina_creations",
      role: "SELLER",
      is_seller: true,
      seller_activated_at: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
      seller_txid: "tx_act_amina441",
      created_at: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
      profile: {
        shop_name: "Amina Fashion & Cuir",
        bio: "Créations artisanales en cuir véritable, sacs à main et vêtements sur mesure.",
        city: "Abidjan",
        country: "Côte d'Ivoire",
        whatsapp: "+22507112233",
        telegram: "@amina_crea",
        rating: 4.95,
        reviews_count: 36,
        total_sales: 19,
      },
    },
    {
      uid: "pi_seller_jean_artisan",
      username: "jean_expert_service",
      role: "SELLER",
      is_seller: true,
      seller_activated_at: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
      seller_txid: "tx_act_jean773",
      created_at: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
      profile: {
        shop_name: "Jean Dépannage & Électricité",
        bio: "Électricien & dépanneur certifié, interventions urgentes 7j/7.",
        city: "Lyon",
        country: "France",
        whatsapp: "+33798765432",
        rating: 4.8,
        reviews_count: 18,
        total_sales: 15,
      },
    },
    {
      uid: "pi_buyer_claire",
      username: "claire_pioneer",
      role: "BUYER",
      is_seller: false,
      created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    },
  ],
  products: [
    {
      id: 1,
      seller_uid: "pi_seller_alex_tech",
      seller_username: "alex_tech_shop",
      seller_store_name: "Alex High-Tech Hub",
      seller_rating: 4.9,
      title: "iPhone 15 Pro Max 256GB - Titane Naturel (Comme neuf)",
      description: "Smartphone Apple iPhone 15 Pro Max 256GB en parfait état, batterie 99%, boîte d'origine avec câble USB-C tressé et coque MagSafe offerte. Garanti sans rayures.",
      category: "Électronique & High-Tech",
      price_pi: 65.0,
      type: "product",
      condition: "used_like_new",
      image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
      location: "Paris, France (Envoi sécurisé possible)",
      contact_whatsapp: "+33612345678",
      contact_telegram: "@alex_pi_tech",
      contact_phone: "+33 6 12 34 56 78",
      is_published: true,
      is_featured: true,
      status: "available",
      views_count: 148,
      publication_txid: "tx_pub_prod_1",
      created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    },
    {
      id: 2,
      seller_uid: "pi_seller_alex_tech",
      seller_username: "alex_tech_shop",
      seller_store_name: "Alex High-Tech Hub",
      seller_rating: 4.9,
      title: "MacBook Air M2 13\" 16GB RAM / 512GB SSD - Gris Sidéral",
      description: "Ordinateur portable Apple ultra-léger et puissant. Idéal pour travail bureautique, programmation et montage photo. Clavier AZERTY rétroéclairé, chargeur rapide inclus.",
      category: "Informatique & Téléphonie",
      price_pi: 85.0,
      type: "product",
      condition: "used_like_new",
      image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
      location: "Paris & Île-de-France",
      contact_whatsapp: "+33612345678",
      contact_telegram: "@alex_pi_tech",
      is_published: true,
      is_featured: true,
      status: "available",
      views_count: 210,
      publication_txid: "tx_pub_prod_2",
      created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    },
    {
      id: 3,
      seller_uid: "pi_seller_amina_mode",
      seller_username: "amina_creations",
      seller_store_name: "Amina Fashion & Cuir",
      seller_rating: 4.95,
      title: "Sac à main Haute Couture en Cuir Véritable Marron Vintage",
      description: "Sac de luxe confectionné à la main avec du cuir pleine fleur résistant. Finitions en laiton doré, bandoulière ajustable et multiples rangements intérieurs élégants.",
      category: "Mode & Habillement",
      price_pi: 14.5,
      type: "product",
      condition: "new",
      image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
      location: "Abidjan, Côte d'Ivoire / Expédition internationale",
      contact_whatsapp: "+22507112233",
      contact_telegram: "@amina_crea",
      is_published: true,
      is_featured: true,
      status: "available",
      views_count: 94,
      publication_txid: "tx_pub_prod_3",
      created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    },
    {
      id: 4,
      seller_uid: "pi_seller_jean_artisan",
      seller_username: "jean_expert_service",
      seller_store_name: "Jean Dépannage & Électricité",
      seller_rating: 4.8,
      title: "Dépannage Électricité & Pose Tableau Électrique aux Normes",
      description: "Intervention rapide à domicile : recherche de panne, mise en conformité NFC 15-100, installation de prises renforcées pour véhicules électriques et domotique.",
      category: "Services & Artisans",
      price_pi: 8.0,
      type: "service",
      condition: "service",
      image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80",
      location: "Lyon & Agglomération (30km)",
      contact_whatsapp: "+33798765432",
      is_published: true,
      is_featured: false,
      status: "available",
      views_count: 67,
      publication_txid: "tx_pub_prod_4",
      created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    },
    {
      id: 5,
      seller_uid: "pi_seller_amina_mode",
      seller_username: "amina_creations",
      seller_store_name: "Amina Fashion & Cuir",
      seller_rating: 4.95,
      title: "Panier Bio Épicerie Fine & Fruits Exotiques Frais",
      description: "Assortiment hebdomadaire de fruits et légumes biologiques cueillis à maturité (mangues, ananas Victoria, épices rares et miel sauvage naturel).",
      category: "Alimentation & Produits Locaux",
      price_pi: 3.2,
      type: "product",
      condition: "new",
      image_url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80",
      location: "Abidjan & Livraison Express",
      contact_whatsapp: "+22507112233",
      is_published: true,
      is_featured: false,
      status: "available",
      views_count: 112,
      publication_txid: "tx_pub_prod_5",
      created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    },
    {
      id: 6,
      seller_uid: "pi_admin_master",
      seller_username: "admin_pi_market",
      seller_store_name: "Pi Market Official Hub",
      seller_rating: 5.0,
      title: "Développement d'Applications Pi Network & Smart Contracts",
      description: "Service professionnel de conception d'applications Pi Browser : intégration du SDK Pi v2.0, paiements Pi, passerelles API et audit de sécurité complet.",
      category: "Services & Artisans",
      price_pi: 25.0,
      type: "service",
      condition: "service",
      image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
      location: "En ligne / À distance (Monde entier)",
      contact_telegram: "@pimarket_admin",
      is_published: true,
      is_featured: true,
      status: "available",
      views_count: 310,
      publication_txid: "tx_pub_prod_6",
      created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    }
  ],
  orders: [
    {
      id: 1,
      product_id: 3,
      product_title: "Sac à main Haute Couture en Cuir Véritable Marron Vintage",
      product_price_pi: 14.5,
      product_type: "product",
      seller_uid: "pi_seller_amina_mode",
      seller_username: "amina_creations",
      buyer_uid: "pi_buyer_claire",
      buyer_username: "claire_pioneer",
      buyer_contact: "https://wa.me/33699887766",
      buyer_message: "Bonjour Amina, je souhaite commander ce sac avec livraison en région parisienne.",
      delivery_location: "Paris 15ème",
      status: "accepted",
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    }
  ],
  payments: [
    {
      id: "pay_act_1",
      payment_id: "pi_pay_alex_act",
      txid: "tx_act_alex982",
      user_uid: "pi_seller_alex_tech",
      username: "alex_tech_shop",
      amount: 0.0001,
      purpose: "SELLER_ACTIVATION",
      status: "completed",
      created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    },
    {
      id: "pay_act_2",
      payment_id: "pi_pay_amina_act",
      txid: "tx_act_amina441",
      user_uid: "pi_seller_amina_mode",
      username: "amina_creations",
      amount: 0.0001,
      purpose: "SELLER_ACTIVATION",
      status: "completed",
      created_at: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    },
    {
      id: "pay_pub_1",
      payment_id: "pi_pay_prod_1",
      txid: "tx_pub_prod_1",
      user_uid: "pi_seller_alex_tech",
      username: "alex_tech_shop",
      amount: 0.00001,
      purpose: "PRODUCT_PUBLICATION",
      product_id: 1,
      product_title: "iPhone 15 Pro Max 256GB - Titane Naturel",
      status: "completed",
      created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    }
  ],
  reports: []
};

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.users) parsed.users = [];
    if (!parsed.products) parsed.products = [];
    if (!parsed.orders) parsed.orders = [];
    if (!parsed.payments) parsed.payments = [];
    if (!parsed.reports) parsed.reports = [];
    return parsed;
  } catch (err) {
    console.error("Erreur lecture base de données:", err);
    return initialData;
  }
}

function writeDb(data: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Erreur écriture base de données:", err);
  }
}

// -------------------------------------------------------------
// 1. HEALTH & SYSTEM INFO
// -------------------------------------------------------------
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    appName: "Pi Market",
    version: "2.0.0",
    network: "Mainnet",
    sellerActivationFee: SELLER_ACTIVATION_FEE_PI,
    productPublicationFee: PRODUCT_PUBLICATION_FEE_PI,
    hasApiKey: !!process.env.PI_API_KEY,
  });
});

// -------------------------------------------------------------
// 2. USER AUTH & STATUS CHECK
// -------------------------------------------------------------
app.get("/api/user/status", (req, res) => {
  const { uid, username } = req.query;

  if (!uid || typeof uid !== "string") {
    return res.status(400).json({ error: "UID utilisateur requis" });
  }

  try {
    const db = readDb();
    let user = db.users.find((u) => u.uid === uid);

    // Auto-create Pioneer user record if first connection
    if (!user) {
      user = {
        uid,
        username: typeof username === "string" && username ? username : `pioneer_${uid.substring(0, 6)}`,
        role: "BUYER",
        is_seller: false,
        created_at: new Date().toISOString(),
        profile: {
          rating: 5.0,
          reviews_count: 0,
          total_sales: 0,
        },
      };
      db.users.push(user);
      writeDb(db);
      console.log(`[USER] Nouveau Pioneer enregistré: @${user.username} (${user.uid})`);
    }

    return res.status(200).json({
      user,
      hasApiKey: !!process.env.PI_API_KEY,
      network: "Mainnet",
    });
  } catch (error: any) {
    console.error("Erreur check-status:", error);
    return res.status(500).json({ error: "Erreur base de données" });
  }
});

// Update Seller Profile
app.post("/api/user/profile", (req, res) => {
  const { uid, shop_name, bio, city, country, whatsapp, telegram, phone, email, avatar_url } = req.body || {};

  if (!uid) {
    return res.status(400).json({ error: "UID requis" });
  }

  try {
    const db = readDb();
    const user = db.users.find((u) => u.uid === uid);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    user.profile = {
      ...user.profile,
      shop_name: shop_name !== undefined ? String(shop_name).trim() : user.profile?.shop_name,
      bio: bio !== undefined ? String(bio).trim() : user.profile?.bio,
      city: city !== undefined ? String(city).trim() : user.profile?.city,
      country: country !== undefined ? String(country).trim() : user.profile?.country,
      whatsapp: whatsapp !== undefined ? String(whatsapp).trim() : user.profile?.whatsapp,
      telegram: telegram !== undefined ? String(telegram).trim() : user.profile?.telegram,
      phone: phone !== undefined ? String(phone).trim() : user.profile?.phone,
      email: email !== undefined ? String(email).trim() : user.profile?.email,
      avatar_url: avatar_url !== undefined ? String(avatar_url).trim() : user.profile?.avatar_url,
      rating: user.profile?.rating ?? 5.0,
      reviews_count: user.profile?.reviews_count ?? 0,
      total_sales: user.profile?.total_sales ?? 0,
    };

    writeDb(db);
    return res.status(200).json({ success: true, user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 3. PUBLIC MARKETPLACE PRODUCTS & SEARCH
// -------------------------------------------------------------
app.get("/api/products", (req, res) => {
  try {
    const {
      q,
      category,
      type,
      condition,
      location,
      seller_uid,
      min_price,
      max_price,
      sort,
      include_drafts,
    } = req.query;

    const db = readDb();
    let list = [...db.products];

    // Filter published only (unless requested by the seller themselves)
    if (include_drafts !== "true") {
      list = list.filter((p) => p.is_published && p.status !== "archived");
    }

    // Filter by seller UID
    if (seller_uid && typeof seller_uid === "string") {
      list = list.filter((p) => p.seller_uid === seller_uid);
    }

    // Search query (title, description, seller username, store name)
    if (q && typeof q === "string" && q.trim()) {
      const term = q.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.seller_username.toLowerCase().includes(term) ||
          (p.seller_store_name && p.seller_store_name.toLowerCase().includes(term)) ||
          p.category.toLowerCase().includes(term)
      );
    }

    // Category
    if (category && category !== "Toutes les catégories" && typeof category === "string") {
      list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    // Type (product / service)
    if (type && (type === "product" || type === "service")) {
      list = list.filter((p) => p.type === type);
    }

    // Condition
    if (condition && typeof condition === "string" && condition !== "all") {
      list = list.filter((p) => p.condition === condition);
    }

    // Location
    if (location && typeof location === "string" && location.trim()) {
      const loc = location.toLowerCase().trim();
      list = list.filter((p) => (p.location || "").toLowerCase().includes(loc));
    }

    // Price range
    if (min_price && !isNaN(Number(min_price))) {
      list = list.filter((p) => p.price_pi >= Number(min_price));
    }
    if (max_price && !isNaN(Number(max_price))) {
      list = list.filter((p) => p.price_pi <= Number(max_price));
    }

    // Sorting
    if (sort === "price_asc") {
      list.sort((a, b) => a.price_pi - b.price_pi);
    } else if (sort === "price_desc") {
      list.sort((a, b) => b.price_pi - a.price_pi);
    } else if (sort === "views") {
      list.sort((a, b) => b.views_count - a.views_count);
    } else {
      // Default: Featured first, then newest
      list.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return res.status(200).json(list);
  } catch (error: any) {
    console.error("Erreur get products:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET single product by ID (increments view count)
app.get("/api/products/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    const db = readDb();
    const product = db.products.find((p) => p.id === id);

    if (!product) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    // Increment view count
    product.views_count = (product.views_count || 0) + 1;
    writeDb(db);

    // Fetch seller record for comprehensive profile info
    const seller = db.users.find((u) => u.uid === product.seller_uid);

    return res.status(200).json({ product, seller });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 4. PRODUCT CREATION & SELLER PUBLICATION FLOW
// -------------------------------------------------------------

// Step 1: Create a product draft or prepare publication (requires active seller status)
app.post("/api/products/draft", (req, res) => {
  try {
    const {
      seller_uid,
      title,
      description,
      category,
      price_pi,
      type,
      condition,
      image_url,
      location,
      contact_whatsapp,
      contact_telegram,
      contact_phone,
      contact_email,
    } = req.body || {};

    if (!seller_uid || !title || !description || price_pi === undefined) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    const db = readDb();
    const seller = db.users.find((u) => u.uid === seller_uid);

    if (!seller) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    if (!seller.is_seller) {
      return res.status(403).json({
        error: "Accès vendeur non activé. Veuillez d'abord régler les frais uniques de 0.0001 Pi.",
        requireSellerActivation: true,
      });
    }

    const nextId = db.products.length > 0 ? Math.max(...db.products.map((p) => p.id)) + 1 : 1;

    const newProduct: ProductRecord = {
      id: nextId,
      seller_uid,
      seller_username: seller.username,
      seller_store_name: seller.profile?.shop_name || `@${seller.username}`,
      seller_rating: seller.profile?.rating || 5.0,
      title: String(title).trim(),
      description: String(description).trim(),
      category: category ? String(category).trim() : "Autres & Divers",
      price_pi: Number(price_pi) || 0,
      type: type === "service" ? "service" : "product",
      condition: condition || (type === "service" ? "service" : "new"),
      image_url: image_url ? String(image_url).trim() : undefined,
      location: location ? String(location).trim() : seller.profile?.city || "Monde entier",
      contact_whatsapp: contact_whatsapp ? String(contact_whatsapp).trim() : seller.profile?.whatsapp,
      contact_telegram: contact_telegram ? String(contact_telegram).trim() : seller.profile?.telegram,
      contact_phone: contact_phone ? String(contact_phone).trim() : seller.profile?.phone,
      contact_email: contact_email ? String(contact_email).trim() : seller.profile?.email,
      is_published: false, // will become true upon 0.00001 Pi payment confirmation
      is_featured: false,
      status: "available",
      views_count: 0,
      created_at: new Date().toISOString(),
    };

    db.products.push(newProduct);
    writeDb(db);

    console.log(`[DRAFT] Produit #${newProduct.id} créé par @${seller.username}. En attente paiement frais 0.00001 Pi.`);

    return res.status(201).json({
      success: true,
      product: newProduct,
      publicationFeePi: PRODUCT_PUBLICATION_FEE_PI,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Update product
app.put("/api/products/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { seller_uid, title, description, category, price_pi, image_url, location, condition, status, is_featured } = req.body || {};

    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    const db = readDb();
    const product = db.products.find((p) => p.id === id);

    if (!product) return res.status(404).json({ error: "Produit non trouvé" });

    const user = db.users.find((u) => u.uid === seller_uid);
    const isAdmin = user?.role === "ADMIN";

    if (product.seller_uid !== seller_uid && !isAdmin) {
      return res.status(403).json({ error: "Non autorisé à modifier ce produit" });
    }

    if (title) product.title = String(title).trim();
    if (description) product.description = String(description).trim();
    if (category) product.category = String(category).trim();
    if (price_pi !== undefined) product.price_pi = Number(price_pi);
    if (image_url !== undefined) product.image_url = String(image_url).trim();
    if (location) product.location = String(location).trim();
    if (condition) product.condition = condition;
    if (status) product.status = status;
    if (is_featured !== undefined && isAdmin) product.is_featured = !!is_featured;

    writeDb(db);
    return res.status(200).json({ success: true, product });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Delete product
app.delete("/api/products/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { uid } = req.query;

    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    const db = readDb();
    const index = db.products.findIndex((p) => p.id === id);

    if (index === -1) return res.status(404).json({ error: "Produit introuvable" });

    const user = db.users.find((u) => u.uid === uid);
    const isAdmin = user?.role === "ADMIN";

    if (db.products[index].seller_uid !== uid && !isAdmin) {
      return res.status(403).json({ error: "Non autorisé à supprimer ce produit" });
    }

    db.products.splice(index, 1);
    writeDb(db);

    return res.status(200).json({ success: true, message: "Produit supprimé avec succès." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 5. PI NETWORK PAYMENTS APPROVE & COMPLETE
// -------------------------------------------------------------

app.post("/api/approve", async (req, res) => {
  console.log("➡️ [PI] Approbation Payment demandée:", req.body);
  try {
    const { paymentId } = req.body || {};
    if (!paymentId) {
      return res.status(400).json({ error: "paymentId manquant" });
    }

    const apiKey = process.env.PI_API_KEY;

    // Sandbox / dev approval when no API key is set
    if (!apiKey) {
      console.log(`ℹ️ [PI Sandbox] Approbation automatique pour ${paymentId}`);
      return res.status(200).json({
        ok: true,
        paymentId,
        data: { status: { developer_approved: true }, simulated: true },
      });
    }

    // Official Pi API approve endpoint
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ ok: true, paymentId, data });
    } else {
      return res.status(response.status).json({ ok: false, error: data.error });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/complete", async (req, res) => {
  console.log("➡️ [PI] Complétion Payment demandée:", req.body);
  try {
    const { paymentId, txid, uid: clientUid, username: clientUsername, purpose, product_id } = req.body || {};

    if (!paymentId) {
      return res.status(400).json({ error: "paymentId manquant" });
    }

    const apiKey = process.env.PI_API_KEY;
    const uid = clientUid || `user_${paymentId.substring(0, 8)}`;
    const username = clientUsername || "Pioneer_Pi";
    const paymentTxid = txid || `tx_pi_${Date.now()}`;

    const db = readDb();
    let user = db.users.find((u) => u.uid === uid);

    if (!user) {
      user = {
        uid,
        username,
        role: "BUYER",
        is_seller: false,
        created_at: new Date().toISOString(),
      };
      db.users.push(user);
    }

    // Process logic based on payment purpose:
    // 1. SELLER_ACTIVATION (0.0001 Pi)
    // 2. PRODUCT_PUBLICATION (0.00001 Pi)
    // 3. FEATURED_BOOST (0.0005 Pi)

    const paymentPurpose = purpose || "SELLER_ACTIVATION";

    if (apiKey) {
      // 1. Verify Payment Status with Pi API
      const checkResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
        method: "GET",
        headers: { Authorization: `Key ${apiKey}` },
      });

      if (!checkResponse.ok) {
        return res.status(checkResponse.status).json({ error: "Erreur de vérification auprès de Pi Network" });
      }

      // 2. Complete on Pi Backend
      const completeRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txid: paymentTxid }),
      });

      if (!completeRes.ok) {
        const errData = await completeRes.json();
        return res.status(completeRes.status).json({ error: errData.error || "Échec complétion Pi" });
      }
    }

    let completedAmount = 0;

    if (paymentPurpose === "SELLER_ACTIVATION") {
      user.is_seller = true;
      user.role = user.role === "ADMIN" ? "ADMIN" : "SELLER";
      user.seller_activated_at = new Date().toISOString();
      user.seller_txid = paymentTxid;
      completedAmount = SELLER_ACTIVATION_FEE_PI;
    } else if (paymentPurpose === "PRODUCT_PUBLICATION" && product_id) {
      const product = db.products.find((p) => p.id === Number(product_id));
      if (product) {
        product.is_published = true;
        product.publication_txid = paymentTxid;
      }
      completedAmount = PRODUCT_PUBLICATION_FEE_PI;
    } else if (paymentPurpose === "FEATURED_LISTING" && product_id) {
      const product = db.products.find((p) => p.id === Number(product_id));
      if (product) {
        product.is_featured = true;
      }
      completedAmount = FEATURED_BOOST_FEE_PI;
    }

    // Log in payments ledger
    const newPaymentLog: PaymentRecord = {
      id: `pay_${Date.now()}`,
      payment_id: paymentId,
      txid: paymentTxid,
      user_uid: uid,
      username,
      amount: completedAmount,
      purpose: paymentPurpose,
      product_id: product_id ? Number(product_id) : undefined,
      status: "completed",
      created_at: new Date().toISOString(),
    };

    db.payments.push(newPaymentLog);
    writeDb(db);

    console.log(`✅ [PAYMENT SUCCESS] ${paymentPurpose} validé pour @${username} (TxID: ${paymentTxid})`);

    return res.status(200).json({
      ok: true,
      success: true,
      paymentId,
      txid: paymentTxid,
      user,
      paymentRecord: newPaymentLog,
    });
  } catch (error: any) {
    console.error("❌ ERROR complete:", error);
    return res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// 6. BUYER ORDERS / CONTACT INQUIRIES
// -------------------------------------------------------------
app.post("/api/orders", (req, res) => {
  try {
    const { product_id, buyer_uid, buyer_username, buyer_contact, buyer_message, delivery_location } = req.body || {};

    if (!product_id || !buyer_uid || !buyer_contact) {
      return res.status(400).json({ error: "Données de commande incomplètes" });
    }

    const db = readDb();
    const product = db.products.find((p) => p.id === Number(product_id));

    if (!product) {
      return res.status(404).json({ error: "Article non trouvé" });
    }

    if (product.seller_uid === buyer_uid) {
      return res.status(400).json({ error: "Vous ne pouvez pas commander votre propre article." });
    }

    const nextId = db.orders.length > 0 ? Math.max(...db.orders.map((o) => o.id)) + 1 : 1;

    const newOrder: OrderRecord = {
      id: nextId,
      product_id: product.id,
      product_title: product.title,
      product_price_pi: product.price_pi,
      product_type: product.type,
      seller_uid: product.seller_uid,
      seller_username: product.seller_username,
      buyer_uid,
      buyer_username: buyer_username || "Pioneer_Buyer",
      buyer_contact: String(buyer_contact).trim(),
      buyer_message: buyer_message ? String(buyer_message).trim() : "Demande d'achat directe via Pi Market",
      delivery_location: delivery_location ? String(delivery_location).trim() : undefined,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    db.orders.push(newOrder);
    writeDb(db);

    console.log(`[ORDER] Nouvelle commande #${newOrder.id} pour '${product.title}'`);

    return res.status(201).json({ success: true, order: newOrder });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET orders for a user (either as buyer or as seller)
app.get("/api/orders", (req, res) => {
  try {
    const { uid, role } = req.query;
    if (!uid || typeof uid !== "string") {
      return res.status(400).json({ error: "UID requis" });
    }

    const db = readDb();
    let list: OrderRecord[] = [];

    if (role === "seller") {
      list = db.orders.filter((o) => o.seller_uid === uid);
    } else if (role === "buyer") {
      list = db.orders.filter((o) => o.buyer_uid === uid);
    } else {
      list = db.orders.filter((o) => o.seller_uid === uid || o.buyer_uid === uid);
    }

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return res.status(200).json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Update order status
app.patch("/api/orders/:id/status", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { uid, status } = req.body || {};

    if (isNaN(id) || !status) {
      return res.status(400).json({ error: "Paramètres invalides" });
    }

    const db = readDb();
    const order = db.orders.find((o) => o.id === id);

    if (!order) return res.status(404).json({ error: "Commande non trouvée" });

    // Only seller, buyer, or admin can update status
    const user = db.users.find((u) => u.uid === uid);
    if (order.seller_uid !== uid && order.buyer_uid !== uid && user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Non autorisé" });
    }

    order.status = status;

    // If marked completed, update seller total sales
    if (status === "completed") {
      const seller = db.users.find((u) => u.uid === order.seller_uid);
      if (seller && seller.profile) {
        seller.profile.total_sales = (seller.profile.total_sales || 0) + 1;
      }
    }

    writeDb(db);
    return res.status(200).json({ success: true, order });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 7. BUYER REPORTS & MODERATION
// -------------------------------------------------------------
app.post("/api/reports", (req, res) => {
  try {
    const { product_id, reporter_uid, reporter_username, reason, details } = req.body || {};

    if (!product_id || !reporter_uid || !reason) {
      return res.status(400).json({ error: "Données de signalement incomplètes" });
    }

    const db = readDb();
    const product = db.products.find((p) => p.id === Number(product_id));

    if (!product) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    const nextId = db.reports.length > 0 ? Math.max(...db.reports.map((r) => r.id)) + 1 : 1;

    const report: ReportRecord = {
      id: nextId,
      product_id: product.id,
      product_title: product.title,
      seller_uid: product.seller_uid,
      seller_username: product.seller_username,
      reporter_uid,
      reporter_username: reporter_username || "Pioneer",
      reason,
      details: details ? String(details).trim() : "",
      status: "pending",
      created_at: new Date().toISOString(),
    };

    db.reports.push(report);
    writeDb(db);

    console.log(`⚠️ [REPORT] Signalement #${report.id} pour l'article #${product.id}`);

    return res.status(201).json({ success: true, message: "Signalement transmis aux modérateurs." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 8. ADMIN DASHBOARD & MODERATION ENDPOINTS
// -------------------------------------------------------------

// Check admin middleware helper
function verifyAdmin(req: express.Request, db: DatabaseSchema): boolean {
  const adminUid = req.headers["x-admin-uid"] || req.query.admin_uid;
  if (!adminUid) return false;
  const user = db.users.find((u) => u.uid === adminUid);
  return user?.role === "ADMIN";
}

app.get("/api/admin/stats", (req, res) => {
  try {
    const db = readDb();
    const totalUsers = db.users.length;
    const totalSellers = db.users.filter((u) => u.is_seller).length;
    const totalProducts = db.products.length;
    const totalOrders = db.orders.length;
    const totalReports = db.reports.length;
    const pendingReports = db.reports.filter((r) => r.status === "pending").length;
    const totalPiFees = db.payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    return res.status(200).json({
      total_users: totalUsers,
      total_sellers: totalSellers,
      total_products: totalProducts,
      total_orders: totalOrders,
      total_reports: totalReports,
      pending_reports: pendingReports,
      total_pi_fees: Number(totalPiFees.toFixed(6)),
      recent_payments: db.payments.slice(-10).reverse(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/reports", (req, res) => {
  try {
    const db = readDb();
    const sorted = [...db.reports].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return res.status(200).json(sorted);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.patch("/api/admin/reports/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { action, deleteProduct } = req.body || {}; // action: 'resolved' | 'dismissed'

    const db = readDb();
    const report = db.reports.find((r) => r.id === id);

    if (!report) return res.status(404).json({ error: "Signalement introuvable" });

    report.status = action || "resolved";

    if (deleteProduct && report.product_id) {
      const pIndex = db.products.findIndex((p) => p.id === report.product_id);
      if (pIndex !== -1) {
        db.products.splice(pIndex, 1);
        console.log(`[MODERATION] Produit #${report.product_id} supprimé suite au signalement #${report.id}`);
      }
    }

    writeDb(db);
    return res.status(200).json({ success: true, report });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/users", (_req, res) => {
  try {
    const db = readDb();
    return res.status(200).json(db.users);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.patch("/api/admin/users/:uid", (req, res) => {
  try {
    const { uid } = req.params;
    const { role, is_seller, is_banned } = req.body || {};

    const db = readDb();
    const user = db.users.find((u) => u.uid === uid);

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    if (role) user.role = role;
    if (is_seller !== undefined) user.is_seller = !!is_seller;
    if (is_banned !== undefined) user.is_banned = !!is_banned;

    writeDb(db);
    return res.status(200).json({ success: true, user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/payments", (_req, res) => {
  try {
    const db = readDb();
    return res.status(200).json([...db.payments].reverse());
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 9. VITE MIDDLEWARE & STATIC APP SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Pi Market Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

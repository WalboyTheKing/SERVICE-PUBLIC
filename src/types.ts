export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export interface SellerProfile {
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

export interface UserAccount {
  uid: string;
  username: string;
  role: UserRole;
  is_seller: boolean;
  seller_activated_at?: string;
  seller_txid?: string;
  is_banned?: boolean;
  created_at: string;
  profile?: SellerProfile;
}

export interface PiUser {
  uid: string;
  username: string;
  accessToken?: string;
}

export type ItemType = 'product' | 'service';
export type ItemCondition = 'new' | 'used_like_new' | 'used_good' | 'service';
export type ItemStatus = 'available' | 'sold' | 'archived';

export interface ProductItem {
  id: number;
  seller_uid: string;
  seller_username: string;
  seller_store_name?: string;
  seller_rating?: number;
  title: string;
  description: string;
  category: string;
  price_pi: number;
  type: ItemType;
  condition: ItemCondition;
  image_url?: string;
  location: string;
  contact_whatsapp?: string;
  contact_telegram?: string;
  contact_phone?: string;
  contact_email?: string;
  is_published: boolean;
  is_featured: boolean;
  status: ItemStatus;
  views_count: number;
  publication_txid?: string;
  created_at: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export interface OrderRequest {
  id: number;
  product_id: number;
  product_title: string;
  product_price_pi: number;
  product_type: ItemType;
  seller_uid: string;
  seller_username: string;
  buyer_uid: string;
  buyer_username: string;
  buyer_contact: string;
  buyer_message: string;
  delivery_location?: string;
  status: OrderStatus;
  created_at: string;
}

export type PaymentPurpose = 'SELLER_ACTIVATION' | 'PRODUCT_PUBLICATION' | 'FEATURED_LISTING';

export interface PaymentRecord {
  id: string;
  payment_id: string;
  txid: string;
  user_uid: string;
  username: string;
  amount: number;
  purpose: PaymentPurpose;
  product_id?: number;
  product_title?: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

export type ReportReason = 'fake_item' | 'scam' | 'offensive' | 'prohibited' | 'incorrect_price' | 'other';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface ReportItem {
  id: number;
  product_id: number;
  product_title: string;
  seller_uid: string;
  seller_username: string;
  reporter_uid: string;
  reporter_username: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_sellers: number;
  total_products: number;
  total_orders: number;
  total_reports: number;
  pending_reports: number;
  total_pi_fees: number;
  recent_payments: PaymentRecord[];
}

export type MainViewTab = 'market' | 'seller_dashboard' | 'my_orders' | 'admin';

export interface UserStatusResponse {
  user: UserAccount;
  hasApiKey: boolean;
}

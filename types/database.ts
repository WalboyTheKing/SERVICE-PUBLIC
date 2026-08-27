export type User = {
  id: string;
  pi_uid: string;
  username: string;
  is_seller: boolean;
  is_admin?: boolean;
  seller_payment_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price_pi: number;
  image_url: string;
  images?: string[];
  category: string;
  status: 'active' | 'inactive' | 'sold' | 'draft';
  publication_payment_id?: string;
  stock?: number;
  views_count?: number;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
  seller?: Partial<User>;
};

export type PaymentType = 'seller_registration' | 'product_publication' | 'product_purchase' | 'cart_checkout';
export type PaymentStatus = 'pending' | 'approved' | 'completed' | 'failed' | 'cancelled';

export type PaymentRecord = {
  id: string;
  pi_payment_id: string;
  user_id: string;
  product_id: string | null;
  type: PaymentType;
  expected_amount: number;
  actual_amount: number | null;
  txid: string | null;
  status: PaymentStatus;
  created_at: string;
  completed_at: string | null;
  product?: Partial<Product>;
};

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export type Order = {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  quantity: number;
  total_amount_pi: number;
  pi_payment_id?: string;
  txid?: string | null;
  status: OrderStatus;
  shipping_address?: string;
  contact_info?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  product?: Partial<Product>;
  buyer?: Partial<User>;
  seller?: Partial<User>;
};

export type Favorite = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type User = {
  id: string;
  pi_uid: string;
  username: string;
  is_seller: boolean;
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
  category: string;
  status: 'active' | 'inactive' | 'sold' | 'draft';
  publication_payment_id: string;
  created_at: string;
  updated_at: string;
  seller?: Partial<User>;
};

export type PaymentType = 'seller_registration' | 'product_publication' | 'product_purchase';
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
};
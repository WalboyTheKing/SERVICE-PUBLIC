CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pi_uid TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  is_seller BOOLEAN DEFAULT FALSE NOT NULL,
  seller_payment_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_pi NUMERIC(12, 4) NOT NULL CHECK (price_pi > 0),
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'draft')),
  publication_payment_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pi_payment_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('seller_registration', 'product_publication', 'product_purchase')),
  expected_amount NUMERIC(12, 4) NOT NULL,
  actual_amount NUMERIC(12, 4),
  txid TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_pi_uid ON public.users(pi_uid);
CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_payments_pi_payment_id ON public.payments(pi_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les produits actifs sont visibles par tous" ON public.products FOR SELECT USING (status = 'active');
CREATE POLICY "Les utilisateurs peuvent voir leur profil" ON public.users FOR SELECT USING (true);
CREATE POLICY "Les utilisateurs peuvent voir leurs paiements" ON public.payments FOR SELECT USING (true);

'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase-client';
import { Product } from '@/types/database';
import { ProductCard } from '@/components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseClient
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setProducts(data as Product[]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-8">
        <h1 className="text-3xl font-extrabold">Marketplace Pi Network</h1>
        <p className="text-purple-200 text-sm mt-2">Achetez et vendez en Pi Network Sandbox/Mainnet.</p>
      </div>

      {loading ? (
        <p className="text-gray-400">Chargement des produits...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <p className="text-gray-500">Aucun produit publié pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { DEMO_PRODUCTS } from '@/lib/demo-data';
import { Product } from '@/types/database';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase() || searchParams.get('q')?.toLowerCase();
    const sort = searchParams.get('sort') || 'recent'; // 'recent', 'price_asc', 'price_desc', 'name_asc'
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : null;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : null;
    const sellerId = searchParams.get('sellerId');
    const status = searchParams.get('status') || 'active';
    const includeDemo = searchParams.get('includeDemo') !== 'false';

    let supabaseProducts: Product[] = [];

    try {
      let query = supabaseAdmin
        .from('products')
        .select('*, seller:users!products_seller_id_fkey(id, username, is_seller)');

      if (status !== 'all') {
        query = query.eq('status', status);
      }
      if (category && category !== 'Tous' && category !== 'all') {
        query = query.eq('category', category);
      }
      if (sellerId) {
        query = query.eq('seller_id', sellerId);
      }
      if (minPrice !== null && !isNaN(minPrice)) {
        query = query.gte('price_pi', minPrice);
      }
      if (maxPrice !== null && !isNaN(maxPrice)) {
        query = query.lte('price_pi', maxPrice);
      }

      const { data, error } = await query;
      if (!error && data) {
        supabaseProducts = data as Product[];
      }
    } catch (e) {
      console.warn('Supabase query fallback to demo data:', e);
    }

    // Merge with demo data if requested or if DB is empty
    let allProducts = [...supabaseProducts];
    if (includeDemo && (!sellerId || sellerId.startsWith('demo-seller'))) {
      let filteredDemo = DEMO_PRODUCTS;
      if (category && category !== 'Tous' && category !== 'all') {
        filteredDemo = filteredDemo.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      }
      if (sellerId) {
        filteredDemo = filteredDemo.filter((p) => p.seller_id === sellerId);
      }
      if (minPrice !== null && !isNaN(minPrice)) {
        filteredDemo = filteredDemo.filter((p) => p.price_pi >= minPrice);
      }
      if (maxPrice !== null && !isNaN(maxPrice)) {
        filteredDemo = filteredDemo.filter((p) => p.price_pi <= maxPrice);
      }
      if (status !== 'all') {
        filteredDemo = filteredDemo.filter((p) => p.status === status);
      }

      // Avoid duplicate IDs if already present
      const existingIds = new Set(allProducts.map((p) => p.id));
      for (const dp of filteredDemo) {
        if (!existingIds.has(dp.id)) {
          allProducts.push(dp);
        }
      }
    }

    // Apply search filter
    if (search) {
      allProducts = allProducts.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(search);
        const descMatch = p.description.toLowerCase().includes(search);
        const catMatch = p.category.toLowerCase().includes(search);
        const sellerMatch = p.seller?.username?.toLowerCase().includes(search);
        return titleMatch || descMatch || catMatch || sellerMatch;
      });
    }

    // Apply sorting
    if (sort === 'price_asc') {
      allProducts.sort((a, b) => a.price_pi - b.price_pi);
    } else if (sort === 'price_desc') {
      allProducts.sort((a, b) => b.price_pi - a.price_pi);
    } else if (sort === 'name_asc') {
      allProducts.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // recent
      allProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return NextResponse.json({
      products: allProducts,
      total: allProducts.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { seller_id, title, description, price_pi, category, image_url, images, stock } = body;

    if (!seller_id || !title || !description || !price_pi || !category || !image_url) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    // Verify user is registered as seller
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, is_seller')
      .eq('id', seller_id)
      .single();

    if (userError || !user || !user.is_seller) {
      return NextResponse.json({ error: 'Seuls les vendeurs enregistrés peuvent publier des articles' }, { status: 403 });
    }

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({
        seller_id,
        title,
        description,
        price_pi: parseFloat(price_pi),
        category,
        image_url,
        images: images || [image_url],
        stock: stock ? parseInt(stock) : 1,
        status: 'active',
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { DEMO_PRODUCTS } from '@/lib/demo-data';
import { Product } from '@/types/database';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    if (!productId) {
      return NextResponse.json({ error: 'ID produit requis' }, { status: 400 });
    }

    // 1. Try Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*, seller:users!products_seller_id_fkey(id, username, is_seller, created_at)')
        .eq('id', productId)
        .single();

      if (!error && data) {
        return NextResponse.json({ product: data as Product });
      }
    } catch (e) {
      console.warn('Supabase product query fallback:', e);
    }

    // 2. Check demo products
    const demoProduct = DEMO_PRODUCTS.find((p) => p.id === productId);
    if (demoProduct) {
      return NextResponse.json({ product: demoProduct });
    }

    return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const body = await req.json();
    const { seller_id, title, description, price_pi, category, image_url, images, status, stock } = body;

    // Check seller ownership
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('seller_id')
      .eq('id', productId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
    }

    if (seller_id && existing.seller_id !== seller_id) {
      return NextResponse.json({ error: 'Non autorisé à modifier ce produit' }, { status: 403 });
    }

    const updates: Partial<Product> = {
      updated_at: new Date().toISOString(),
    };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (price_pi !== undefined) updates.price_pi = parseFloat(price_pi);
    if (category !== undefined) updates.category = category;
    if (image_url !== undefined) updates.image_url = image_url;
    if (images !== undefined) updates.images = images;
    if (status !== undefined) updates.status = status;
    if (stock !== undefined) updates.stock = parseInt(stock);

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select('*')
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ product: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const { searchParams } = new URL(req.url);
    const seller_id = searchParams.get('seller_id');

    if (!seller_id) {
      return NextResponse.json({ error: 'seller_id requis pour confirmation' }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from('products')
      .select('seller_id')
      .eq('id', productId)
      .single();

    if (!existing || existing.seller_id !== seller_id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { error } = await supabaseAdmin.from('products').delete().eq('id', productId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role') || 'buyer'; // 'buyer' or 'seller'

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('orders')
      .select('*, product:products(*), buyer:users!orders_buyer_id_fkey(id, username), seller:users!orders_seller_id_fkey(id, username)')
      .order('created_at', { ascending: false });

    if (role === 'seller') {
      query = query.eq('seller_id', userId);
    } else {
      query = query.eq('buyer_id', userId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { buyer_id, seller_id, product_id, quantity, total_amount_pi, shipping_address, contact_info, notes } = body;

    if (!buyer_id || !product_id || !total_amount_pi) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    const orderNumber = `PI-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        buyer_id,
        seller_id: seller_id || buyer_id,
        product_id,
        quantity: quantity || 1,
        total_amount_pi: parseFloat(total_amount_pi),
        status: 'pending',
        shipping_address: shipping_address || null,
        contact_info: contact_info || null,
        notes: notes || null,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

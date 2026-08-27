import { NextResponse } from 'next/server';
import { completePiPayment } from '@/lib/pi-backend';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { paymentId, txid } = await req.json();
    if (!paymentId || !txid) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });

    const completedPiPayment = await completePiPayment(paymentId, txid);
    const { user_uid, amount, metadata } = completedPiPayment;
    const paymentType = metadata?.type;

    const { data: user } = await supabaseAdmin.from('users').select('id, username').eq('pi_uid', user_uid).single();
    if (!user) return NextResponse.json({ error: 'Utilisateur inconnu' }, { status: 404 });

    let orderId: string | null = null;

    if (paymentType === 'seller_registration') {
      await supabaseAdmin.from('users').update({ is_seller: true, seller_payment_id: paymentId, updated_at: new Date().toISOString() }).eq('id', user.id);
    } else if (paymentType === 'product_publication' && metadata?.product_data) {
      const p = metadata.product_data;
      await supabaseAdmin.from('products').insert({
        seller_id: user.id,
        title: p.title,
        description: p.description,
        price_pi: p.price_pi,
        category: p.category,
        image_url: p.image_url,
        status: 'active',
        publication_payment_id: paymentId,
      }).select().single();
    } else if (paymentType === 'product_purchase' && metadata?.product_id) {
      const productId = metadata.product_id as string;
      const { data: product } = await supabaseAdmin.from('products').select('id, seller_id, title, price_pi').eq('id', productId).single();
      
      const orderNumber = `PI-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
      const { data: newOrder } = await supabaseAdmin.from('orders').insert({
        order_number: orderNumber,
        buyer_id: user.id,
        seller_id: product?.seller_id || user.id,
        product_id: productId,
        quantity: 1,
        total_amount_pi: amount,
        pi_payment_id: paymentId,
        txid: txid,
        status: 'paid',
        shipping_address: (metadata.shipping_address as string) || null,
        contact_info: (metadata.contact_info as string) || null,
      }).select().single();

      if (newOrder) {
        orderId = newOrder.id;
      }
    }

    await supabaseAdmin.from('payments').upsert({
      pi_payment_id: paymentId,
      user_id: user.id,
      product_id: metadata?.product_id || null,
      type: paymentType || 'product_purchase',
      expected_amount: amount,
      actual_amount: amount,
      txid: txid,
      status: 'completed',
      completed_at: new Date().toISOString(),
    }, { onConflict: 'pi_payment_id' });

    return NextResponse.json({ success: true, orderId });
  } catch (err: any) {
    console.error('Completion error:', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur lors de la complétion' }, { status: 500 });
  }
}

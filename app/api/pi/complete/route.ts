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

    const { data: user } = await supabaseAdmin.from('users').select('id').eq('pi_uid', user_uid).single();
    if (!user) return NextResponse.json({ error: 'Utilisateur inconnu' }, { status: 404 });

    if (paymentType === 'seller_registration') {
      await supabaseAdmin.from('users').update({ is_seller: true, seller_payment_id: paymentId }).eq('id', user.id);
    } else if (paymentType === 'product_publication' && metadata?.product_data) {
      const p = metadata.product_data;
      const { data: newProd } = await supabaseAdmin.from('products').insert({
        seller_id: user.id,
        title: p.title,
        description: p.description,
        price_pi: p.price_pi,
        category: p.category,
        image_url: p.image_url,
        status: 'active',
        publication_payment_id: paymentId,
      }).select().single();
    }

    await supabaseAdmin.from('payments').upsert({
      pi_payment_id: paymentId,
      user_id: user.id,
      type: paymentType,
      expected_amount: amount,
      actual_amount: amount,
      txid: txid,
      status: 'completed',
      completed_at: new Date().toISOString(),
    }, { onConflict: 'pi_payment_id' });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
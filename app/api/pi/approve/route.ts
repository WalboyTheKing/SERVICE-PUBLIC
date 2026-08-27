import { NextResponse } from 'next/server';
import { verifyAndFetchPiPayment, approvePiPayment } from '@/lib/pi-backend';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { PI_PRICING } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();
    if (!paymentId) return NextResponse.json({ error: 'paymentId requis' }, { status: 400 });

    const piPayment = await verifyAndFetchPiPayment(paymentId);
    const { user_uid, amount, metadata } = piPayment;
    const paymentType = metadata?.type;

    const { data: user } = await supabaseAdmin.from('users').select('id, is_seller').eq('pi_uid', user_uid).single();
    if (!user) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });

    if (paymentType === 'seller_registration' && Number(amount) !== PI_PRICING.SELLER_REGISTRATION) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }
    if (paymentType === 'product_publication' && Number(amount) !== PI_PRICING.PRODUCT_PUBLICATION) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }

    await approvePiPayment(paymentId);

    await supabaseAdmin.from('payments').upsert({
      pi_payment_id: paymentId,
      user_id: user.id,
      type: paymentType,
      expected_amount: amount,
      status: 'approved',
    }, { onConflict: 'pi_payment_id' });

    return NextResponse.json({ approved: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
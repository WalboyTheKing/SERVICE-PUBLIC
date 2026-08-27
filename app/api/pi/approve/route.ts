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

    if (paymentType === 'seller_registration') {
      if (Number(amount) !== PI_PRICING.SELLER_REGISTRATION) {
        return NextResponse.json({ error: 'Montant invalide pour inscription vendeur' }, { status: 400 });
      }
    } else if (paymentType === 'product_publication') {
      if (Number(amount) !== PI_PRICING.PRODUCT_PUBLICATION) {
        return NextResponse.json({ error: 'Montant invalide pour publication produit' }, { status: 400 });
      }
    } else if (paymentType === 'product_purchase' && metadata?.product_id) {
      // Check product and price
      const { data: product } = await supabaseAdmin.from('products').select('id, price_pi, status').eq('id', metadata.product_id).single();
      if (product && Number(amount) < Number(product.price_pi)) {
        return NextResponse.json({ error: 'Montant insuffisant pour ce produit' }, { status: 400 });
      }
    }

    await approvePiPayment(paymentId);

    await supabaseAdmin.from('payments').upsert({
      pi_payment_id: paymentId,
      user_id: user.id,
      product_id: metadata?.product_id || null,
      type: paymentType || 'product_purchase',
      expected_amount: amount,
      status: 'approved',
    }, { onConflict: 'pi_payment_id' });

    return NextResponse.json({ approved: true });
  } catch (err: any) {
    console.error('Approval error:', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur lors de l\'approbation' }, { status: 500 });
  }
}

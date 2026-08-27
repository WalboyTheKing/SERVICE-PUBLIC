import { NextResponse } from 'next/server';
import { verifyAndFetchPiPayment, approvePiPayment } from '@/lib/pi-backend';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { PI_PRICING } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const paymentId = body.paymentId || body.identifier;

    if (!paymentId || typeof paymentId !== 'string') {
      console.error('[PI PAYMENT] approval rejected: paymentId missing in request body');
      return NextResponse.json({ error: 'paymentId requis' }, { status: 400 });
    }

    console.log(`[PI PAYMENT] approval requested for paymentId: ${paymentId}`);

    // 1. Verify and fetch payment status directly from Pi Server
    const piPayment = await verifyAndFetchPiPayment(paymentId);
    const { user_uid, amount, metadata } = piPayment;
    const paymentType = metadata?.type;

    console.log(`[PI PAYMENT] Payment details from Pi Network: user_uid=${user_uid}, amount=${amount} π, type=${paymentType}`);

    // 2. Find or upsert user in database
    let { data: user } = await supabaseAdmin
      .from('users')
      .select('id, username, is_seller')
      .eq('pi_uid', user_uid)
      .maybeSingle();

    if (!user) {
      console.log(`[PI PAYMENT] User ${user_uid} not yet in database, creating record...`);
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          pi_uid: user_uid,
          username: (metadata?.username as string) || `Pioneer_${user_uid.substring(0, 6)}`,
          is_seller: false,
        })
        .select('id, username, is_seller')
        .single();

      if (createError || !newUser) {
        console.warn('[PI PAYMENT] User upsert fallback error:', createError?.message);
      }
      user = newUser;
    }

    // 3. Validate payment amount according to business logic
    if (paymentType === 'seller_registration') {
      if (Number(amount) !== PI_PRICING.SELLER_REGISTRATION) {
        console.error(`[PI PAYMENT] Invalid amount for seller_registration. Expected ${PI_PRICING.SELLER_REGISTRATION}, received ${amount}`);
        return NextResponse.json({ error: 'Montant invalide pour inscription vendeur (attendu 0.01 π)' }, { status: 400 });
      }
    } else if (paymentType === 'product_publication') {
      if (Number(amount) !== PI_PRICING.PRODUCT_PUBLICATION) {
        console.error(`[PI PAYMENT] Invalid amount for product_publication. Expected ${PI_PRICING.PRODUCT_PUBLICATION}, received ${amount}`);
        return NextResponse.json({ error: 'Montant invalide pour publication produit (attendu 0.001 π)' }, { status: 400 });
      }
    } else if (paymentType === 'product_purchase' && metadata?.product_id) {
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('id, price_pi, status')
        .eq('id', metadata.product_id)
        .maybeSingle();

      if (product && Number(amount) < Number(product.price_pi)) {
        console.error(`[PI PAYMENT] Insufficient amount for product ${metadata.product_id}. Price: ${product.price_pi}, Sent: ${amount}`);
        return NextResponse.json({ error: 'Montant insuffisant pour ce produit' }, { status: 400 });
      }
    } else if (paymentType === 'cart_checkout') {
      if (Number(amount) <= 0) {
        return NextResponse.json({ error: 'Montant du panier invalide' }, { status: 400 });
      }
    }

    // 4. Send official Approval to Pi Network Server
    await approvePiPayment(paymentId);
    console.log(`[PI PAYMENT] approval response: 200 OK sent to client for paymentId: ${paymentId}`);

    // 5. Record approval in Supabase
    if (user?.id) {
      await supabaseAdmin.from('payments').upsert({
        pi_payment_id: paymentId,
        user_id: user.id,
        product_id: (metadata?.product_id as string) || null,
        type: paymentType || 'product_purchase',
        expected_amount: amount,
        status: 'approved',
      }, { onConflict: 'pi_payment_id' });
    }

    return NextResponse.json({ approved: true, paymentId });
  } catch (err: any) {
    console.error('[PI PAYMENT] Approval error:', err.message);
    return NextResponse.json({ error: err.message || 'Erreur serveur lors de l\'approbation' }, { status: 500 });
  }
}


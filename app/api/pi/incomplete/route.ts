import { NextResponse } from 'next/server';
import { verifyAndFetchPiPayment, completePiPayment } from '@/lib/pi-backend';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const payment = body.payment || body;
    const paymentId = payment.identifier || payment.id || payment.paymentId;
    const txid = payment.transaction?.txid || payment.txid;

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId absent' }, { status: 400 });
    }

    console.log(`[PI PAYMENT] Checking incomplete payment: ${paymentId}`);

    // Check if already completed in our database
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('status, txid')
      .eq('pi_payment_id', paymentId)
      .maybeSingle();

    if (existingPayment?.status === 'completed') {
      console.log(`[PI PAYMENT] Payment ${paymentId} was already completed previously.`);
      return NextResponse.json({ status: 'already_completed', handled: paymentId });
    }

    // Verify payment state with Pi Core API
    try {
      const piPayment = await verifyAndFetchPiPayment(paymentId);
      const isVerifiedOnBlockchain = piPayment.status?.transaction_verified;
      const actualTxid = txid || piPayment.transaction?.txid;

      if (isVerifiedOnBlockchain && actualTxid && !piPayment.status?.developer_completed) {
        console.log(`[PI PAYMENT] Incomplete payment is verified on blockchain, completing now: ${paymentId}`);
        await completePiPayment(paymentId, actualTxid);

        if (piPayment.metadata?.type === 'seller_registration') {
          await supabaseAdmin
            .from('users')
            .update({ is_seller: true, seller_payment_id: paymentId, updated_at: new Date().toISOString() })
            .eq('pi_uid', piPayment.user_uid);
        }

        await supabaseAdmin.from('payments').upsert({
          pi_payment_id: paymentId,
          type: piPayment.metadata?.type || 'unknown',
          expected_amount: piPayment.amount,
          actual_amount: piPayment.amount,
          txid: actualTxid,
          status: 'completed',
          completed_at: new Date().toISOString(),
        }, { onConflict: 'pi_payment_id' });
      }
    } catch (e: any) {
      console.warn('[PI PAYMENT] Incomplete payment verification note:', e.message);
    }

    return NextResponse.json({ status: 'ok', handled: paymentId });
  } catch (err: any) {
    console.error('[PI PAYMENT] Error resolving incomplete payment:', err);
    return NextResponse.json({ status: 'ok', error: err.message });
  }
}


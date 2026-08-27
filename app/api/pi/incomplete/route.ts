import { NextResponse } from 'next/server';
import { verifyAndFetchPiPayment, completePiPayment } from '@/lib/pi-backend';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payment = body.payment || body;
    const paymentId = payment.identifier || payment.id || payment.paymentId;
    const txid = payment.transaction?.txid || payment.txid;

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId absent' }, { status: 400 });
    }

    // Verify payment state with Pi server
    try {
      const piPayment = await verifyAndFetchPiPayment(paymentId);
      if (piPayment.status?.transaction_verified && txid) {
        await completePiPayment(paymentId, txid);
      }
    } catch (e: any) {
      console.warn('Handling incomplete payment verification:', e.message);
    }

    return NextResponse.json({ status: 'ok', handled: paymentId });
  } catch (err: any) {
    console.error('Erreur incomplete payment:', err);
    return NextResponse.json({ status: 'ok', error: err.message });
  }
}

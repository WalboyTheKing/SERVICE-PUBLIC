import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  const apiKey = process.env.PI_API_KEY;
  if (!apiKey) {
    console.error('[PI COMPLETE] Erreur: PI_API_KEY non configurée sur le serveur');
    return NextResponse.json({ error: 'PI_API_KEY serveur non configurée' }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const paymentId = body.paymentId || body.identifier;
    const txid = body.txid;

    if (!paymentId || !txid) {
      return NextResponse.json(
        { error: 'paymentId et txid requis pour la complétion' },
        { status: 400 }
      );
    }

    console.log(`[PI COMPLETE] Envoi complétion pour paymentId: ${paymentId}, txid: ${txid}`);

    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        txid: txid,
      }),
      cache: 'no-store',
    });

    const text = await response.text();
    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    console.log(`[PI COMPLETE] Réponse Pi API (${response.status}):`, data);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    try {
      const userUid = data?.user_uid;
      const metadata = data?.metadata;
      const paymentType = metadata?.type;
      const amount = data?.amount;

      let { data: user } = await supabaseAdmin
        .from('users')
        .select('id, username, is_seller')
        .eq('pi_uid', userUid)
        .maybeSingle();

      if (!user && userUid) {
        const { data: newUser } = await supabaseAdmin
          .from('users')
          .insert({
            pi_uid: userUid,
            username: metadata?.username || `Pioneer_${userUid.substring(0, 6)}`,
            is_seller: paymentType === 'seller_registration',
          })
          .select('id, username, is_seller')
          .single();
        user = newUser;
      }

      if (paymentType === 'seller_registration' && user?.id) {
        console.log(`[PI COMPLETE] Activation statut vendeur pour ${user.username}`);
        await supabaseAdmin
          .from('users')
          .update({
            is_seller: true,
            seller_payment_id: paymentId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      }

      if (user?.id) {
        await supabaseAdmin.from('payments').upsert(
          {
            pi_payment_id: paymentId,
            user_id: user.id,
            product_id: (metadata?.product_id as string) || null,
            type: paymentType || 'seller_registration',
            expected_amount: amount,
            actual_amount: amount,
            txid: txid,
            status: 'completed',
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'pi_payment_id' }
        );
      }
    } catch (dbErr: any) {
      console.warn('[PI COMPLETE] Traitement DB non-bloquant:', dbErr?.message);
    }

    return NextResponse.json({ ...data, success: true }, { status: response.status });
  } catch (error: any) {
    console.error('[PI COMPLETE] Exception:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
  }
}

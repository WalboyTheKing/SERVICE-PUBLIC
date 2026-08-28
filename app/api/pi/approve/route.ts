import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  const apiKey = process.env.PI_API_KEY;
  if (!apiKey) {
    console.error('[PI APPROVE] Erreur: PI_API_KEY non configurée sur le serveur');
    return NextResponse.json({ error: 'PI_API_KEY serveur non configurée' }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const paymentId = body.paymentId || body.identifier;

    if (!paymentId || typeof paymentId !== 'string') {
      return NextResponse.json({ error: 'paymentId requis' }, { status: 400 });
    }

    console.log(`[PI APPROVE] Envoi approbation immédiate pour paymentId: ${paymentId}`);

    // 1. Approbation directe et instantanée auprès de Pi Network (Évite le timeout des 60s)
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const text = await response.text();
    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    console.log(`[PI APPROVE] Réponse Pi API (${response.status}):`, data);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // 2. Enregistrement asynchrone dans Supabase (sans bloquer la réponse)
    try {
      const userUid = data?.user_uid;
      const metadata = data?.metadata;
      if (userUid) {
        let { data: user } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('pi_uid', userUid)
          .maybeSingle();

        if (!user) {
          const { data: newUser } = await supabaseAdmin
            .from('users')
            .insert({
              pi_uid: userUid,
              username: metadata?.username || `Pioneer_${userUid.substring(0, 6)}`,
              is_seller: false,
            })
            .select('id')
            .single();
          user = newUser;
        }

        if (user?.id) {
          await supabaseAdmin.from('payments').upsert(
            {
              pi_payment_id: paymentId,
              user_id: user.id,
              product_id: (metadata?.product_id as string) || null,
              type: metadata?.type || 'seller_registration',
              expected_amount: data.amount,
              status: 'approved',
            },
            { onConflict: 'pi_payment_id' }
          );
        }
      }
    } catch (dbErr: any) {
      console.warn('[PI APPROVE] Log DB non-bloquant:', dbErr?.message);
    }

    // 3. Réponse 200 OK immédiate pour que le Pi Browser affiche l'écran de signature
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('[PI APPROVE] Exception:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur lors de l\'approbation' }, { status: 500 });
  }
}

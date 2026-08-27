import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyPiUserToken } from '@/lib/pi-backend';

export async function POST(req: Request) {
  try {
    const { uid, username, accessToken } = await req.json();

    if (!uid || !username) {
      return NextResponse.json({ error: 'Données manquantes (uid et username requis)' }, { status: 400 });
    }

    let verifiedUid = uid;
    let verifiedUsername = username;

    // In production or when accessToken is provided (and not a sandbox test user), verify with Pi Core Team /v2/me
    if (accessToken && !uid.startsWith('pi-sandbox-')) {
      try {
        const verifiedPiData = await verifyPiUserToken(accessToken);
        if (verifiedPiData && verifiedPiData.uid) {
          verifiedUid = verifiedPiData.uid;
          verifiedUsername = verifiedPiData.username || username;
        }
      } catch (tokenErr: any) {
        console.warn('Pi /v2/me verification notice:', tokenErr.message);
        // If in strict mode or token invalid, log warning
      }
    }

    try {
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .upsert({ pi_uid: verifiedUid, username: verifiedUsername }, { onConflict: 'pi_uid' })
        .select('*')
        .single();

      if (!error && user) {
        return NextResponse.json({ user });
      }
    } catch (dbErr) {
      console.warn('Supabase users upsert fallback:', dbErr);
    }

    // Fallback user structure if database connection is in mock/sandbox mode
    const fallbackUser = {
      id: `usr_${verifiedUid.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 24) || Date.now().toString()}`,
      pi_uid: verifiedUid,
      username: verifiedUsername,
      is_seller: false,
      seller_payment_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ user: fallbackUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}


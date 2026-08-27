import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { uid, username } = await req.json();
    if (!uid || !username) {
      return NextResponse.json({ error: 'Données manquantes (uid et username requis)' }, { status: 400 });
    }

    try {
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .upsert({ pi_uid: uid, username: username }, { onConflict: 'pi_uid' })
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
      id: `usr_${uid.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 24) || Date.now().toString()}`,
      pi_uid: uid,
      username: username,
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

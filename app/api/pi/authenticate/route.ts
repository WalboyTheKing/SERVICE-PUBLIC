import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { uid, username } = await req.json();
    if (!uid || !username) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .upsert({ pi_uid: uid, username: username }, { onConflict: 'pi_uid' })
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
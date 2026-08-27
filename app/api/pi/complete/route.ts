import { NextResponse } from 'next/server';
import { completePiPayment } from '@/lib/pi-backend';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const paymentId = body.paymentId || body.identifier;
    const txid = body.txid;

    if (!paymentId || !txid) {
      console.error('[PI PAYMENT] completion rejected: paymentId or txid missing', { paymentId, hasTxid: !!txid });
      return NextResponse.json({ error: 'Champs paymentId et txid obligatoires pour la complétion' }, { status: 400 });
    }

    console.log(`[PI PAYMENT] ready for completion received. paymentId=${paymentId}, txid=${txid}`);

    // 1. Execute completion against Pi Network API
    const completedPiPayment = await completePiPayment(paymentId, txid);
    const { user_uid, amount, metadata } = completedPiPayment;
    const paymentType = metadata?.type;

    console.log(`[PI PAYMENT] completion response verified from Pi API. Type: ${paymentType}, user_uid: ${user_uid}`);

    // 2. Fetch or upsert user
    let { data: user } = await supabaseAdmin
      .from('users')
      .select('id, username, is_seller')
      .eq('pi_uid', user_uid)
      .maybeSingle();

    if (!user) {
      const { data: newUser } = await supabaseAdmin
        .from('users')
        .insert({
          pi_uid: user_uid,
          username: (metadata?.username as string) || `Pioneer_${user_uid.substring(0, 6)}`,
          is_seller: paymentType === 'seller_registration',
        })
        .select('id, username, is_seller')
        .single();
      user = newUser;
    }

    let orderId: string | null = null;

    // 3. Process business action based on verified payment type
    if (paymentType === 'seller_registration') {
      console.log(`[PI PAYMENT] Activating seller status for user ${user?.id} (${user?.username})`);
      if (user?.id) {
        await supabaseAdmin
          .from('users')
          .update({
            is_seller: true,
            seller_payment_id: paymentId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      }
    } else if (paymentType === 'product_publication' && metadata?.product_data) {
      console.log(`[PI PAYMENT] Publishing product for user ${user?.id}`);
      const p = metadata.product_data as any;
      if (user?.id) {
        await supabaseAdmin.from('products').insert({
          seller_id: user.id,
          title: p.title,
          description: p.description,
          price_pi: p.price_pi,
          category: p.category,
          image_url: p.image_url,
          stock: p.stock || 1,
          status: 'active',
          publication_payment_id: paymentId,
        });
      }
    } else if (paymentType === 'product_purchase' || paymentType === 'cart_checkout') {
      const productId = metadata?.product_id as string;
      let sellerId = user?.id;

      if (productId) {
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('id, seller_id, title, price_pi')
          .eq('id', productId)
          .maybeSingle();
        if (product?.seller_id) {
          sellerId = product.seller_id;
        }
      }

      const orderNumber = `PI-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
      console.log(`[PI PAYMENT] Creating order ${orderNumber} for buyer ${user?.id}`);

      const { data: newOrder, error: orderError } = await supabaseAdmin.from('orders').insert({
        order_number: orderNumber,
        buyer_id: user?.id || null,
        seller_id: sellerId,
        product_id: productId || null,
        quantity: 1,
        total_amount_pi: amount,
        pi_payment_id: paymentId,
        txid: txid,
        status: 'paid',
        shipping_address: (metadata?.shipping_address as string) || null,
        contact_info: (metadata?.contact_info as string) || null,
      }).select('id').single();

      if (orderError) {
        console.error('[PI PAYMENT] Error inserting order:', orderError.message);
      } else if (newOrder) {
        orderId = newOrder.id;
      }
    }

    // 4. Update payments table with completed status and blockchain txid
    if (user?.id) {
      await supabaseAdmin.from('payments').upsert({
        pi_payment_id: paymentId,
        user_id: user.id,
        product_id: (metadata?.product_id as string) || null,
        type: paymentType || 'product_purchase',
        expected_amount: amount,
        actual_amount: amount,
        txid: txid,
        status: 'completed',
        completed_at: new Date().toISOString(),
      }, { onConflict: 'pi_payment_id' });
    }

    console.log(`[PI PAYMENT] final status: COMPLETED successfully for paymentId=${paymentId}`);
    return NextResponse.json({ success: true, orderId, paymentId });
  } catch (err: any) {
    console.error('[PI PAYMENT] Completion error:', err.message);
    return NextResponse.json({ error: err.message || 'Erreur serveur lors de la complétion' }, { status: 500 });
  }
}


import { PiPaymentDTO } from '@/types/pi';

const PI_API_URL = 'https://api.minepi.com/v2';

export async function verifyAndFetchPiPayment(paymentId: string): Promise<PiPaymentDTO> {
  const apiKey = process.env.PI_API_KEY;
  if (!apiKey) {
    console.error('[PI PAYMENT] Erreur critique: PI_API_KEY non définie dans les variables d\'environnement');
    throw new Error('PI_API_KEY serveur non configurée');
  }

  console.log(`[PI PAYMENT] paymentId verification requested: ${paymentId}`);

  const res = await fetch(`${PI_API_URL}/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      Authorization: `Key ${apiKey}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    console.error(`[PI PAYMENT] Verification failed (${res.status}):`, errorBody);
    throw new Error(`Erreur vérification Pi Payment (${res.status}): ${errorBody || res.statusText}`);
  }

  const paymentData: PiPaymentDTO = await res.json();
  console.log(`[PI PAYMENT] Payment verified for user_uid: ${paymentData.user_uid}, amount: ${paymentData.amount}`);
  return paymentData;
}

export async function approvePiPayment(paymentId: string): Promise<void> {
  const apiKey = process.env.PI_API_KEY;
  if (!apiKey) {
    console.error('[PI PAYMENT] Erreur critique: PI_API_KEY non définie pour l\'approbation');
    throw new Error('PI_API_KEY serveur non configurée');
  }

  console.log(`[PI PAYMENT] approval requested to Pi API for paymentId: ${paymentId}`);

  const res = await fetch(`${PI_API_URL}/payments/${paymentId}/approve`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    console.error(`[PI PAYMENT] Approval API error (${res.status}):`, errorBody);
    throw new Error(`Erreur approbation Pi Network (${res.status}): ${errorBody || res.statusText}`);
  }

  console.log(`[PI PAYMENT] approval response: SUCCESS for paymentId: ${paymentId}`);
}

export async function completePiPayment(paymentId: string, txid: string): Promise<PiPaymentDTO> {
  const apiKey = process.env.PI_API_KEY;
  if (!apiKey) {
    console.error('[PI PAYMENT] Erreur critique: PI_API_KEY non définie pour la complétion');
    throw new Error('PI_API_KEY serveur non configurée');
  }

  console.log(`[PI PAYMENT] completion requested to Pi API for paymentId: ${paymentId}, txid: ${txid}`);

  const res = await fetch(`${PI_API_URL}/payments/${paymentId}/complete`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ txid }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    console.error(`[PI PAYMENT] Completion API error (${res.status}):`, errorBody);
    throw new Error(`Erreur complétion Pi Network (${res.status}): ${errorBody || res.statusText}`);
  }

  const completedData: PiPaymentDTO = await res.json();
  console.log(`[PI PAYMENT] completion response: SUCCESS for paymentId: ${paymentId}, status: completed`);
  return completedData;
}

export async function verifyPiUserToken(accessToken: string): Promise<{ uid: string; username: string; roles?: string[] }> {
  console.log('[PI AUTH] Validation du token utilisateur via /v2/me');
  const res = await fetch(`${PI_API_URL}/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    console.error(`[PI AUTH] Échec validation token (${res.status}):`, errorBody);
    throw new Error(`Échec de validation du token Pi (/v2/me: ${res.status}) ${errorBody}`);
  }

  return res.json();
}

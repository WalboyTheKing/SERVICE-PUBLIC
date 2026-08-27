import { PiPaymentDTO } from '@/types/pi';

const PI_API_URL = 'https://api.minepi.com/v2';

export async function verifyAndFetchPiPayment(paymentId: string): Promise<PiPaymentDTO> {
  const apiKey = process.env.PI_API_KEY;
  if (!apiKey) {
    throw new Error('PI_API_KEY non configurée');
  }

  const res = await fetch(`${PI_API_URL}/payments/${paymentId}`, {
    method: 'GET',
    headers: { Authorization: `Key ${apiKey}` },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Erreur vérification Pi Payment (${res.status})`);
  return res.json();
}

export async function approvePiPayment(paymentId: string): Promise<void> {
  const apiKey = process.env.PI_API_KEY;
  const res = await fetch(`${PI_API_URL}/payments/${paymentId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Key ${apiKey}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Erreur approbation (${res.status})`);
}

export async function completePiPayment(paymentId: string, txid: string): Promise<PiPaymentDTO> {
  const apiKey = process.env.PI_API_KEY;
  const res = await fetch(`${PI_API_URL}/payments/${paymentId}/complete`, {
    method: 'POST',
    headers: { Authorization: `Key ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ txid }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Erreur complétion (${res.status})`);
  return res.json();
}
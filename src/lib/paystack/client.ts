const PAYSTACK_BASE = "https://api.paystack.co";

function authHeader() {
  return { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` };
}

export async function initializeTransaction(
  email: string,
  amountKobo: number,
  metadata: Record<string, unknown>
): Promise<{ authorization_url: string; reference: string }> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({ email, amount: amountKobo, metadata }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paystack init failed: ${text}`);
  }

  const json = await res.json();
  return {
    authorization_url: json.data.authorization_url as string,
    reference: json.data.reference as string,
  };
}

export async function verifyTransaction(
  reference: string
): Promise<{ status: string; amount: number; metadata: unknown }> {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: authHeader() }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paystack verify failed: ${text}`);
  }

  const json = await res.json();
  return {
    status:   json.data.status   as string,
    amount:   json.data.amount   as number,
    metadata: json.data.metadata as unknown,
  };
}

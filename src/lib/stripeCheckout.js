/**
 * Client helper — starts Stripe Checkout for a Human Weather plan.
 */
export async function startCheckout(planId, { email } = {}) {
  const res = await fetch('/api/stripe/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, email }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    throw new Error(data.error || 'Unable to start checkout');
  }

  window.location.href = data.url;
}

export async function openBillingPortal({ customerId, sessionId } = {}) {
  const res = await fetch('/api/stripe/create-portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerId, sessionId }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    throw new Error(data.error || 'Unable to open billing portal');
  }

  window.location.href = data.url;
}

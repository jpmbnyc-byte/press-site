import { STRIPE_PLANS } from '@/lib/stripePlans';

/**
 * Client helper — starts Stripe Checkout for a Human Weather plan.
 * Prefers the Vercel Checkout Session API; falls back to live Payment Links.
 */
export async function startCheckout(planId, { email } = {}) {
  const plan = STRIPE_PLANS[planId];
  if (!plan) {
    throw new Error(`Unknown plan: ${planId}`);
  }

  try {
    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, email }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) {
      window.location.href = data.url;
      return;
    }
  } catch {
    // Fall through to Payment Link
  }

  if (plan.paymentLinkUrl) {
    window.location.href = plan.paymentLinkUrl;
    return;
  }

  throw new Error('Unable to start checkout');
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

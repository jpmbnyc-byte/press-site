import { base44 } from '@/api/base44Client';

/**
 * Start Stripe Checkout for a plan (requires login).
 * Redirects to /login?next=…&plan=… when unauthenticated.
 */
export async function startCheckout(planId, { email } = {}) {
  if (!planId) throw new Error('planId is required');

  try {
    const res = await base44.functions.invoke('createCheckout', { planId, email });
    const data = res?.data || res;
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
    throw new Error(data?.error || 'Unable to start checkout');
  } catch (err) {
    const status = err?.status || err?.response?.status;
    const code = err?.data?.code || err?.response?.data?.code;
    const message = err?.data?.error || err?.response?.data?.error || err?.message || '';

    if (status === 401 || code === 'auth_required' || /login required/i.test(message)) {
      const next = encodeURIComponent(
        `${window.location.pathname}${window.location.search}`
      );
      window.location.href = `/login?next=${next}&plan=${encodeURIComponent(planId)}`;
      return;
    }
    throw new Error(message || 'Unable to start checkout');
  }
}

export async function openBillingPortal({ sessionId } = {}) {
  try {
    const res = await base44.functions.invoke('createPortal', { sessionId });
    const data = res?.data || res;
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
    throw new Error(data?.error || 'Unable to open billing portal');
  } catch (err) {
    const message = err?.data?.error || err?.response?.data?.error || err?.message;
    throw new Error(message || 'Unable to open billing portal');
  }
}

import { base44 } from '@/api/base44Client';
import { STRIPE_PLANS } from '@/lib/stripePlans';

/**
 * Start membership checkout with a server-created Stripe Checkout Session.
 *
 * Human Weather no longer falls back to legacy Payment Links because those
 * links were created with a free-trial period. If Checkout Sessions are
 * unavailable, fail closed rather than enrolling a reader into a trial.
 */
export async function startCheckout(planId, { email, user } = {}) {
  if (!planId) throw new Error('planId is required');
  if (!STRIPE_PLANS[planId]) {
    throw new Error(`Unknown plan: ${planId}`);
  }

  const resolvedEmail = email || user?.email || undefined;

  try {
    const res = await base44.functions.invoke('createCheckout', {
      planId,
      email: resolvedEmail,
    });
    const data = res?.data || res;
    if (!data?.url) {
      throw new Error(data?.error || 'Checkout session was not created');
    }
    window.location.href = data.url;
    return { source: 'checkout_session' };
  } catch (err) {
    const message = err?.data?.error || err?.response?.data?.error || err?.message || '';
    console.warn('[startCheckout] immediate-charge checkout unavailable', message || err);
    throw new Error(
      'Checkout is temporarily unavailable. No trial or subscription was started. Please try again shortly.',
    );
  }
}

export async function openBillingPortal({ sessionId } = {}) {
  try {
    const res = await base44.functions.invoke('createPortal', { sessionId });
    const data = res?.data || res;
    if (data?.url) {
      window.location.href = data.url;
      return { source: 'portal' };
    }
    throw new Error(data?.error || 'Unable to open billing portal');
  } catch (err) {
    const message = err?.data?.error || err?.response?.data?.error || err?.message || '';
    console.warn('[openBillingPortal] portal unavailable', message || err);
    window.location.href =
      'mailto:hello@humanweather.social?subject=Manage%20Human%20Weather%20membership';
    return { source: 'mailto' };
  }
}

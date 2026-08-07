import { base44 } from '@/api/base44Client';
import { STRIPE_PLANS } from '@/lib/stripePlans';

/**
 * Build a live Stripe Payment Link URL, optionally prefilling email and
 * attaching client_reference_id so webhooks can match a Base44 user later.
 */
export function paymentLinkUrl(planId, { email, clientReferenceId } = {}) {
  const plan = STRIPE_PLANS[planId];
  if (!plan?.paymentLinkUrl) {
    throw new Error(`Unknown plan: ${planId}`);
  }
  const url = new URL(plan.paymentLinkUrl);
  if (email) url.searchParams.set('prefilled_email', email);
  if (clientReferenceId) url.searchParams.set('client_reference_id', clientReferenceId);
  return url.toString();
}

/**
 * Start membership checkout via live Stripe Payment Links.
 *
 * Base44 createCheckout is preferred when backend functions are unlocked
 * (set VITE_USE_STRIPE_CHECKOUT_SESSION=true). Until then, Payment Links are
 * the production path — createCheckout currently returns 402 on this app.
 */
export async function startCheckout(planId, { email, user } = {}) {
  if (!planId) throw new Error('planId is required');
  if (!STRIPE_PLANS[planId]?.paymentLinkUrl) {
    throw new Error(`Unknown plan: ${planId}`);
  }

  const resolvedEmail = email || user?.email || undefined;
  const clientReferenceId = user?.id || undefined;
  const preferSession = import.meta.env.VITE_USE_STRIPE_CHECKOUT_SESSION === 'true';

  if (preferSession) {
    try {
      const res = await base44.functions.invoke('createCheckout', {
        planId,
        email: resolvedEmail,
      });
      const data = res?.data || res;
      if (data?.url) {
        window.location.href = data.url;
        return { source: 'checkout_session' };
      }
    } catch (err) {
      console.warn(
        '[startCheckout] createCheckout failed, using Payment Link',
        err?.data?.error || err?.message || err,
      );
    }
  }

  window.location.href = paymentLinkUrl(planId, {
    email: resolvedEmail,
    clientReferenceId,
  });
  return { source: 'payment_link' };
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

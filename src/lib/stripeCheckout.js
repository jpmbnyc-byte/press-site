import { STRIPE_PLANS } from '@/lib/stripePlans';

/**
 * Start membership checkout via live Stripe Payment Links.
 */
export async function startCheckout(planId) {
  const plan = STRIPE_PLANS[planId];
  if (!plan?.paymentLinkUrl) {
    throw new Error(`Unknown plan: ${planId}`);
  }
  window.location.href = plan.paymentLinkUrl;
}

export async function openBillingPortal() {
  // Customer Portal needs a server route + Stripe customer id.
  // Direct members to email support until portal API is restored.
  window.location.href = 'mailto:hello@humanweather.social?subject=Manage%20Human%20Weather%20membership';
}

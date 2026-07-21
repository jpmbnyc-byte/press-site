/**
 * Human Weather subscription plan catalog (public identifiers only).
 * Stripe Price IDs for server Checkout come from Vercel env.
 * Payment Link URLs are public and safe to ship in the client.
 */
export const STRIPE_PLANS = {
  member_monthly: {
    id: 'member_monthly',
    name: 'Member',
    interval: 'month',
    amountLabel: '$9/mo',
    trialDays: 7,
    envPriceKey: 'STRIPE_PRICE_MEMBER_MONTHLY',
    paymentLinkUrl: 'https://buy.stripe.com/fZuaEYbbh4UabB94kt8N204',
  },
  member_yearly: {
    id: 'member_yearly',
    name: 'Member',
    interval: 'year',
    amountLabel: '$72/yr',
    trialDays: 7,
    envPriceKey: 'STRIPE_PRICE_MEMBER_YEARLY',
    paymentLinkUrl: 'https://buy.stripe.com/cNi4gAdjpeuKgVt8AJ8N205',
  },
  member_app_yearly: {
    id: 'member_app_yearly',
    name: 'Member + App',
    interval: 'year',
    amountLabel: '$96/year',
    trialDays: 7,
    envPriceKey: 'STRIPE_PRICE_MEMBER_APP_YEARLY',
    paymentLinkUrl: 'https://buy.stripe.com/bJeeVe1AHfyO5cL18h8N206',
  },
};

export const PLAN_IDS = Object.keys(STRIPE_PLANS);

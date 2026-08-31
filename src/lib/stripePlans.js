/**
 * Human Weather subscription plan catalog (public identifiers only).
 *
 * Memberships charge immediately at checkout. Legacy Payment Link URLs remain
 * documented here only for historical reference and are not used by the app.
 * Server Checkout Price IDs live in Base44 function secrets.
 */
export const STRIPE_PLANS = {
  member_monthly: {
    id: 'member_monthly',
    name: 'Member',
    interval: 'month',
    amountLabel: '$9/mo',
    trialDays: 0,
    envPriceKey: 'STRIPE_PRICE_MEMBER_MONTHLY',
    legacyPaymentLinkUrl: 'https://buy.stripe.com/fZuaEYbbh4UabB94kt8N204',
  },
  member_yearly: {
    id: 'member_yearly',
    name: 'Member',
    interval: 'year',
    amountLabel: '$72/yr',
    trialDays: 0,
    envPriceKey: 'STRIPE_PRICE_MEMBER_YEARLY',
    legacyPaymentLinkUrl: 'https://buy.stripe.com/cNi4gAdjpeuKgVt8AJ8N205',
  },
  member_app_yearly: {
    id: 'member_app_yearly',
    name: 'Member + App',
    interval: 'year',
    amountLabel: '$96/year',
    trialDays: 0,
    envPriceKey: 'STRIPE_PRICE_MEMBER_APP_YEARLY',
    legacyPaymentLinkUrl: 'https://buy.stripe.com/bJeeVe1AHfyO5cL18h8N206',
  },
};

export const PLAN_IDS = Object.keys(STRIPE_PLANS);

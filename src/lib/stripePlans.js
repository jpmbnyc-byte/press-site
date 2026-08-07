/**
 * Human Weather subscription plan catalog (public identifiers only).
 *
 * Payment Link URLs are live-mode Stripe links (acct Human Weather) and are
 * safe to ship in the client. Server Checkout Price IDs live in Base44
 * function secrets when backend functions are enabled.
 */
export const STRIPE_PLANS = {
  member_monthly: {
    id: 'member_monthly',
    name: 'Member',
    interval: 'month',
    amountLabel: '$9/mo',
    trialDays: 7,
    envPriceKey: 'STRIPE_PRICE_MEMBER_MONTHLY',
    // Live Payment Link — Human Weather Member ($9/mo, 7-day trial)
    paymentLinkUrl: 'https://buy.stripe.com/fZuaEYbbh4UabB94kt8N204',
  },
  member_yearly: {
    id: 'member_yearly',
    name: 'Member',
    interval: 'year',
    amountLabel: '$72/yr',
    trialDays: 7,
    envPriceKey: 'STRIPE_PRICE_MEMBER_YEARLY',
    // Live Payment Link — Human Weather Member Annual ($72/yr, 7-day trial)
    paymentLinkUrl: 'https://buy.stripe.com/cNi4gAdjpeuKgVt8AJ8N205',
  },
  member_app_yearly: {
    id: 'member_app_yearly',
    name: 'Member + App',
    interval: 'year',
    amountLabel: '$96/year',
    trialDays: 7,
    envPriceKey: 'STRIPE_PRICE_MEMBER_APP_YEARLY',
    // Live Payment Link — Member + App ($96/yr, 7-day trial)
    paymentLinkUrl: 'https://buy.stripe.com/bJeeVe1AHfyO5cL18h8N206',
  },
};

export const PLAN_IDS = Object.keys(STRIPE_PLANS);

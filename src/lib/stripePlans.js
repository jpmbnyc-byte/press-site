/**
 * Human Weather subscription plan catalog (public identifiers only).
 * Stripe Price IDs come from server env — never hardcode secrets here.
 */
export const STRIPE_PLANS = {
  member_monthly: {
    id: 'member_monthly',
    name: 'Member',
    interval: 'month',
    amountLabel: '$9/mo',
    trialDays: 7,
    envPriceKey: 'STRIPE_PRICE_MEMBER_MONTHLY',
  },
  member_yearly: {
    id: 'member_yearly',
    name: 'Member',
    interval: 'year',
    amountLabel: '$72/yr',
    trialDays: 7,
    envPriceKey: 'STRIPE_PRICE_MEMBER_YEARLY',
  },
  member_app_yearly: {
    id: 'member_app_yearly',
    name: 'Member + App',
    interval: 'year',
    amountLabel: '$96/year',
    trialDays: 7,
    envPriceKey: 'STRIPE_PRICE_MEMBER_APP_YEARLY',
  },
};

export const PLAN_IDS = Object.keys(STRIPE_PLANS);

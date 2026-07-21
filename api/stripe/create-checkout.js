import { getStripe, getSiteOrigin, getPriceIdForPlan, setCors } from './_lib.js';

const TRIAL_DAYS = 7;

export default async function handler(req, res) {
  const origin = getSiteOrigin(req);
  setCors(res, origin);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { planId, email } = body;

    if (!planId) {
      return res.status(400).json({ error: 'planId is required' });
    }

    const priceId = getPriceIdForPlan(planId);
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_email: email || undefined,
      client_reference_id: planId,
      metadata: {
        planId,
        product: 'human_weather_press',
      },
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: {
          planId,
          product: 'human_weather_press',
        },
      },
    });

    return res.status(200).json({ url: session.url, id: session.id });
  } catch (error) {
    console.error('[stripe/create-checkout]', error);
    return res.status(500).json({
      error: error.message || 'Unable to create checkout session',
    });
  }
}

const { getStripe, getSiteOrigin, setCors, readJsonBody } = require('./_lib');

module.exports = async function handler(req, res) {
  const origin = getSiteOrigin(req);
  setCors(res, origin);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await readJsonBody(req);
    const { customerId, sessionId } = body;

    const stripe = getStripe();
    let customer = customerId;

    if (!customer && sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      customer = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    }

    if (!customer) {
      return res.status(400).json({ error: 'customerId or sessionId is required' });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${origin}/subscribe`,
    });

    return res.status(200).json({ url: portal.url });
  } catch (error) {
    console.error('[stripe/create-portal]', error);
    return res.status(500).json({
      error: error.message || 'Unable to open billing portal',
    });
  }
};

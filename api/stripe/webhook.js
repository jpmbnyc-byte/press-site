const { getStripe } = require('./_lib');

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET missing');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  try {
    const stripe = getStripe();
    const buf = await readRawBody(req);
    const signature = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(buf, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('[stripe/webhook] checkout.session.completed', {
          id: session.id,
          customer: session.customer,
          subscription: session.subscription,
          planId: session.metadata?.planId || session.client_reference_id,
        });
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        console.log(`[stripe/webhook] ${event.type}`, {
          id: sub.id,
          status: sub.status,
          planId: sub.metadata?.planId,
        });
        break;
      }
      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[stripe/webhook]', error);
    return res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }
}

// Disable body parsing so Stripe signature verification receives the raw body.
handler.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = handler;

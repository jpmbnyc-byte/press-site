/**
 * Shared Stripe helpers for Vercel serverless routes.
 * Filename prefixed with _ so Vercel does not deploy it as its own function.
 */
const Stripe = require('stripe');

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(key, {
    apiVersion: '2026-06-24.dahlia',
  });
}

function getSiteOrigin(req) {
  const fromEnv = process.env.SITE_URL || process.env.VITE_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

function getPriceIdForPlan(planId) {
  const map = {
    member_monthly: process.env.STRIPE_PRICE_MEMBER_MONTHLY,
    member_yearly: process.env.STRIPE_PRICE_MEMBER_YEARLY,
    member_app_yearly: process.env.STRIPE_PRICE_MEMBER_APP_YEARLY,
  };
  const priceId = map[planId];
  if (!priceId) {
    throw new Error(`Missing Stripe price for plan: ${planId}`);
  }
  return priceId;
}

function setCors(res, origin) {
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body) {
    return JSON.parse(req.body);
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}

module.exports = {
  getStripe,
  getSiteOrigin,
  getPriceIdForPlan,
  setCors,
  readJsonBody,
};

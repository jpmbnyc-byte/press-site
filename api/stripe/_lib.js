/**
 * Shared Stripe helpers for Vercel serverless routes.
 */
import Stripe from 'stripe';

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(key, {
    apiVersion: '2026-06-24.dahlia',
  });
}

export function getSiteOrigin(req) {
  const fromEnv = process.env.SITE_URL || process.env.VITE_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

export function getPriceIdForPlan(planId) {
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

export function setCors(res, origin) {
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');
}

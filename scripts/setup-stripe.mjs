#!/usr/bin/env node
/**
 * Create Human Weather Stripe Products, Prices, and Payment Links.
 *
 * Usage (live):
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/setup-stripe.mjs
 *
 * Usage (test/sandbox):
 *   STRIPE_SECRET_KEY=rk_test_... node scripts/setup-stripe.mjs
 *
 * Writes scripts/.stripe-setup.json and prints Vercel env lines.
 * Never commit secret keys.
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const key = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY;

if (!key) {
  console.error('Set STRIPE_SECRET_KEY (sk_live_... or test key) before running.');
  process.exit(1);
}

let Stripe;
try {
  Stripe = createRequire(import.meta.url)('stripe');
} catch {
  console.error('Missing dependency. Run: npm install stripe --no-save');
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: '2026-06-24.dahlia' });
const isLive = key.includes('_live_');

const SITE_URL = (process.env.SITE_URL || 'https://www.humanweather.press').replace(/\/$/, '');

const catalog = [
  {
    planId: 'member_monthly',
    productName: 'Human Weather Member',
    description: 'All 49 essays across seven series, archive access, member dispatch. 7-day free trial.',
    unitAmount: 900,
    interval: 'month',
    envKey: 'STRIPE_PRICE_MEMBER_MONTHLY',
  },
  {
    planId: 'member_yearly',
    productName: 'Human Weather Member (Annual)',
    description: 'Annual Member — all essays + archive. Save vs monthly. 7-day free trial.',
    unitAmount: 7200,
    interval: 'year',
    envKey: 'STRIPE_PRICE_MEMBER_YEARLY',
  },
  {
    planId: 'member_app_yearly',
    productName: 'Human Weather Member + App',
    description: 'Member benefits + humanweather.social app premium. Founding member tier. 7-day free trial.',
    unitAmount: 9600,
    interval: 'year',
    envKey: 'STRIPE_PRICE_MEMBER_APP_YEARLY',
  },
];

async function findExistingProduct(name) {
  const list = await stripe.products.list({ limit: 100, active: true });
  return list.data.find((p) => p.name === name && p.metadata?.human_weather === 'true');
}

async function ensureProduct(item) {
  const existing = await findExistingProduct(item.productName);
  if (existing) return existing;
  return stripe.products.create({
    name: item.productName,
    description: item.description,
    metadata: {
      human_weather: 'true',
      planId: item.planId,
    },
  });
}

async function ensurePrice(product, item) {
  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 20 });
  const match = prices.data.find(
    (p) =>
      p.unit_amount === item.unitAmount &&
      p.recurring?.interval === item.interval &&
      p.currency === 'usd'
  );
  if (match) return match;

  return stripe.prices.create({
    product: product.id,
    unit_amount: item.unitAmount,
    currency: 'usd',
    recurring: { interval: item.interval },
    metadata: {
      human_weather: 'true',
      planId: item.planId,
    },
  });
}

async function ensurePaymentLink(price, item) {
  try {
    const links = await stripe.paymentLinks.list({ limit: 100, active: true });
    const existing = links.data.find(
      (l) =>
        l.metadata?.planId === item.planId &&
        l.line_items?.data?.some?.((li) => li.price?.id === price.id)
    );
    // list doesn't expand line_items by default — match by metadata alone
    const byMeta = links.data.find((l) => l.metadata?.planId === item.planId);
    if (byMeta) return byMeta;

    return stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      after_completion: {
        type: 'redirect',
        redirect: { url: `${SITE_URL}/subscribe/success` },
      },
      subscription_data: {
        trial_period_days: 7,
        metadata: { planId: item.planId, product: 'human_weather_press' },
      },
      allow_promotion_codes: true,
      metadata: {
        human_weather: 'true',
        planId: item.planId,
      },
    });
  } catch (err) {
    // Restricted keys may not allow payment links — non-fatal
    console.warn(`Payment link skipped for ${item.planId}: ${err.message}`);
    return null;
  }
}

async function ensurePortalConfig() {
  try {
    const configs = await stripe.billingPortal.configurations.list({ limit: 5 });
    if (configs.data.length) return configs.data[0];
    return stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Human Weather — Manage your membership',
      },
      features: {
        customer_update: { enabled: true, allowed_updates: ['email', 'address'] },
        invoice_history: { enabled: true },
        payment_method_update: { enabled: true },
        subscription_cancel: { enabled: true, mode: 'at_period_end' },
        subscription_update: { enabled: false },
      },
    });
  } catch (err) {
    console.warn(`Billing portal config skipped: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log(`\nHuman Weather Stripe setup (${isLive ? 'LIVE' : 'TEST'})\n`);

  const results = [];
  for (const item of catalog) {
    const product = await ensureProduct(item);
    const price = await ensurePrice(product, item);
    const paymentLink = await ensurePaymentLink(price, item);
    results.push({
      planId: item.planId,
      envKey: item.envKey,
      productId: product.id,
      priceId: price.id,
      paymentLinkUrl: paymentLink?.url || null,
      amount: item.unitAmount,
      interval: item.interval,
    });
    console.log(`✓ ${item.planId}`);
    console.log(`  product: ${product.id}`);
    console.log(`  price:   ${price.id}`);
    if (paymentLink?.url) console.log(`  link:    ${paymentLink.url}`);
  }

  await ensurePortalConfig();

  const out = {
    mode: isLive ? 'live' : 'test',
    createdAt: new Date().toISOString(),
    siteUrl: SITE_URL,
    plans: results,
  };

  const outPath = resolve(__dirname, '.stripe-setup.json');
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${outPath}`);

  console.log('\n--- Add these to Vercel Environment Variables ---\n');
  console.log(`STRIPE_SECRET_KEY=${isLive ? 'sk_live_...' : 'sk_test_...'}  # your secret/restricted key`);
  for (const r of results) {
    console.log(`${r.envKey}=${r.priceId}`);
  }
  console.log(`SITE_URL=${SITE_URL}`);
  console.log('STRIPE_WEBHOOK_SECRET=whsec_...  # from Stripe webhook endpoint');
  console.log('\nWebhook endpoint:');
  console.log(`  ${SITE_URL}/api/stripe/webhook`);
  console.log('  Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted');
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

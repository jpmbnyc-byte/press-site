/** Shared Stripe REST helpers for Base44 Deno functions (no stripe npm SDK). */

export const PLAN_PRICE_ENV: Record<string, string> = {
  member_monthly: "STRIPE_PRICE_MEMBER_MONTHLY",
  member_yearly: "STRIPE_PRICE_MEMBER_YEARLY",
  member_app_yearly: "STRIPE_PRICE_MEMBER_APP_YEARLY",
};

export const BUNDLE_PLAN_ID = "member_app_yearly";

export function getStripeSecret(): string {
  const key = Deno.env.get("STRIPE_SECRET_KEY") || Deno.env.get("STRIPE_API_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return key;
}

export function getSiteUrl(): string {
  return (Deno.env.get("SITE_URL") || "https://humanweather.vercel.app").replace(/\/$/, "");
}

export function getPriceId(planId: string): string {
  const envKey = PLAN_PRICE_ENV[planId];
  if (!envKey) throw new Error(`Unknown plan: ${planId}`);
  const priceId = Deno.env.get(envKey);
  if (!priceId) throw new Error(`Missing env ${envKey}`);
  return priceId;
}

export function isBundlePlan(planId: string | null | undefined): boolean {
  return planId === BUNDLE_PLAN_ID;
}

export function hasActiveMembership(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

export async function stripeRequest(
  path: string,
  options: { method?: string; body?: URLSearchParams | string; rawBody?: boolean } = {},
) {
  const key = getStripeSecret();
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: options.method || "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: options.body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Stripe error ${res.status}`);
  }
  return data;
}

export async function stripeGet(path: string) {
  const key = getStripeSecret();
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Stripe error ${res.status}`);
  }
  return data;
}

/** Verify Stripe webhook signature (HMAC SHA-256). */
export async function verifyStripeWebhook(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): Promise<Record<string, unknown>> {
  if (!signatureHeader) throw new Error("Missing Stripe-Signature header");

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k.trim(), v];
    }),
  );
  const timestamp = parts.t;
  const v1 = parts.v1;
  if (!timestamp || !v1) throw new Error("Invalid Stripe-Signature header");

  const age = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (Math.abs(age) > 300) throw new Error("Webhook timestamp too old");

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${timestamp}.${rawBody}`),
  );
  const digest = [...new Uint8Array(signed)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (digest !== v1) throw new Error("Invalid webhook signature");
  return JSON.parse(rawBody);
}

export function randomToken(bytes = 24): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return [...arr].map((b) => b.toString(16).padStart(2, "0")).join("");
}

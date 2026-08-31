import { createClientFromRequest } from "npm:@base44/sdk";
import { getPriceId, getSiteUrl, stripeRequest } from "../../shared/stripe.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.id) {
      return Response.json(
        { error: "Login required", code: "auth_required" },
        { status: 401 },
      );
    }

    const { planId } = await req.json();
    if (!planId) {
      return Response.json({ error: "planId is required" }, { status: 400 });
    }

    const priceId = getPriceId(planId);
    const site = getSiteUrl();

    const params = new URLSearchParams();
    params.set("mode", "subscription");
    params.set("success_url", `${site}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", `${site}/subscribe`);
    params.set("client_reference_id", user.id);
    params.set("allow_promotion_codes", "true");
    params.set("billing_address_collection", "auto");
    params.set("line_items[0][price]", priceId);
    params.set("line_items[0][quantity]", "1");
    // No trial period: Stripe creates and charges the first subscription invoice immediately.
    params.set("subscription_data[metadata][planId]", planId);
    params.set("subscription_data[metadata][base44_user_id]", user.id);
    params.set("subscription_data[metadata][email]", user.email || "");
    params.set("metadata[planId]", planId);
    params.set("metadata[base44_user_id]", user.id);
    params.set("metadata[product]", "human_weather_press");

    if (user.stripe_customer_id) {
      params.set("customer", user.stripe_customer_id);
    } else if (user.email) {
      params.set("customer_email", user.email);
    }

    const session = await stripeRequest("/checkout/sessions", { body: params });
    return Response.json({ url: session.url, id: session.id });
  } catch (error) {
    console.error("[createCheckout]", error);
    return Response.json(
      { error: (error as Error).message || "Unable to create checkout" },
      { status: 500 },
    );
  }
});

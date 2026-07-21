import { createClientFromRequest } from "npm:@base44/sdk";
import { getSiteUrl, stripeGet, stripeRequest } from "../../shared/stripe.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.id) {
      return Response.json({ error: "Login required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    let customerId = user.stripe_customer_id || body.customerId;

    if (!customerId && body.sessionId) {
      const session = await stripeGet(`/checkout/sessions/${body.sessionId}`);
      customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id;
      if (customerId && !user.stripe_customer_id) {
        await base44.auth.updateMe({ stripe_customer_id: customerId });
      }
    }

    if (!customerId) {
      return Response.json(
        { error: "No Stripe customer on this account yet" },
        { status: 400 },
      );
    }

    const params = new URLSearchParams();
    params.set("customer", customerId);
    params.set("return_url", `${getSiteUrl()}/account`);

    const portal = await stripeRequest("/billing_portal/sessions", { body: params });
    return Response.json({ url: portal.url });
  } catch (error) {
    console.error("[createPortal]", error);
    return Response.json(
      { error: (error as Error).message || "Unable to open portal" },
      { status: 500 },
    );
  }
});

import { createClientFromRequest } from "npm:@base44/sdk";
import {
  getStripeSecret,
  stripeGet,
  verifyStripeWebhook,
} from "../../shared/stripe.ts";
import {
  applyMembershipToUser,
  buildMembershipUpdate,
  findUserByEmail,
  findUserById,
  findUserByStripeCustomer,
} from "../../shared/membership.ts";

async function resolveUser(base44: any, opts: {
  userId?: string | null;
  email?: string | null;
  customerId?: string | null;
}) {
  if (opts.userId) {
    const byId = await findUserById(base44, opts.userId);
    if (byId) return byId;
  }
  if (opts.customerId) {
    const byCustomer = await findUserByStripeCustomer(base44, opts.customerId);
    if (byCustomer) return byCustomer;
  }
  if (opts.email) {
    return findUserByEmail(base44, opts.email);
  }
  return null;
}

async function handleCheckoutCompleted(base44: any, session: Record<string, any>) {
  const userId =
    session.client_reference_id ||
    session.metadata?.base44_user_id ||
    null;
  const email =
    session.customer_details?.email ||
    session.customer_email ||
    session.metadata?.email ||
    null;
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  let subscription: Record<string, any> | null = null;
  if (session.subscription) {
    const subId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
    subscription = await stripeGet(`/subscriptions/${subId}`);
  }

  const resolvedPlan =
    session.metadata?.planId ||
    subscription?.metadata?.planId ||
    "";

  const user = await resolveUser(base44, { userId, email, customerId });
  if (!user) {
    console.warn("[stripeWebhook] checkout.session.completed — no matching user", {
      userId,
      email,
      customerId,
    });
    return { matched: false };
  }

  const update = buildMembershipUpdate({
    planId: resolvedPlan,
    status: subscription?.status || "active",
    customerId,
    periodEnd: subscription?.current_period_end || null,
    existing: user,
  });

  await applyMembershipToUser(base44, user, update);
  console.log("[stripeWebhook] membership granted", {
    userId: user.id,
    email: user.email,
    ...update,
  });
  return { matched: true, userId: user.id, update };
}

async function handleSubscriptionChange(base44: any, sub: Record<string, any>) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  const planId = sub.metadata?.planId || "";
  const email = sub.metadata?.email || null;
  const userId = sub.metadata?.base44_user_id || null;

  const user = await resolveUser(base44, { userId, email, customerId });
  if (!user) {
    console.warn("[stripeWebhook] subscription event — no matching user", {
      subId: sub.id,
      customerId,
    });
    return { matched: false };
  }

  const update = buildMembershipUpdate({
    planId: planId || user.membership_plan,
    status: sub.status,
    customerId,
    periodEnd: sub.current_period_end || null,
    existing: user,
  });

  await applyMembershipToUser(base44, user, update);
  return { matched: true, userId: user.id, update };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    return Response.json({ error: "STRIPE_WEBHOOK_SECRET missing" }, { status: 500 });
  }

  // Ensure Stripe key is present (used when expanding subscription)
  try {
    getStripeSecret();
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");
    const event = await verifyStripeWebhook(rawBody, signature, webhookSecret);

    let result: Record<string, unknown> = { received: true, type: event.type };

    switch (event.type) {
      case "checkout.session.completed": {
        result = {
          ...result,
          ...(await handleCheckoutCompleted(base44, event.data.object as Record<string, any>)),
        };
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        result = {
          ...result,
          ...(await handleSubscriptionChange(base44, event.data.object as Record<string, any>)),
        };
        break;
      }
      default:
        break;
    }

    return Response.json(result);
  } catch (error) {
    console.error("[stripeWebhook]", error);
    return Response.json(
      { error: (error as Error).message || "Webhook error" },
      { status: 400 },
    );
  }
});

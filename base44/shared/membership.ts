import {
  BUNDLE_PLAN_ID,
  hasActiveMembership,
  isBundlePlan,
  randomToken,
} from "./stripe.ts";

type AnyUser = Record<string, unknown> & {
  id?: string;
  email?: string;
  stripe_customer_id?: string;
  membership_plan?: string;
  membership_status?: string;
  app_access?: boolean;
  app_unlock_token?: string;
};

export async function findUserByEmail(base44: any, email: string): Promise<AnyUser | null> {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  try {
    const matches = await base44.asServiceRole.entities.User.filter({ email: normalized });
    if (Array.isArray(matches) && matches.length) return matches[0];
  } catch {
    /* fall through to list scan */
  }
  try {
    const all = await base44.asServiceRole.entities.User.list("-created_date", 200);
    return (
      (all || []).find(
        (u: AnyUser) => String(u.email || "").trim().toLowerCase() === normalized,
      ) || null
    );
  } catch {
    return null;
  }
}

export async function findUserById(base44: any, id: string): Promise<AnyUser | null> {
  if (!id) return null;
  try {
    return await base44.asServiceRole.entities.User.get(id);
  } catch {
    return null;
  }
}

export async function findUserByStripeCustomer(
  base44: any,
  customerId: string,
): Promise<AnyUser | null> {
  if (!customerId) return null;
  try {
    const matches = await base44.asServiceRole.entities.User.filter({
      stripe_customer_id: customerId,
    });
    if (Array.isArray(matches) && matches.length) return matches[0];
  } catch {
    /* ignore */
  }
  return null;
}

export function buildMembershipUpdate(opts: {
  planId?: string | null;
  status: string;
  customerId?: string | null;
  periodEnd?: number | null;
  existing?: AnyUser | null;
}): Record<string, unknown> {
  const planId = opts.planId || opts.existing?.membership_plan || "";
  const active = hasActiveMembership(opts.status);
  const bundle = active && isBundlePlan(planId);

  const update: Record<string, unknown> = {
    membership_status: opts.status || "none",
    membership_plan: planId || "",
  };

  if (opts.customerId) update.stripe_customer_id = opts.customerId;
  if (opts.periodEnd) {
    update.membership_period_end = new Date(opts.periodEnd * 1000).toISOString();
  }

  if (bundle) {
    update.app_access = true;
    update.app_access_granted_at =
      opts.existing?.app_access_granted_at || new Date().toISOString();
    update.app_unlock_token = opts.existing?.app_unlock_token || randomToken(24);
  } else if (!active) {
    update.app_access = false;
  } else if (planId && planId !== BUNDLE_PLAN_ID) {
    // Press-only plans do not unlock the PWA
    update.app_access = false;
  }

  return update;
}

export async function applyMembershipToUser(
  base44: any,
  user: AnyUser,
  update: Record<string, unknown>,
) {
  return base44.asServiceRole.entities.User.update(user.id, update);
}

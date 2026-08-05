/**
 * Called by humanweather.social (or this press site) to verify Member + App
 * bundle entitlement. Public HTTP endpoint — no user JWT required.
 *
 * POST { email, token? }
 * → { access: boolean, plan?, status?, unlock_url? }
 */
import { createClientFromRequest } from "npm:@base44/sdk";
import { hasActiveMembership, isBundlePlan } from "../../shared/stripe.ts";
import { findUserByEmail } from "../../shared/membership.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { email, token } = await req.json();
    if (!email) {
      return Response.json({ error: "email is required" }, { status: 400 });
    }

    const user = await findUserByEmail(base44, email);
    if (!user) {
      return Response.json({ access: false, reason: "user_not_found" });
    }

    const active = hasActiveMembership(String(user.membership_status || ""));
    const bundle = isBundlePlan(String(user.membership_plan || ""));
    const tokenOk =
      !token ||
      !user.app_unlock_token ||
      String(token) === String(user.app_unlock_token);

    const access = Boolean(user.app_access) && active && bundle && tokenOk;

    const appUrl = (Deno.env.get("HW_SOCIAL_APP_URL") || "https://humanweather.social").replace(
      /\/$/,
      "",
    );

    return Response.json({
      access,
      plan: user.membership_plan || null,
      status: user.membership_status || "none",
      email: user.email,
      unlock_url: access
        ? `${appUrl}/?hw_unlock=1&email=${encodeURIComponent(String(user.email || ""))}&token=${encodeURIComponent(String(user.app_unlock_token || ""))}`
        : null,
      reason: access
        ? "ok"
        : !active
          ? "membership_inactive"
          : !bundle
            ? "not_bundle_plan"
            : !tokenOk
              ? "invalid_token"
              : "no_app_access",
    }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    console.error("[verifyAppAccess]", error);
    return Response.json(
      { error: (error as Error).message || "Verification failed" },
      { status: 500 },
    );
  }
});

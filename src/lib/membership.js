/** Client-side membership entitlement helpers. */

export const BUNDLE_PLAN_ID = 'member_app_yearly';
export const HW_SOCIAL_APP_URL = 'https://humanweather.social';

export function hasPressAccess(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const status = user.membership_status;
  return status === 'active' || status === 'trialing';
}

export function hasAppAccess(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return (
    Boolean(user.app_access) &&
    hasPressAccess(user) &&
    user.membership_plan === BUNDLE_PLAN_ID
  );
}

export function isBundlePlan(planId) {
  return planId === BUNDLE_PLAN_ID;
}

export function getAppUnlockUrl(user) {
  if (!hasAppAccess(user)) return null;
  const email = encodeURIComponent(user.email || '');
  const token = encodeURIComponent(user.app_unlock_token || '');
  return `${HW_SOCIAL_APP_URL}/?hw_unlock=1&email=${email}&token=${token}`;
}

/** Show a free preview of a members essay body. */
export function previewMembersBody(bodyMd = '', maxParagraphs = 3) {
  if (!bodyMd) return '';
  const parts = bodyMd.split(/\n\s*\n/);
  if (parts.length <= maxParagraphs) {
    // Still truncate long single blocks
    const chars = bodyMd.slice(0, 900);
    return chars.length < bodyMd.length ? `${chars.trimEnd()}\n\n…` : bodyMd;
  }
  return `${parts.slice(0, maxParagraphs).join('\n\n').trimEnd()}\n\n…`;
}

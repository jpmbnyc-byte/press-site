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

const DEFAULT_WORDS_PER_MINUTE = 200;

function countWords(text = '') {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Show a free preview of a members essay body (short paragraph cut). */
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

/**
 * Preview cut by reading time. Prefer the essay's own reading_time_mins so
 * "3 minutes" matches the published estimate; fall back to ~200 wpm.
 */
export function previewMembersBodyByMinutes(
  bodyMd = '',
  { minutes = 3, readingTimeMins, wordsPerMinute = DEFAULT_WORDS_PER_MINUTE } = {}
) {
  if (!bodyMd) return '';
  const totalWords = countWords(bodyMd);
  if (!totalWords) return '';

  const wpm =
    readingTimeMins && readingTimeMins > 0
      ? totalWords / readingTimeMins
      : wordsPerMinute;
  const wordLimit = Math.max(1, Math.round(wpm * minutes));

  if (totalWords <= wordLimit) return bodyMd;

  // Keep whole paragraphs, including the one that crosses the minute mark,
  // so the preview lands near the requested reading time.
  const parts = bodyMd.split(/\n\s*\n/);
  let used = 0;
  const kept = [];
  for (const part of parts) {
    const partWords = countWords(part);
    kept.push(part);
    used += partWords;
    if (used >= wordLimit) break;
  }

  if (!kept.length) {
    return `${bodyMd.trim().split(/\s+/).slice(0, wordLimit).join(' ')}\n\n…`;
  }
  return `${kept.join('\n\n').trimEnd()}\n\n…`;
}

export const WATERS_EDGE_SLUG = 'relational-faith-the-mirror-at-the-waters-edge';
export const WATERS_EDGE_PREVIEW_MINUTES = 3;

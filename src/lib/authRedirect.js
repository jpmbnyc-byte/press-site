import { SITE_URL } from '@/lib/site';

/** Base44-hosted app origin — allowed for OAuth return callbacks. */
export const BASE44_HOSTED_ORIGIN = 'https://humanweather.base44.app';

function normalizePath(destPath = '/account') {
  if (!destPath || typeof destPath !== 'string') return '/account';
  if (destPath.startsWith('/')) return destPath;
  try {
    const url = new URL(destPath);
    return `${url.pathname}${url.search}${url.hash}` || '/account';
  } catch {
    return '/account';
  }
}

/**
 * Final destination on the public press site (or localhost during local DX).
 */
export function pressReturnUrl(destPath = '/account') {
  const path = normalizePath(destPath);
  if (typeof window !== 'undefined' && window.location.origin.startsWith('http://localhost')) {
    return `${window.location.origin}${path}`;
  }
  return `${SITE_URL}${path}`;
}

export function isSafeReturnUrl(value) {
  if (!value || typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    const host = url.hostname;
    return (
      host === 'www.humanweather.press' ||
      host === 'humanweather.press' ||
      host === 'humanweather.vercel.app' ||
      host === 'humanweather.base44.app' ||
      host.endsWith('.base44.app') ||
      host === 'localhost' ||
      host === '127.0.0.1'
    );
  } catch {
    return false;
  }
}

/**
 * Start Google OAuth in a way Base44 accepts.
 *
 * Base44 sets OAuth state.domain from the Referer of the login request.
 * Starting Google from www.humanweather.press makes domain=press and the
 * callback fails with "Domain is not valid". Navigate to the Base44-hosted
 * bridge first so Referer is humanweather.base44.app, then start Google there.
 */
export function startGoogleSignIn(destPath = '/account') {
  const finalReturn = pressReturnUrl(destPath);
  const origin = typeof window !== 'undefined' ? window.location.origin : SITE_URL;

  // Already on Base44 hosting — start provider login directly.
  if (origin === BASE44_HOSTED_ORIGIN || origin.endsWith('.base44.app')) {
    const returnTo = new URL('/auth/bridge', origin);
    returnTo.searchParams.set('next', finalReturn);
    // Dynamic import avoided — callers pass base44.auth
    return { mode: 'provider', fromUrl: returnTo.toString() };
  }

  // External front (press / Vercel / localhost): hop to Base44 host first.
  const starter = new URL('/auth/bridge', BASE44_HOSTED_ORIGIN);
  starter.searchParams.set('start_google', '1');
  starter.searchParams.set('next', finalReturn);
  return { mode: 'navigate', href: starter.toString() };
}

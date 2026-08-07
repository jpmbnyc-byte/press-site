import { SITE_URL } from '@/lib/site';
import { appParams } from '@/lib/app-params';

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
 * Base44 sets OAuth state.domain from the Referer. The press origin is rejected
 * ("Domain is not valid"). Workaround (no Base44 publish required):
 * navigate to a same-origin noreferrer hop, then to Base44's Google login so
 * domain falls back to app.base44.com.
 */
export function startGoogleSignIn(destPath = '/account') {
  const finalReturn = pressReturnUrl(destPath);
  const origin = typeof window !== 'undefined' ? window.location.origin : SITE_URL;

  // Already on Base44 hosting — start provider login directly (Referer is allowed).
  if (origin === BASE44_HOSTED_ORIGIN || origin.endsWith('.base44.app')) {
    const returnTo = new URL('/auth/bridge', origin);
    returnTo.searchParams.set('next', finalReturn);
    return { mode: 'provider', fromUrl: returnTo.toString() };
  }

  // Prefer static HTML hop (always shipped with Vercel dist, no SPA boot).
  const hop = new URL('/auth/google-start.html', origin);
  hop.searchParams.set('next', finalReturn);
  if (appParams.appId) hop.searchParams.set('app_id', appParams.appId);
  return { mode: 'navigate', href: hop.toString() };
}

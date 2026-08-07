import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';

const APP_ID = appParams.appId || '6a57ce138c2f29923fec6bc4';
const API_BASE = (appParams.appBaseUrl || 'https://humanweather.base44.app').replace(/\/$/, '');

/** Clear browser-stored Base44 tokens. */
export function clearStoredAuthTokens() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem('base44_access_token');
    window.localStorage.removeItem('token');
  } catch {
    /* ignore */
  }
}

export function storeAuthToken(token) {
  if (!token || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem('base44_access_token', token);
    window.localStorage.setItem('token', token);
    window.__hw_auth_cleared = false;
  } catch {
    /* ignore */
  }
  try {
    base44.auth.setToken(token);
  } catch {
    /* ignore */
  }
}

export function hasStoredAuthToken() {
  if (typeof window === 'undefined') return false;
  if (window.__hw_auth_cleared) return false;
  try {
    return Boolean(
      window.localStorage.getItem('base44_access_token') ||
        window.localStorage.getItem('token'),
    );
  } catch {
    return false;
  }
}

/**
 * Email/password login that does NOT call SDK logout() on 401.
 * (SDK loginViaEmailPassword redirects away from the press site on bad password.)
 */
export async function loginWithEmailPassword(email, password) {
  const res = await fetch(`${API_BASE}/api/apps/${APP_ID}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-Id': APP_ID,
    },
    body: JSON.stringify({ email, password }),
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      (res.status === 401 ? 'Invalid email or password' : 'Unable to log in');
    throw new Error(typeof message === 'string' ? message : 'Unable to log in');
  }

  const access_token = data.access_token || data.token;
  if (!access_token) {
    throw new Error('Login succeeded but no session token was returned.');
  }

  storeAuthToken(access_token);

  let user = data.user || null;
  if (!user) {
    try {
      user = await base44.auth.me();
    } catch {
      user = null;
    }
  }

  return { access_token, user, ...data };
}

/**
 * Build auth-related URLs that preserve return path + plan.
 * @param {string} pathOrKind — absolute path ("/forgot-password") or "login" | "register"
 */
export function buildAuthPath(pathOrKind, { next, plan } = {}) {
  let path = '/login';
  if (pathOrKind === 'register') path = '/register';
  else if (pathOrKind === 'login') path = '/login';
  else if (typeof pathOrKind === 'string' && pathOrKind.startsWith('/')) path = pathOrKind;

  const params = new URLSearchParams();
  if (next) {
    const value = next.startsWith('/') ? next : `/${next}`;
    params.set('next', value);
  }
  if (plan) params.set('plan', plan);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function safeNextPath(next, fallback = '/account') {
  if (!next || typeof next !== 'string') return fallback;
  if (!next.startsWith('/')) return fallback;
  if (next.startsWith('//')) return fallback;
  return next;
}

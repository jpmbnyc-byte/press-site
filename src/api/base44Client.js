import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Use absolute Base44 host so Vercel (and other SPA hosts) can reach entities
// without relying solely on a same-origin /api rewrite.
const resolvedServerUrl = (appBaseUrl || 'https://humanweather.base44.app').replace(/\/$/, '');

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: resolvedServerUrl,
  requiresAuth: false,
  appBaseUrl: resolvedServerUrl,
});

import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// In local Vite / Base44 hosting, empty serverUrl keeps requests same-origin
// (`/api`) so the Vite proxy or Base44 edge can route them.
// On external hosts (e.g. Render static), point at the Base44 platform API
// so entity data from humanweather.base44.app loads in production.
const serverUrl =
  import.meta.env.VITE_BASE44_SERVER_URL ||
  (import.meta.env.PROD ? 'https://base44.app' : '');

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl,
  requiresAuth: false,
  appBaseUrl
});

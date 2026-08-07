import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { SITE_URL } from '@/lib/site';
import { isSafeReturnUrl } from '@/lib/authRedirect';

/**
 * Two jobs on the Base44-hosted origin:
 * 1) start_google=1 — begin Google OAuth with an allowed Referer/domain
 * 2) otherwise — forward access_token to the public press site
 */
export default function AuthBridge() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('Finishing sign-in…');

  useEffect(() => {
    const nextRaw = params.get('next') || `${SITE_URL}/account`;
    if (!isSafeReturnUrl(nextRaw)) {
      setMessage('Invalid return URL.');
      return;
    }

    if (params.get('start_google') === '1') {
      setMessage('Continuing to Google…');
      const returnTo = new URL('/auth/bridge', window.location.origin);
      returnTo.searchParams.set('next', nextRaw);
      base44.auth.loginWithProvider('google', returnTo.toString());
      return;
    }

    let token = null;
    try {
      token =
        new URLSearchParams(window.location.search).get('access_token') ||
        window.localStorage.getItem('base44_access_token') ||
        window.localStorage.getItem('token');
    } catch {
      token = null;
    }

    const next = new URL(nextRaw);
    if (token) {
      next.searchParams.set('access_token', token);
    }

    window.location.replace(next.toString());
  }, [params]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0e0d0a] gap-4 px-6 text-center">
      <div className="w-8 h-8 border-2 border-[#c4a84a] border-t-transparent animate-spin" />
      <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#c4a84a]/70">
        {message}
      </div>
    </div>
  );
}

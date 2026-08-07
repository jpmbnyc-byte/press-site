import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { appParams } from '@/lib/app-params';
import { SITE_URL } from '@/lib/site';
import { isSafeReturnUrl } from '@/lib/authRedirect';

/**
 * Vercel-only Google OAuth hop.
 *
 * Base44 sets state.domain from Referer. Starting Google from the press origin
 * yields Domain is not valid. This page sets referrer=no-referrer, then navigates
 * to Base44's Google login so domain falls back to app.base44.com (allowed).
 * Does not require a Base44 site publish.
 */
export default function AuthGoogleStart() {
  const [params] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.head.appendChild(meta);

    const next = params.get('next') || `${SITE_URL}/account`;
    if (!isSafeReturnUrl(next)) {
      setError('Invalid return URL.');
      return () => meta.remove();
    }

    const appId = appParams.appId || '6a57ce138c2f29923fec6bc4';
    const login =
      `https://humanweather.base44.app/api/apps/auth/login?app_id=${encodeURIComponent(appId)}` +
      `&from_url=${encodeURIComponent(next)}`;

    const a = document.createElement('a');
    a.href = login;
    a.rel = 'noreferrer noopener';
    a.referrerPolicy = 'no-referrer';
    document.body.appendChild(a);
    a.click();

    return () => {
      meta.remove();
      a.remove();
    };
  }, [params]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0e0d0a] gap-4 px-6 text-center">
      <div className="w-8 h-8 border-2 border-[#c4a84a] border-t-transparent animate-spin" />
      <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#c4a84a]/70">
        {error || 'Continuing to Google…'}
      </div>
    </div>
  );
}

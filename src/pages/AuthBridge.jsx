import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { SITE_URL } from '@/lib/site';
import { isSafeReturnUrl, startGoogleSignIn } from '@/lib/authRedirect';
import { buildAuthPath } from '@/lib/authSession';

/**
 * Two jobs on the Base44-hosted origin:
 * 1) start_google=1 — begin Google OAuth with an allowed Referer/domain
 * 2) otherwise — forward access_token from the URL to the public press site
 *
 * Never fall back to localStorage tokens — that re-attaches a previous account
 * when switching Google identities.
 */
export default function AuthBridge() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('Finishing sign-in…');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const nextRaw = params.get('next') || `${SITE_URL}/account`;
    if (!isSafeReturnUrl(nextRaw)) {
      setMessage('Invalid return URL.');
      setFailed(true);
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
      token = new URLSearchParams(window.location.search).get('access_token');
    } catch {
      token = null;
    }

    if (!token) {
      setMessage('Sign-in did not return a session. Please try again.');
      setFailed(true);
      return;
    }

    const next = new URL(nextRaw);
    next.searchParams.set('access_token', token);
    window.location.replace(next.toString());
  }, [params]);

  if (failed) {
    let pathHint = '/account';
    try {
      const nextRaw = params.get('next');
      if (nextRaw && isSafeReturnUrl(nextRaw)) {
        const u = new URL(nextRaw);
        pathHint = `${u.pathname}${u.search}` || '/account';
      }
    } catch {
      /* keep default */
    }

    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0e0d0a] gap-5 px-6 text-center">
        <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#c4a84a]/70">
          Sign-in interrupted
        </div>
        <p className="font-serif text-[#f0e9d8] max-w-sm">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button
            type="button"
            onClick={() => {
              const start = startGoogleSignIn(pathHint);
              if (start.mode === 'navigate') {
                window.location.href = start.href;
              } else {
                base44.auth.loginWithProvider('google', start.fromUrl);
              }
            }}
            className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#0e0d0a] bg-[#c4a84a] px-5 py-2.5"
          >
            Try Google again
          </button>
          <a
            href={`${SITE_URL}${buildAuthPath('login', { next: pathHint })}`}
            className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#c4a84a] border border-[#c4a84a] px-5 py-2.5"
          >
            Log in with email
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0e0d0a] gap-4 px-6 text-center">
      <div className="w-8 h-8 border-2 border-[#c4a84a] border-t-transparent animate-spin" />
      <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#c4a84a]/70">
        {message}
      </div>
    </div>
  );
}

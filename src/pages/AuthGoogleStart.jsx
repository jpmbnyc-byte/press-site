import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { appParams } from '@/lib/app-params';
import { SITE_URL } from '@/lib/site';
import { isSafeReturnUrl } from '@/lib/authRedirect';

/**
 * SPA fallback for /auth/google-start (prefer static google-start.html).
 * Strips Referer so Base44 OAuth state.domain falls back to app.base44.com.
 */
export default function AuthGoogleStart() {
  const [params] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.head.appendChild(meta);

    // Also set document policy when supported
    try {
      if (document.head && !document.querySelector('meta[name="referrer"][content="no-referrer"]')) {
        /* already added */
      }
    } catch {
      /* ignore */
    }

    const next = params.get('next') || `${SITE_URL}/account`;
    if (!isSafeReturnUrl(next)) {
      setError('Invalid return URL.');
      return () => meta.remove();
    }

    const appId = appParams.appId || '6a57ce138c2f29923fec6bc4';
    const popupOrigin = params.get('popup_origin') || '';

    const form = document.createElement('form');
    form.method = 'GET';
    form.action = 'https://app.base44.com/api/apps/auth/login';
    form.setAttribute('referrerpolicy', 'no-referrer');
    form.referrerPolicy = 'no-referrer';

    const add = (name, value) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    add('app_id', appId);
    add('from_url', next);
    if (popupOrigin) add('popup_origin', popupOrigin);

    document.body.appendChild(form);
    const t = window.setTimeout(() => {
      try {
        form.submit();
      } catch {
        setError('Could not start Google sign-in.');
      }
    }, 30);

    return () => {
      window.clearTimeout(t);
      meta.remove();
      form.remove();
    };
  }, [params]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0e0d0a] gap-4 px-6 text-center">
      {!error ? (
        <div className="w-8 h-8 border-2 border-[#c4a84a] border-t-transparent animate-spin" />
      ) : null}
      <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#c4a84a]/70">
        {error || 'Continuing to Google…'}
      </div>
      {error ? (
        <Link
          to="/login"
          className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#c4a84a] underline underline-offset-4"
        >
          Back to log in
        </Link>
      ) : null}
    </div>
  );
}

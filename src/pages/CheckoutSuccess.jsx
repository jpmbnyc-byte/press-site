import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { openBillingPortal } from '@/lib/stripeCheckout';
import { useAuth } from '@/lib/AuthContext';
import { getAppUnlockUrl, hasAppAccess, hasPressAccess } from '@/lib/membership';

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const { user, refreshUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Webhook may land a moment after redirect — refresh a few times.
      for (let i = 0; i < 5; i++) {
        await refreshUser?.();
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 1200));
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const manage = async () => {
    setLoading(true);
    setError('');
    try {
      await openBillingPortal({ sessionId });
    } catch (err) {
      setError(err.message || 'Could not open portal');
      setLoading(false);
    }
  };

  const press = hasPressAccess(user);
  const app = hasAppAccess(user);
  const unlockUrl = getAppUnlockUrl(user);

  return (
    <div className="bg-[#0e0d0a] min-h-[70vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-lg text-center">
        <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-[#c4a84a] mb-6">
          Membership
        </div>
        <h1 className="font-serif text-[clamp(36px,6vw,52px)] font-light text-[#f0e9d8] mb-6 leading-tight">
          Peace be with you.
        </h1>
        <p className="font-serif italic text-xl text-[#c8b99a] mb-6 leading-relaxed">
          {press
            ? 'Your trial is active. The archive is open.'
            : ready
              ? 'Payment received. If the archive is still locked, wait a moment and refresh — access activates when Stripe confirms.'
              : 'Confirming your membership…'}
        </p>

        {app && (
          <div className="border border-[#c4a84a]/40 px-6 py-5 mb-8 text-left">
            <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#c4a84a] mb-2">
              Bundle unlocked
            </div>
            <p className="font-serif text-[#f0e9d8] mb-4">
              Member + App includes humanweather.social premium. Open the app with your unlock link:
            </p>
            <a
              href={unlockUrl}
              className="inline-block font-mono text-[10px] tracking-[0.25em] uppercase text-[#0e0d0a] bg-[#c4a84a] px-6 py-3 hover:bg-[#e0c870]"
            >
              Open Human Weather App →
            </a>
          </div>
        )}

        {error && (
          <p className="font-serif text-sm text-[#c4a84a] mb-6">{error}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/journal"
            className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#0e0d0a] bg-[#c4a84a] px-10 py-4 hover:bg-[#e0c870] transition-colors"
          >
            Enter the Journal
          </Link>
          {isAuthenticated && (
            <Link
              to="/account"
              className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#F7F4EE] border border-[#F7F4EE] px-10 py-4"
            >
              Account
            </Link>
          )}
          {(sessionId || user?.stripe_customer_id) && (
            <button
              type="button"
              onClick={manage}
              disabled={loading}
              className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#F7F4EE] border border-[#F7F4EE] px-10 py-4 hover:bg-[#F7F4EE] hover:text-[#0e0d0a] transition-all disabled:opacity-60"
            >
              {loading ? 'Opening…' : 'Manage billing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { openBillingPortal } from '@/lib/stripeCheckout';
import { getAppUnlockUrl, hasAppAccess, hasPressAccess } from '@/lib/membership';

export default function Account() {
  const { user, isAuthenticated, isLoadingAuth, logout, refreshUser } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    refreshUser?.();
  }, []);

  if (isLoadingAuth) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c4a84a] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login?next=/account" replace />;
  }

  const press = hasPressAccess(user);
  const app = hasAppAccess(user);
  const unlockUrl = getAppUnlockUrl(user);

  const openPortal = async () => {
    setError('');
    setPortalLoading(true);
    try {
      await openBillingPortal();
    } catch (err) {
      setError(err.message || 'Could not open billing portal');
      setPortalLoading(false);
    }
  };

  return (
    <div className="bg-[#0e0d0a] min-h-[70vh] px-6 py-16">
      <div className="max-w-xl mx-auto">
        <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-[#c4a84a] mb-4">
          Account
        </div>
        <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-light text-[#f0e9d8] mb-2">
          {user.full_name || 'Member'}
        </h1>
        <p className="font-mono text-[11px] text-[#c8b99a] mb-10">{user.email}</p>

        <div className="border border-[#c4a84a]/30 p-6 mb-6 space-y-3">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#c4a84a]">
            Press access
          </div>
          <p className="font-serif text-lg text-[#f0e9d8]">
            {press
              ? `Active (${user.membership_status}) — ${user.membership_plan || 'member'}`
              : 'Not active — subscribe to unlock the archive'}
          </p>
          {!press && (
            <Link
              to="/subscribe"
              className="inline-block font-mono text-[10px] tracking-[0.25em] uppercase text-[#0e0d0a] bg-[#c4a84a] px-6 py-3 mt-2"
            >
              View plans
            </Link>
          )}
        </div>

        <div className="border border-[#c4a84a]/30 p-6 mb-8 space-y-3">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#c4a84a]">
            App access (Member + App)
          </div>
          {app ? (
            <>
              <p className="font-serif text-lg text-[#f0e9d8]">
                Unlocked — humanweather.social premium is included with your bundle.
              </p>
              <a
                href={unlockUrl}
                className="inline-block font-mono text-[10px] tracking-[0.25em] uppercase text-[#0e0d0a] bg-[#c4a84a] px-6 py-3 mt-2 hover:bg-[#e0c870]"
              >
                Open Human Weather App →
              </a>
            </>
          ) : (
            <>
              <p className="font-serif text-lg text-[#c8b99a]">
                Bundle purchasers get the PWA at humanweather.social. Upgrade to Member + App ($96/yr).
              </p>
              <Link
                to="/subscribe"
                className="inline-block font-mono text-[10px] tracking-[0.25em] uppercase text-[#c4a84a] border border-[#c4a84a] px-6 py-3 mt-2"
              >
                Get the bundle
              </Link>
            </>
          )}
        </div>

        {error && (
          <p className="font-serif text-sm text-[#c4a84a] mb-4">{error}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={openPortal}
            disabled={portalLoading || !user.stripe_customer_id}
            className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#c4a84a] border border-[#c4a84a] px-6 py-3 disabled:opacity-40"
          >
            {portalLoading ? 'Opening…' : 'Manage billing'}
          </button>
          <button
            type="button"
            onClick={() => logout(false)}
            className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#c8b99a] border-b border-[#c8b99a]/30 pb-1 self-start"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

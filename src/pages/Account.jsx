import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { openBillingPortal } from '@/lib/stripeCheckout';
import { getAppUnlockUrl, hasAppAccess, hasPressAccess } from '@/lib/membership';
import { STRIPE_PLANS } from '@/lib/stripePlans';

function membershipLabel(user) {
  const plan = STRIPE_PLANS[user?.membership_plan];
  if (!plan) return 'Human Weather member';
  return `${plan.name} · ${plan.amountLabel}`;
}

function accessStatusLabel(status) {
  if (status === 'trialing') return 'Trial active';
  if (status === 'active') return 'Active';
  if (status === 'past_due') return 'Payment issue';
  if (status === 'canceled') return 'Canceled';
  if (status === 'unpaid') return 'Payment required';
  if (status === 'incomplete') return 'Checkout incomplete';
  return 'Not active';
}

function formatPeriodEnd(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export default function Account() {
  const { user, isAuthenticated, isLoadingAuth, logout, refreshUser } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    refreshUser?.();
  }, [refreshUser]);

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
  const appPlan = STRIPE_PLANS.member_app_yearly;
  const periodEnd = formatPeriodEnd(user.membership_period_end);

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
            Press membership
          </div>
          <p className="font-serif text-lg text-[#f0e9d8]">
            {press ? membershipLabel(user) : 'No active membership'}
          </p>
          <p className="font-serif italic text-sm text-[#c8b99a]">
            {accessStatusLabel(user.membership_status)}
            {periodEnd ? ` · Current period through ${periodEnd}` : ''}
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
            Human Weather app
          </div>
          {app ? (
            <>
              <p className="font-serif text-lg text-[#f0e9d8]">
                Included with your Member + App membership.
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
                Add humanweather.social premium with {appPlan.name} at {appPlan.amountLabel}.
              </p>
              <Link
                to={`/subscribe?plan=${encodeURIComponent(appPlan.id)}`}
                className="inline-block font-mono text-[10px] tracking-[0.25em] uppercase text-[#c4a84a] border border-[#c4a84a] px-6 py-3 mt-2"
              >
                View app bundle
              </Link>
            </>
          )}
        </div>

        {error && <p className="font-serif text-sm text-[#c4a84a] mb-4">{error}</p>}

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
            onClick={() => logout({ next: '/account' })}
            className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#c8b99a] border-b border-[#c8b99a]/30 pb-1 self-start"
          >
            Log out
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-[#c4a84a]/20">
          <p className="font-serif italic text-sm text-[#c8b99a] mb-3">
            Using a different email or Google account?
          </p>
          <button
            type="button"
            onClick={() => logout({ serverLogout: true, next: '/account' })}
            className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#c4a84a] underline underline-offset-4"
          >
            Switch account
          </button>
        </div>

        {!user.stripe_customer_id && (
          <p className="font-serif italic text-sm text-[#c8b99a] mt-4 max-w-md">
            Billing becomes available after Stripe links the checkout to this account. If you just joined,
            refresh shortly or contact{' '}
            <a href="mailto:hello@humanweather.social" className="text-[#c4a84a] not-italic hover:underline">
              hello@humanweather.social
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}

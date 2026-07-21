import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { startCheckout, openBillingPortal } from '@/lib/stripeCheckout';
import { useAuth } from '@/lib/AuthContext';
import { getAppUnlockUrl, hasAppAccess, hasPressAccess } from '@/lib/membership';

const tiers = [
  {
    name: 'Free Reader',
    price: '—',
    badge: null,
    features: [
      'First essay in every series',
      'Weekly editorial dispatch',
      'About page and series overview',
      'Reader profile',
    ],
    planId: null,
    cta: 'Start Reading',
    href: '/journal',
    highlighted: false,
    filled: false,
  },
  {
    name: 'Member',
    price: '$9/mo or $72/yr',
    badge: 'Most Popular',
    features: [
      'All 49 essays across seven series',
      'The Olive Tree — founder voice essays',
      'Complete archive access',
      'Reader comments on all articles',
      'Member-only weekly dispatch',
      'Early access to new app features',
      '7-day free trial',
    ],
    planOptions: [
      { id: 'member_monthly', label: '$9 / month' },
      { id: 'member_yearly', label: '$72 / year' },
    ],
    cta: 'Start Free Trial',
    highlighted: true,
    filled: false,
  },
  {
    name: 'Member + App',
    price: '$96/year',
    badge: 'Best Value',
    features: [
      'Everything in Member',
      'humanweather.social app premium',
      'Priority support',
      'Founding member badge',
      'First 500 subscribers only',
      '7-day free trial',
    ],
    planId: 'member_app_yearly',
    cta: 'Join + App Bundle',
    highlighted: true,
    filled: true,
  },
];

export default function Subscribe() {
  const [params] = useSearchParams();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [memberPlan, setMemberPlan] = useState('member_yearly');
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const plan = params.get('plan');
    if (plan && isAuthenticated) {
      startCheckout(plan).catch((err) => {
        setError(err.message || 'Checkout failed');
      });
    }
  }, [params, isAuthenticated]);

  useEffect(() => {
    refreshUser?.();
  }, [refreshUser]);

  const handleCheckout = async (planId) => {
    if (!planId) return;
    setError('');
    setLoadingPlan(planId);
    try {
      await startCheckout(planId);
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.');
      setLoadingPlan(null);
    }
  };

  const handleManage = async () => {
    setError('');
    setLoadingPlan('portal');
    try {
      await openBillingPortal();
    } catch (err) {
      setError(err.message || 'Could not open billing portal.');
      setLoadingPlan(null);
    }
  };

  const press = hasPressAccess(user);
  const app = hasAppAccess(user);
  const unlockUrl = getAppUnlockUrl(user);

  return (
    <div className="bg-[#0e0d0a] min-h-screen px-6 py-16">
      <div className="max-w-[520px] mx-auto text-center mb-16">
        <div className="flex items-baseline justify-center gap-[2px] mb-6">
          <span className="font-mono text-[14px] tracking-[0.2em] text-[#f0e9d8]">HUMAN</span>
          <span className="font-serif italic text-xl text-[#c4a84a]">Weather</span>
          <span className="font-mono text-[14px] text-[#f0e9d8]">.</span>
        </div>
        <h1 className="font-serif text-[clamp(36px,6vw,52px)] font-light text-[#f0e9d8] mb-4 leading-tight">
          Join Human Weather.
        </h1>
        <p className="font-serif italic text-lg text-[#c8b99a] max-w-md mx-auto">
          Seven series. Forty-nine essays. One question. And an app that maps what you feel.
        </p>
        {!isAuthenticated && (
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#c4a84a] mt-6">
            <Link to="/login?next=/subscribe" className="underline underline-offset-4">
              Log in
            </Link>
            {' '}or{' '}
            <Link to="/register?next=/subscribe" className="underline underline-offset-4">
              create an account
            </Link>
            {' '}before checkout
          </p>
        )}
      </div>

      {press && (
        <div className="max-w-xl mx-auto mb-10 border border-[#c4a84a]/40 px-6 py-5 text-center">
          <p className="font-serif text-[#f0e9d8] mb-2">
            You have press access ({user.membership_status}).
          </p>
          {app ? (
            <a
              href={unlockUrl}
              className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#c4a84a] underline underline-offset-4"
            >
              Open humanweather.social app →
            </a>
          ) : (
            <p className="font-serif italic text-sm text-[#c8b99a]">
              Want the PWA too? Upgrade to Member + App below.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="max-w-xl mx-auto mb-8 border border-[#c4a84a]/40 px-4 py-3 text-center font-serif text-sm text-[#f0e9d8]">
          {error}
        </div>
      )}

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative p-8 flex flex-col ${
              tier.filled
                ? 'bg-[#c4a84a] text-[#0e0d0a]'
                : tier.highlighted
                  ? 'border-2 border-[#c4a84a] text-[#f0e9d8]'
                  : 'border border-[rgba(196,168,74,0.3)] text-[#f0e9d8]'
            }`}
          >
            {tier.badge && (
              <div
                className={`font-mono text-[8px] tracking-[0.2em] uppercase mb-4 ${
                  tier.filled ? 'text-[#0e0d0a]' : 'text-[#c4a84a]'
                }`}
              >
                {tier.badge}
              </div>
            )}
            <div
              className={`font-mono text-[11px] tracking-[0.2em] uppercase mb-3 ${
                tier.filled ? 'text-[#0e0d0a]' : 'text-[#c4a84a]'
              }`}
            >
              {tier.name}
            </div>
            <div className="font-serif text-2xl font-light mb-6">{tier.price}</div>
            <div className={`h-px mb-6 ${tier.filled ? 'bg-[#0e0d0a] opacity-20' : 'bg-[#c4a84a] opacity-25'}`} />
            <ul className="space-y-3 mb-8 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="font-serif text-sm leading-relaxed flex gap-2">
                  <span className={tier.filled ? 'text-[#0e0d0a]' : 'text-[#c4a84a]'}>✦</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {tier.planOptions && (
              <div className="flex gap-2 mb-4">
                {tier.planOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMemberPlan(opt.id)}
                    className={`flex-1 font-mono text-[9px] tracking-[0.15em] uppercase px-2 py-2 border transition-colors ${
                      memberPlan === opt.id
                        ? 'bg-[#c4a84a] text-[#0e0d0a] border-[#c4a84a]'
                        : 'border-[#c4a84a]/50 text-[#c4a84a] hover:border-[#c4a84a]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {tier.href ? (
              <Link
                to={tier.href}
                className={`font-mono text-[10px] tracking-[0.25em] uppercase px-6 py-4 text-center transition-all duration-300 border border-[#c4a84a] text-[#c4a84a] hover:bg-[#c4a84a] hover:text-[#0e0d0a]`}
              >
                {tier.cta}
              </Link>
            ) : (
              <button
                type="button"
                disabled={!!loadingPlan}
                onClick={() =>
                  handleCheckout(tier.planOptions ? memberPlan : tier.planId)
                }
                className={`font-mono text-[10px] tracking-[0.25em] uppercase px-6 py-4 text-center transition-all duration-300 disabled:opacity-60 ${
                  tier.filled
                    ? 'bg-[#0e0d0a] text-[#c4a84a] hover:bg-[#1a1810]'
                    : 'bg-[#c4a84a] text-[#0e0d0a] hover:bg-[#e0c870]'
                }`}
              >
                {loadingPlan &&
                (loadingPlan === tier.planId ||
                  (tier.planOptions && loadingPlan === memberPlan))
                  ? 'Redirecting…'
                  : tier.cta}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="max-w-md mx-auto space-y-3 text-center">
        {[
          'Cancel any time',
          'First essay in every series always free',
          '7-day free trial — no charge until day 8',
          <>
            Questions?{' '}
            <a
              href="mailto:hello@humanweather.social"
              className="text-[#c4a84a] hover:text-[#e0c870] transition-colors duration-300 not-italic"
            >
              hello@humanweather.social
            </a>
          </>,
        ].map((note, i) => (
          <div key={i} className="font-serif italic text-sm text-[#c8b99a] flex items-center justify-center gap-2">
            <span className="text-[#c4a84a]">✦</span>
            {note}
          </div>
        ))}
        <button
          type="button"
          onClick={handleManage}
          disabled={loadingPlan === 'portal'}
          className="mt-6 font-mono text-[10px] tracking-[0.25em] uppercase text-[#c4a84a] border-b border-[#c4a84a]/40 pb-1 hover:text-[#e0c870] transition-colors disabled:opacity-60"
        >
          {loadingPlan === 'portal' ? 'Opening…' : 'Manage existing membership →'}
        </button>
      </div>
    </div>
  );
}

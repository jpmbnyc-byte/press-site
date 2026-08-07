import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { buildAuthPath, safeNextPath } from '@/lib/authSession';
import AuthLayout from '@/components/AuthLayout';
import { Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const next = safeNextPath(searchParams.get('next'));
  const plan = searchParams.get('plan');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = 'Reset password — HUMAN Weather.';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {
      // Always show success regardless
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="We'll email a link if an account exists for that address."
      footer={
        <Link
          to={buildAuthPath('login', { next, plan })}
          className="text-[var(--hw-gold)] hover:underline"
        >
          ← Back to log in
        </Link>
      }
    >
      {sent ? (
        <p className="font-serif text-sm text-[var(--hw-ink2)] text-center">
          If an account exists with that email, you&apos;ll receive a password reset link shortly.
          After you reset, you&apos;ll return to log in
          {next !== '/account' ? ' and continue where you left off' : ''}.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--hw-ink3)]">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[rgba(154,125,46,0.3)] bg-[var(--hw-bg)] px-3 py-2.5 font-serif text-sm text-[var(--hw-ink)] outline-none focus:border-[var(--hw-gold)]"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-[var(--hw-gold)] px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--hw-dark-bg)] transition hover:bg-[var(--hw-gold-lt)] disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Send reset link
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

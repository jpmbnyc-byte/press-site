import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { buildAuthPath, safeNextPath } from '@/lib/authSession';
import AuthLayout from '@/components/AuthLayout';
import { Loader2 } from 'lucide-react';

function resolveResetToken(searchParams, hash = '') {
  const hashParams = new URLSearchParams(String(hash).replace(/^#\??/, ''));
  return (
    searchParams.get('token') ||
    searchParams.get('reset_token') ||
    searchParams.get('resetToken') ||
    hashParams.get('token') ||
    hashParams.get('reset_token') ||
    hashParams.get('resetToken') ||
    ''
  );
}

export default function ResetPassword() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const resetToken = resolveResetToken(searchParams, location.hash);
  const next = safeNextPath(searchParams.get('next'));
  const plan = searchParams.get('plan');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'New password — HUMAN Weather.';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      window.location.href = buildAuthPath('login', { next, plan });
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <AuthLayout
        title="Invalid reset link"
        subtitle="This password reset link is missing or expired."
        footer={
          <Link
            to={buildAuthPath('/forgot-password', { next, plan })}
            className="text-[var(--hw-gold)] hover:underline"
          >
            Request a new link
          </Link>
        }
      >
        <p className="font-serif text-sm text-[var(--hw-ink2)] text-center">
          The link you used appears to be incomplete. Request a new password reset email and try again.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="New password" subtitle="Choose a password for your next visit.">
      {error ? (
        <p
          className="mb-4 border border-[rgba(196,98,58,0.35)] bg-[rgba(196,98,58,0.08)] px-3 py-2 font-serif text-sm text-[var(--hw-rust)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--hw-ink3)]">
            New password
          </span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            autoFocus
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-[rgba(154,125,46,0.3)] bg-[var(--hw-bg)] px-3 py-2.5 font-serif text-sm text-[var(--hw-ink)] outline-none focus:border-[var(--hw-gold)]"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--hw-ink3)]">
            Confirm password
          </span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-[rgba(154,125,46,0.3)] bg-[var(--hw-bg)] px-3 py-2.5 font-serif text-sm text-[var(--hw-ink)] outline-none focus:border-[var(--hw-gold)]"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 bg-[var(--hw-gold)] px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--hw-dark-bg)] transition hover:bg-[var(--hw-gold-lt)] disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          Reset password
        </button>
      </form>
    </AuthLayout>
  );
}

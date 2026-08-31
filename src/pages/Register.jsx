import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { buildAuthPath, safeNextPath, storeAuthToken } from '@/lib/authSession';
import { startCheckout } from '@/lib/stripeCheckout';
import AuthLayout from '@/components/AuthLayout';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoadingAuth, login } = useAuth();
  const next = safeNextPath(searchParams.get('next'));
  const plan = searchParams.get('plan');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendNote, setResendNote] = useState('');

  useEffect(() => {
    document.title = showOtp
      ? 'Verify email — HUMAN Weather.'
      : 'Create account — HUMAN Weather.';
  }, [showOtp]);

  if (!isLoadingAuth && isAuthenticated && !showOtp) {
    if (plan) {
      return <Navigate to={`/subscribe?plan=${encodeURIComponent(plan)}`} replace />;
    }
    return <Navigate to={next} replace />;
  }

  const afterAuth = async (user, fallbackEmail) => {
    if (plan) {
      try {
        await startCheckout(plan, {
          user: user || { email: fallbackEmail },
          email: user?.email || fallbackEmail,
        });
        return;
      } catch {
        /* fall through */
      }
    }
    navigate(next, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      const msg = String(err?.message || err || '');
      if (/already|exists|registered/i.test(msg)) {
        setError('An account with this email already exists. Try logging in instead.');
      } else {
        setError(msg || 'Could not create your account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      const token = result?.access_token;
      if (token) storeAuthToken(token);
      let user = null;
      try {
        user = await base44.auth.me();
      } catch {
        user = { email };
      }
      login(user, token);
      await afterAuth(user, email);
    } catch (err) {
      setError(err?.message || 'Invalid verification code.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResendNote('');
    try {
      await base44.auth.resendOtp(email);
      setResendNote('A new code was sent. Check your email.');
    } catch (err) {
      setError(err?.message || 'Could not resend the code.');
    }
  };

  if (showOtp) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={`Enter the verification code sent to ${email}.`}
      >
        {error ? (
          <p
            className="mb-4 border border-[rgba(196,98,58,0.35)] bg-[rgba(196,98,58,0.08)] px-3 py-2 font-serif text-sm text-[var(--hw-rust)]"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {resendNote ? (
          <p className="mb-4 font-serif text-sm text-[var(--hw-ink2)]">{resendNote}</p>
        ) : null}

        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
          className="flex w-full items-center justify-center gap-2 bg-[var(--hw-gold)] px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--hw-dark-bg)] transition hover:bg-[var(--hw-gold-lt)] disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          Verify & continue
        </button>

        <p className="mt-5 text-center font-serif text-sm text-[var(--hw-ink2)]">
          Didn&apos;t get it?{' '}
          <button
            type="button"
            onClick={handleResend}
            className="text-[var(--hw-gold)] underline-offset-2 hover:underline"
          >
            Resend code
          </button>
        </p>
        <p className="mt-3 text-center">
          <button
            type="button"
            onClick={() => {
              setShowOtp(false);
              setOtpCode('');
              setError('');
            }}
            className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--hw-ink3)] underline-offset-2 hover:underline"
          >
            ← Use a different email
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="One Human Weather account for members essays, checkout, and return visits."
    >
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
        <label className="block">
          <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--hw-ink3)]">
            Password
          </span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <span className="mt-1 block font-serif text-xs text-[var(--hw-ink3)]">
            At least 8 characters.
          </span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 bg-[var(--hw-gold)] px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--hw-dark-bg)] transition hover:bg-[var(--hw-gold-lt)] disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          Create account
        </button>
      </form>

      <p className="mt-6 text-center font-serif text-sm text-[var(--hw-ink2)]">
        Already have an account?{' '}
        <Link
          to={buildAuthPath('login', { next, plan })}
          className="text-[var(--hw-gold)] underline-offset-2 hover:underline"
        >
          Log in
        </Link>
      </p>
      <p className="mt-3 text-center">
        <Link
          to="/"
          className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--hw-ink3)] underline-offset-2 hover:underline"
        >
          ← Back to the press
        </Link>
      </p>
    </AuthLayout>
  );
}

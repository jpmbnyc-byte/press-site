import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { loginWithEmailPassword, buildAuthPath, safeNextPath } from '@/lib/authSession';
import { startGoogleSignIn } from '@/lib/authRedirect';
import { startCheckout } from '@/lib/stripeCheckout';
import AuthLayout from '@/components/AuthLayout';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoadingAuth, login } = useAuth();
  const next = safeNextPath(searchParams.get('next'));
  const plan = searchParams.get('plan');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    document.title = 'Log in — HUMAN Weather.';
  }, []);

  if (!isLoadingAuth && isAuthenticated) {
    if (plan) {
      // Let after-auth checkout run only from submit/Google; already-authed → subscribe.
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
        /* fall through to next */
      }
    }
    navigate(next, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { access_token, user } = await loginWithEmailPassword(email, password);
      login(user, access_token);
      await afterAuth(user, email);
    } catch (err) {
      setError(err?.message || 'Could not log in. Check your email and password.');
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    setError('');
    setGoogleBusy(true);
    const dest = plan
      ? `/subscribe?plan=${encodeURIComponent(plan)}`
      : next;
    const start = startGoogleSignIn(dest);
    if (start.mode === 'navigate') {
      window.location.href = start.href;
      return;
    }
    try {
      base44.auth.loginWithProvider('google', start.fromUrl);
    } catch {
      setGoogleBusy(false);
      setError('Could not start Google sign-in. Please try again.');
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to read members essays and manage your subscription."
    >
      {error ? (
        <p
          className="mb-4 border border-[rgba(196,98,58,0.35)] bg-[rgba(196,98,58,0.08)] px-3 py-2 font-serif text-sm text-[var(--hw-rust)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading || googleBusy}
        className="mb-5 flex w-full items-center justify-center gap-2 border border-[rgba(154,125,46,0.35)] bg-[var(--hw-surface)] px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--hw-ink)] transition hover:border-[var(--hw-gold)] disabled:opacity-60"
      >
        {googleBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        Continue with Google
      </button>

      <div className="mb-5 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--hw-ink3)]">
        <span className="h-px flex-1 bg-[rgba(154,125,46,0.25)]" />
        or email
        <span className="h-px flex-1 bg-[rgba(154,125,46,0.25)]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--hw-ink3)]">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[rgba(154,125,46,0.3)] bg-[var(--hw-bg)] px-3 py-2.5 font-serif text-sm text-[var(--hw-ink)] outline-none focus:border-[var(--hw-gold)]"
          />
        </label>
        <div className="flex justify-end">
          <Link
            to={buildAuthPath('/forgot-password', { next, plan })}
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--hw-ink3)] underline-offset-2 hover:text-[var(--hw-gold)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading || googleBusy}
          className="flex w-full items-center justify-center gap-2 bg-[var(--hw-gold)] px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--hw-dark-bg)] transition hover:bg-[var(--hw-gold-lt)] disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          Log in
        </button>
      </form>

      <p className="mt-6 text-center font-serif text-sm text-[var(--hw-ink2)]">
        New here?{' '}
        <Link
          to={buildAuthPath('register', { next, plan })}
          className="text-[var(--hw-gold)] underline-offset-2 hover:underline"
        >
          Create an account
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

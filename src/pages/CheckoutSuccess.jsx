import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { openBillingPortal } from '@/lib/stripeCheckout';

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const manage = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError('');
    try {
      await openBillingPortal({ sessionId });
    } catch (err) {
      setError(err.message || 'Could not open portal');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0e0d0a] min-h-[70vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-lg text-center">
        <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-[#c4a84a] mb-6">
          Membership
        </div>
        <h1 className="font-serif text-[clamp(36px,6vw,52px)] font-light text-[#f0e9d8] mb-6 leading-tight">
          Peace be with you.
        </h1>
        <p className="font-serif italic text-xl text-[#c8b99a] mb-10 leading-relaxed">
          Your trial is active. The archive is open. The field journal is yours for seven days —
          then membership continues unless you cancel.
        </p>
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
          {sessionId && (
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

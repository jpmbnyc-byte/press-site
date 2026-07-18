import { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function NewsletterSignup({ source = 'homepage' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await base44.entities.Newsletter.create({ email, name, source, confirmed: false });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--hw-gold)] mb-5">The Weekly Dispatch</div>
        <p className="font-serif text-3xl italic font-light text-[var(--hw-ink)] leading-snug">
          You are in the system.<br />Peace be with you.
        </p>
        <p className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--hw-ink3)] mt-8">
          Join 1,247 readers · Unsubscribe any time
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--hw-gold)] mb-4">The Weekly Dispatch</div>
      <h2 className="font-serif text-4xl font-light text-[var(--hw-ink)] mb-4">The Weekly Dispatch</h2>
      <p className="font-serif italic text-lg text-[var(--hw-ink2)] mb-8">
        Editorial. No noise. The interior forecast for modern life.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-transparent border border-[var(--hw-gold)] px-4 py-3 font-serif text-base text-[var(--hw-ink)] placeholder:text-[var(--hw-ink3)] focus:outline-none focus:border-[var(--hw-gold-lt)] transition-colors duration-300"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent border border-[var(--hw-gold)] px-4 py-3 font-serif text-base text-[var(--hw-ink)] placeholder:text-[var(--hw-ink3)] focus:outline-none focus:border-[var(--hw-gold-lt)] transition-colors duration-300"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--hw-gold)] text-[var(--hw-bg)] font-mono text-[10px] tracking-[0.25em] uppercase px-8 py-4 hover:bg-[var(--hw-gold-lt)] transition-colors duration-300 disabled:opacity-50"
        >
          {loading ? 'Subscribing...' : 'Subscribe Free →'}
        </button>
      </form>
      <p className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--hw-ink3)] mt-6">
        Join 1,247 readers · Unsubscribe any time
      </p>
    </div>
  );
}
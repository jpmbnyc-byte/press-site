import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { setNotFoundPageMeta } from '@/lib/pageMeta';

export default function PageNotFound() {
  const location = useLocation();

  useEffect(() => {
    setNotFoundPageMeta(location.pathname);
  }, [location.pathname]);

  return (
    <main className="min-h-[70vh] bg-[var(--hw-bg)] px-6 py-20 flex items-center justify-center">
      <div className="max-w-xl text-center">
        <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-[var(--hw-gold)] mb-5">
          Field note · 404
        </div>
        <h1 className="font-serif text-[clamp(38px,7vw,64px)] font-light leading-tight text-[var(--hw-ink)] mb-5">
          This page has moved out of weather range.
        </h1>
        <p className="font-serif italic text-lg text-[var(--hw-ink2)] leading-relaxed mb-10">
          The address may be old, incomplete, or no longer part of the journal. Return to the archive and continue reading from there.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/journal"
            className="font-mono text-[10px] tracking-[0.25em] uppercase bg-[var(--hw-gold)] text-[var(--hw-bg)] px-7 py-4 hover:bg-[var(--hw-gold-lt)] transition-colors"
          >
            Browse the Journal
          </Link>
          <Link
            to="/"
            className="font-mono text-[10px] tracking-[0.25em] uppercase border border-[var(--hw-gold)] text-[var(--hw-gold)] px-7 py-4 hover:bg-[var(--hw-gold)] hover:text-[var(--hw-bg)] transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}

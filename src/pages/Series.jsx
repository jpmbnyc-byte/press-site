import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function Series() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await base44.entities.Series.list('sort_order', 10);
        setSeries(all.filter(s => s.is_active));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--hw-gold)] border-t-transparent rounded-none animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-6 py-16 max-w-6xl mx-auto">
      <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-[var(--hw-gold)] mb-4">Series</div>
      <h1 className="font-serif text-[clamp(32px,5vw,42px)] font-light text-[var(--hw-ink)] mb-3 leading-tight">
        Seven Series. One Question.
      </h1>
      <p className="font-serif italic text-lg text-[var(--hw-ink2)] mb-16 max-w-2xl">
        What is the weather inside you, and what is it doing to everything you touch?
      </p>

      <div className="space-y-0">
        {series.map((s, i) => (
          <Link
            key={s.id}
            to={`/series/${s.slug}`}
            className="group block border-t border-[rgba(154,125,46,0.18)] py-8 hover:border-[var(--hw-gold)] transition-colors duration-300"
          >
            <div className="flex items-baseline gap-6 mb-3">
              <span className="font-mono text-2xl text-[var(--hw-gold)] opacity-50">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-light text-[var(--hw-ink)] group-hover:text-[var(--hw-gold)] transition-colors duration-300">
                {s.name}
              </h2>
            </div>
            <div className="ml-[44px]">
              <p className="font-serif italic text-lg text-[var(--hw-rust)] mb-2">{s.tagline}</p>
              <p className="font-serif text-base text-[var(--hw-ink2)] max-w-2xl mb-3 leading-relaxed">
                {s.description}
              </p>
              <div className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--hw-ink3)]">
                {s.essay_count_published || 0} of 7 essays ·{' '}
                {s.access_level === 'free_first'
                  ? 'First essay free'
                  : s.access_level === 'members_only'
                  ? 'Members only'
                  : 'All free'}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
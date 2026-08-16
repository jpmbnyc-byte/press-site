import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { setSeriesIndexMeta } from '@/lib/pageMeta';

export default function Series() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSeriesIndexMeta();
  }, []);

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

  return (
    <div className="px-6 py-16 max-w-6xl mx-auto">
      <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-[var(--hw-gold)] mb-4">Series</div>
      <h1 className="font-serif text-[clamp(32px,5vw,42px)] font-light text-[var(--hw-ink)] mb-3 leading-tight">
        Series. One Question.
      </h1>
      <p className="font-serif italic text-lg text-[var(--hw-ink2)] mb-16 max-w-2xl">
        What is the weather inside you, and what is it doing to everything you touch?
      </p>

      {loading ? (
        <div className="space-y-8" aria-label="Loading series">
          {[0, 1, 2].map((item) => (
            <div key={item} className="border-t border-[rgba(154,125,46,0.18)] py-8 animate-pulse">
              <div className="h-8 w-2/5 bg-[var(--hw-surface)] mb-4" />
              <div className="h-4 w-3/5 bg-[var(--hw-surface)]" />
            </div>
          ))}
        </div>
      ) : series.length === 0 ? (
        <div className="py-16 border-t border-[rgba(154,125,46,0.18)]">
          <p className="font-serif italic text-lg text-[var(--hw-ink3)]">Series are being prepared.</p>
        </div>
      ) : (
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
                  {s.essay_count_published || 0} of {s.total_essays || 0} essays ·{' '}
                  {s.access_level === 'free_first'
                    ? 'Free & members essays'
                    : s.access_level === 'members_only'
                      ? 'Members only'
                      : 'All free'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

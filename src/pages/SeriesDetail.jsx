import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function SeriesDetail() {
  const { slug } = useParams();
  const [seriesItem, setSeriesItem] = useState(null);
  const [essays, setEssays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const allSeries = await base44.entities.Series.list('sort_order', 10);
        const found = allSeries.find(s => s.slug === slug);
        setSeriesItem(found);

        const allArticles = await base44.entities.Article.list('-published_at', 100);
        const live = allArticles.filter(
          a => (a.status === 'published' || a.status === 'featured') && a.series_slug === slug
        );
        live.sort((a, b) => (a.series_order || 0) - (b.series_order || 0));
        setEssays(live);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--hw-gold)] border-t-transparent rounded-none animate-spin"></div>
      </div>
    );
  }

  if (!seriesItem) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 text-center">
        <div>
          <p className="font-serif text-2xl text-[var(--hw-ink3)] mb-6">Series not found.</p>
          <Link to="/series" className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--hw-gold)] border border-[var(--hw-gold)] px-6 py-3 hover:bg-[var(--hw-gold)] hover:text-[var(--hw-bg)] transition-all duration-300 inline-block">
            ← All Series
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Series header — dark */}
      <header className="bg-[#0e0d0a] py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#c4a84a] mb-4">
            Series · {String(seriesItem.sort_order || 1).padStart(2, '0')} of 07
          </div>
          <h1 className="font-serif text-[clamp(36px,6vw,52px)] font-light text-[#f0e9d8] mb-4 leading-tight tracking-[-0.01em]">
            {seriesItem.name}
          </h1>
          <p className="font-serif italic text-xl text-[#c4a84a] mb-6">{seriesItem.tagline}</p>
          <p className="font-serif text-lg text-[#c8b99a] max-w-2xl leading-relaxed mb-8">
            {seriesItem.description}
          </p>
          <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#f0e9d8] opacity-40">
            {essays.length} essays published of 7 ·{' '}
            {seriesItem.access_level === 'free_first'
              ? 'First essay free'
              : seriesItem.access_level === 'members_only'
              ? 'Members only'
              : 'All free'}
          </div>
        </div>
      </header>

      {/* Essay list */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        {essays.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif italic text-lg text-[var(--hw-ink3)] mb-6">
              Essays in this series will appear here soon.
            </p>
            <Link
              to="/journal"
              className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--hw-gold)] border border-[var(--hw-gold)] px-6 py-3 hover:bg-[var(--hw-gold)] hover:text-[var(--hw-bg)] transition-all duration-300 inline-block"
            >
              Browse the Journal →
            </Link>
          </div>
        ) : (
          <div className="space-y-0">
            {essays.map((essay, i) => {
              const isFree = essay.access_level === 'free';
              return (
                <Link
                  key={essay.id}
                  to={`/journal/${essay.slug}`}
                  className="group block border-l-2 border-transparent hover:border-[var(--hw-gold)] pl-5 -ml-5 py-8 border-b border-[rgba(154,125,46,0.18)] transition-all duration-300"
                >
                  <div className="flex items-baseline gap-5 mb-2">
                    <span className="font-mono text-2xl text-[var(--hw-gold)] opacity-50">
                      {String(essay.series_order || i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <h2 className="font-serif text-2xl md:text-3xl font-light text-[var(--hw-ink)] group-hover:text-[var(--hw-gold)] transition-colors duration-300 mb-1 leading-tight">
                        {essay.title}
                      </h2>
                      {essay.subtitle && (
                        <p className="font-serif italic text-base text-[var(--hw-ink2)] mb-2">
                          {essay.subtitle}
                        </p>
                      )}
                      <p className="font-serif italic text-sm text-[var(--hw-ink3)] mb-3">
                        {essay.excerpt}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--hw-ink3)]">
                          {essay.reading_time_mins || 9} min read
                        </span>
                        <span
                          className={`font-mono text-[8px] tracking-[0.15em] uppercase ${
                            isFree ? 'text-[var(--hw-sage)]' : 'text-[var(--hw-gold)]'
                          }`}
                        >
                          {isFree ? 'Free' : 'Members'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
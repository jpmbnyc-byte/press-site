import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { setSeriesPageMeta } from '@/lib/pageMeta';
import EssayThumbnail from '@/components/EssayThumbnail';

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
        if (found) setSeriesPageMeta(found);

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
      <div aria-label="Loading series">
        <header className="bg-[#0e0d0a] py-20 px-6">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="h-3 w-24 bg-[#c4a84a]/30 mb-6" />
            <div className="h-12 w-2/3 bg-[#f0e9d8]/10 mb-5" />
            <div className="h-5 w-1/2 bg-[#c4a84a]/20" />
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-6 py-16 space-y-8 animate-pulse">
          {[0, 1, 2].map((item) => (
            <div key={item} className="border-b border-[rgba(154,125,46,0.18)] pb-8">
              <div className="h-7 w-3/5 bg-[var(--hw-surface)] mb-3" />
              <div className="h-4 w-4/5 bg-[var(--hw-surface)]" />
            </div>
          ))}
        </div>
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

  const totalEssays = seriesItem.total_essays || 0;
  const freeEssays = essays.filter(e => e.access_level === 'free');
  const memberEssays = essays.filter(e => e.access_level !== 'free');

  return (
    <div>
      <header className="bg-[#0e0d0a] py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#c4a84a] mb-4">
            Series · {String(seriesItem.sort_order || 1).padStart(2, '0')}
          </div>
          <h1 className="font-serif text-[clamp(36px,6vw,52px)] font-light text-[#f0e9d8] mb-4 leading-tight tracking-[-0.01em]">
            {seriesItem.name}
          </h1>
          <p className="font-serif italic text-xl text-[#c4a84a] mb-6">{seriesItem.tagline}</p>
          <p className="font-serif text-lg text-[#c8b99a] max-w-2xl leading-relaxed mb-8">
            {seriesItem.description}
          </p>
          <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#f0e9d8] opacity-40">
            {essays.length} essays published{totalEssays ? ` of ${totalEssays}` : ''} ·{' '}
            {seriesItem.access_level === 'free_first'
              ? 'Free & members essays'
              : seriesItem.access_level === 'members_only'
                ? 'Members only'
                : 'All free'}
          </div>
        </div>
      </header>

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
            {freeEssays.length > 0 && (
              <div className="mb-10 pb-8 border-b border-[rgba(61,92,69,0.25)]">
                <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--hw-sage)] mb-3">
                  Start free
                </div>
                <p className="font-serif italic text-lg text-[var(--hw-ink2)] mb-6">
                  Begin with the open essay in this series — no membership required.
                </p>
                {freeEssays.map(essay => (
                  <Link
                    key={`free-${essay.id}`}
                    to={`/journal/${essay.slug}`}
                    className="group block border-l-2 border-[var(--hw-sage)] pl-5 -ml-5 py-2"
                  >
                    <EssayThumbnail article={essay} compact className="mb-5 max-w-[320px]" />
                    <h2 className="font-serif text-2xl md:text-3xl font-light text-[var(--hw-ink)] group-hover:text-[var(--hw-gold)] transition-colors duration-300 leading-tight mb-2">
                      {essay.title}
                    </h2>
                    {essay.subtitle && (
                      <p className="font-serif italic text-base text-[var(--hw-rust)] mb-3 leading-relaxed">
                        {essay.subtitle}
                      </p>
                    )}
                    <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--hw-sage)]">
                      Free essay · Read now →
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {memberEssays.map((essay, i) => (
              <Link
                key={essay.id}
                to={`/journal/${essay.slug}`}
                className="group block border-l-2 border-transparent hover:border-[var(--hw-gold)] pl-5 -ml-5 py-8 border-b border-[rgba(154,125,46,0.18)] transition-all duration-300"
              >
                <EssayThumbnail article={essay} compact className="mb-5 max-w-[320px]" />
                <div className="flex items-baseline gap-5 mb-2">
                  <span className="font-mono text-2xl text-[var(--hw-gold)] opacity-50">
                    {String(essay.series_order || i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <h2 className="font-serif text-2xl md:text-3xl font-light text-[var(--hw-ink)] group-hover:text-[var(--hw-gold)] transition-colors duration-300 mb-1 leading-tight">
                      {essay.title}
                    </h2>
                    {essay.subtitle && (
                      <p className="font-serif italic text-base text-[var(--hw-rust)] mb-2 leading-relaxed">
                        {essay.subtitle}
                      </p>
                    )}
                    <p className="font-serif text-sm text-[var(--hw-ink2)] mb-3 leading-relaxed">
                      {essay.excerpt}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--hw-ink3)]">
                        {essay.reading_time_mins || 9} min read
                      </span>
                      <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--hw-gold)]">
                        Members
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

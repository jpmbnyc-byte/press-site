import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { formatPublicationDate } from '@/lib/editorial';
import { readReaderMemory, readerArticleEntries } from '@/lib/readerMemory';
import EssayThumbnail from '@/components/EssayThumbnail';
import NewsletterSignup from '@/components/NewsletterSignup';

export default function Journal() {
  const [params] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readerMemory, setReaderMemory] = useState(() => readReaderMemory());
  const [filterSeries, setFilterSeries] = useState('All');
  const [filterAccess, setFilterAccess] = useState(() => {
    const access = (params.get('access') || '').toLowerCase();
    if (access === 'free') return 'Free';
    if (access === 'members') return 'Members';
    return 'All';
  });
  const [sortBy, setSortBy] = useState('Newest');

  useEffect(() => {
    const access = (params.get('access') || '').toLowerCase();
    if (access === 'free') setFilterAccess('Free');
    else if (access === 'members') setFilterAccess('Members');
  }, [params]);

  useEffect(() => {
    const onMemory = event => setReaderMemory(event.detail || readReaderMemory());
    window.addEventListener('hw:reader-memory', onMemory);
    return () => window.removeEventListener('hw:reader-memory', onMemory);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const all = await base44.entities.Article.list('-published_at', 100);
        setArticles(all.filter(a => a.status === 'published' || a.status === 'featured'));
        const s = await base44.entities.Series.list('sort_order', 10);
        setSeries(s.filter(x => x.is_active));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let result = [...articles];
    if (filterSeries !== 'All') result = result.filter(a => a.series_label === filterSeries);
    if (filterAccess !== 'All') result = result.filter(a => a.access_level === filterAccess.toLowerCase());
    if (sortBy === 'Newest') result.sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
    if (sortBy === 'Oldest') result.sort((a, b) => new Date(a.published_at || 0) - new Date(b.published_at || 0));
    return result;
  }, [articles, filterSeries, filterAccess, sortBy]);

  const freeEssays = useMemo(
    () =>
      articles
        .filter(a => a.access_level === 'free')
        .sort((a, b) => {
          if (a.slug === 'relational-faith-the-distance-we-choose') return -1;
          if (b.slug === 'relational-faith-the-distance-we-choose') return 1;
          return new Date(b.published_at || 0) - new Date(a.published_at || 0);
        }),
    [articles]
  );

  const readEntries = useMemo(() => readerArticleEntries(readerMemory), [readerMemory]);
  const readMap = useMemo(
    () => new Map(readEntries.map(entry => [entry.slug, entry])),
    [readEntries]
  );
  const lastEntry = readEntries[0] || null;
  const lastArticle = lastEntry ? articles.find(article => article.slug === lastEntry.slug) : null;
  const continueArticle = useMemo(() => {
    if (!lastArticle) return null;
    const currentOrder = Number(lastArticle.series_order) || 0;
    return articles
      .filter(article => article.series_slug === lastArticle.series_slug && article.slug !== lastArticle.slug)
      .sort((a, b) => (Number(a.series_order) || 99) - (Number(b.series_order) || 99))
      .find(article => (Number(article.series_order) || 0) > currentOrder) || null;
  }, [articles, lastArticle]);
  const startArticle = freeEssays[0] || articles[0] || null;
  const continueChoice = continueArticle || lastArticle;
  const newArticle = articles.find(
    article => article.slug !== startArticle?.slug && article.slug !== continueChoice?.slug
  ) || articles[0] || null;

  const readerStatus = article => {
    const entry = readMap.get(article.slug);
    if (!entry) return { label: 'Unread', className: 'text-[var(--hw-ink3)]' };
    if (entry.completed) return { label: 'Read', className: 'text-[var(--hw-sage)]' };
    const percent = Math.round((Number(entry.progress) || 0) * 100);
    if (percent >= 8) {
      return { label: `Continue · ${percent}%`, className: 'text-[var(--hw-gold)]' };
    }
    return { label: 'Entered', className: 'text-[var(--hw-muted)]' };
  };

  const FilterButton = ({ label, active, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 font-mono text-[9px] tracking-[0.2em] uppercase px-4 py-2 whitespace-nowrap transition-all duration-300 ${
        active
          ? 'bg-[var(--hw-gold)] text-[var(--hw-bg)]'
          : 'border border-[var(--hw-gold)] text-[var(--hw-gold)] hover:bg-[var(--hw-gold)] hover:text-[var(--hw-bg)]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="px-6 py-16 max-w-5xl mx-auto">
      <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-[var(--hw-gold)] mb-4">Journal</div>
      <h1 className="font-serif text-[clamp(32px,5vw,42px)] font-light text-[var(--hw-ink)] mb-3 leading-tight">
        From the Human Weather Archive
      </h1>
      <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--hw-ink3)] mb-10">
        {articles.length} essays · {series.length} series · {freeEssays.length} free
      </div>

      {!loading && articles.length > 0 && filterAccess === 'All' && filterSeries === 'All' && (
        <section className="mb-16 border-y border-[var(--hw-rule)]">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <Link
              to={continueChoice ? `/journal/${continueChoice.slug}` : '/series'}
              className="group py-7 md:pr-7 md:border-r border-[var(--hw-rule)]"
            >
              <div className="hw-label text-[var(--hw-muted)] mb-3">Continue a Series</div>
              <div className="font-heading text-xl font-medium tracking-[-0.025em] leading-tight text-[var(--hw-ink)] group-hover:opacity-65 transition-opacity mb-2">
                {continueChoice?.title || 'Choose a weather system'}
              </div>
              <div className="font-serif text-sm text-[var(--hw-muted)]">
                {continueArticle
                  ? `Next in ${continueArticle.series_label}`
                  : lastArticle
                    ? `Return to ${lastArticle.series_label || 'your last series'}`
                    : 'Enter the series map'}
              </div>
            </Link>

            <Link
              to={startArticle ? `/journal/${startArticle.slug}` : '/journal?access=free'}
              className="group py-7 md:px-7 border-t md:border-t-0 md:border-r border-[var(--hw-rule)]"
            >
              <div className="hw-label text-[var(--hw-sage)] mb-3">Start Here</div>
              <div className="font-heading text-xl font-medium tracking-[-0.025em] leading-tight text-[var(--hw-ink)] group-hover:opacity-65 transition-opacity mb-2">
                {startArticle?.title || 'Open essays'}
              </div>
              <div className="font-serif text-sm text-[var(--hw-muted)]">No membership required.</div>
            </Link>

            <Link
              to={newArticle ? `/journal/${newArticle.slug}` : '/journal'}
              className="group py-7 md:pl-7 border-t md:border-t-0 border-[var(--hw-rule)]"
            >
              <div className="hw-label text-[var(--hw-muted)] mb-3">New in the Journal</div>
              <div className="font-heading text-xl font-medium tracking-[-0.025em] leading-tight text-[var(--hw-ink)] group-hover:opacity-65 transition-opacity mb-2">
                {newArticle?.title || 'Latest field report'}
              </div>
              <div className="font-serif text-sm text-[var(--hw-muted)]">Enter the newest weather.</div>
            </Link>
          </div>
        </section>
      )}

      {!loading && filterAccess === 'All' && filterSeries === 'All' && freeEssays.length > 0 && (
        <section className="mb-14 pb-12 border-b border-[rgba(154,125,46,0.18)]">
          <div className="flex items-baseline justify-between gap-4 mb-8">
            <div>
              <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--hw-sage)] mb-2">
                Read Free
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-light text-[var(--hw-ink)]">
                Open without a membership
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setFilterAccess('Free')}
              className="hidden sm:inline-flex min-h-11 items-center font-mono text-[9px] tracking-[0.25em] uppercase text-[var(--hw-sage)] border-b border-[var(--hw-sage)] hover:text-[var(--hw-gold)] hover:border-[var(--hw-gold)] transition-colors"
            >
              Free only →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {freeEssays.map(essay => {
              const state = readerStatus(essay);
              return (
                <Link
                  key={essay.id}
                  to={`/journal/${essay.slug}`}
                  className="group block border-t-2 border-[var(--hw-sage)] pt-5"
                >
                  <EssayThumbnail article={essay} compact className="mb-4" />
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[8px] tracking-[0.2em] uppercase mb-3">
                    <span className="text-[var(--hw-sage)]">Free · {essay.series_label || 'Human Weather'}</span>
                    <span className="text-[var(--hw-rule)]">·</span>
                    <span className={state.className}>{state.label}</span>
                  </div>
                  <h3 className="font-serif text-xl font-light text-[var(--hw-ink)] group-hover:text-[var(--hw-gold)] transition-colors duration-300 mb-2 leading-tight">
                    {essay.title}
                  </h3>
                  {essay.subtitle && (
                    <p className="font-serif italic text-sm text-[var(--hw-rust)] mb-2 leading-relaxed">
                      {essay.subtitle}
                    </p>
                  )}
                  <p className="font-serif text-sm text-[var(--hw-ink2)] line-clamp-3 leading-relaxed">
                    {essay.excerpt}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="space-y-4 mb-12 sticky top-[5.5rem] lg:top-14 bg-[var(--hw-bg)] py-4 z-30 border-b border-[rgba(154,125,46,0.15)]">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterButton label="All" active={filterSeries === 'All'} onClick={() => setFilterSeries('All')} />
          {series.map(s => (
            <FilterButton
              key={s.id}
              label={s.name}
              active={filterSeries === s.name}
              onClick={() => setFilterSeries(s.name)}
            />
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <FilterButton label="All Access" active={filterAccess === 'All'} onClick={() => setFilterAccess('All')} />
          <FilterButton label="Free" active={filterAccess === 'Free'} onClick={() => setFilterAccess('Free')} />
          <FilterButton label="Members" active={filterAccess === 'Members'} onClick={() => setFilterAccess('Members')} />
          <div className="w-px bg-[rgba(154,125,46,0.2)] mx-2" />
          <FilterButton label="Newest" active={sortBy === 'Newest'} onClick={() => setSortBy('Newest')} />
          <FilterButton label="Oldest" active={sortBy === 'Oldest'} onClick={() => setSortBy('Oldest')} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--hw-gold)] border-t-transparent rounded-none animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center font-serif italic text-lg text-[var(--hw-ink3)]">
          No essays found for these filters.
        </div>
      ) : (
        <div className="space-y-0">
          {filtered.map(article => {
            const isFree = article.access_level === 'free';
            const published = formatPublicationDate(article.published_at);
            const state = readerStatus(article);
            return (
              <Link
                key={article.id}
                to={`/journal/${article.slug}`}
                className="group block border-l-2 border-transparent hover:border-[var(--hw-gold)] pl-5 -ml-5 py-8 border-b border-[rgba(154,125,46,0.18)] transition-all duration-300"
              >
                <EssayThumbnail article={article} compact className="mb-5 max-w-[320px]" />
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--hw-rust)]">
                    {article.series_label || 'Human Weather'}
                  </div>
                  <div className="flex flex-wrap justify-end items-center gap-x-4 gap-y-1">
                    <span className={`font-mono text-[8px] tracking-[0.15em] uppercase ${state.className}`}>
                      {state.label}
                    </span>
                    <span
                      className={`font-mono text-[8px] tracking-[0.15em] uppercase ${
                        isFree ? 'text-[var(--hw-sage)]' : 'text-[var(--hw-gold)]'
                      }`}
                    >
                      {isFree ? 'Free' : 'Members'}
                    </span>
                    <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--hw-ink3)]">
                      Essay {String(article.series_order || 1).padStart(2, '0')}
                    </span>
                  </div>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-light text-[var(--hw-ink)] group-hover:text-[var(--hw-gold)] transition-colors duration-300 mb-2 leading-tight">
                  {article.title}
                </h2>
                {article.subtitle && (
                  <p className="font-serif italic text-base text-[var(--hw-rust)] mb-2 leading-relaxed">
                    {article.subtitle}
                  </p>
                )}
                <p className="font-serif text-base text-[var(--hw-ink2)] mb-3 leading-relaxed">
                  {article.excerpt}
                </p>
                <div className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--hw-ink3)]">
                  {article.author_name || 'JP Bobo'} · {published || 'Publication date forthcoming'} · {article.reading_time_mins || 9} min read
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <section id="weekly-dispatch" className="scroll-mt-28 mt-20 pt-16 border-t border-[var(--hw-rule)]">
        <NewsletterSignup source="journal" />
      </section>
    </div>
  );
}

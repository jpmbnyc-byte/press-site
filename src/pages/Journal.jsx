import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function Journal() {
  const [articles, setArticles] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeries, setFilterSeries] = useState('All');
  const [filterAccess, setFilterAccess] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

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
    if (sortBy === 'Most Read') result.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    return result;
  }, [articles, filterSeries, filterAccess, sortBy]);

  const FilterButton = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`font-mono text-[9px] tracking-[0.2em] uppercase px-4 py-2 whitespace-nowrap transition-all duration-300 ${
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
        {articles.length} essays · {series.length} series
      </div>

      {/* Filter bar */}
      <div className="space-y-4 mb-12 sticky top-14 bg-[var(--hw-bg)] py-4 z-30 border-b border-[rgba(154,125,46,0.15)]">
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
          <FilterButton label="Most Read" active={sortBy === 'Most Read'} onClick={() => setSortBy('Most Read')} />
        </div>
      </div>

      {/* Article list */}
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
            return (
              <Link
                key={article.id}
                to={`/journal/${article.slug}`}
                className="group block border-l-2 border-transparent hover:border-[var(--hw-gold)] pl-5 -ml-5 py-8 border-b border-[rgba(154,125,46,0.18)] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--hw-rust)]">
                    {article.series_label || 'Human Weather'}
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-mono text-[8px] tracking-[0.15em] uppercase ${
                        isFree ? 'text-[var(--hw-sage)]' : 'text-[var(--hw-gold)]'
                      }`}
                    >
                      {isFree ? 'Free' : 'Members'}
                    </span>
                    <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--hw-ink3)]">
                      Essay {String(article.series_order || 1).padStart(2, '0')} of 07
                    </span>
                  </div>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-light text-[var(--hw-ink)] group-hover:text-[var(--hw-gold)] transition-colors duration-300 mb-2 leading-tight">
                  {article.title}
                  {article.subtitle && (
                    <span className="text-[var(--hw-ink2)] font-light"> — {article.subtitle}</span>
                  )}
                </h2>
                <p className="font-serif italic text-base text-[var(--hw-ink2)] mb-3 leading-relaxed">
                  {article.excerpt}
                </p>
                <div className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--hw-ink3)]">
                  JP Bobo · {article.published_at || '2026'} · {article.reading_time_mins || 9} min read
                  {article.view_count ? ` · ${article.view_count} views` : ''}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
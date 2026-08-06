import { Link } from 'react-router-dom';

export default function ArticleCard({ article }) {
  const isFree = article.access_level === 'free';

  return (
    <Link
      to={`/journal/${article.slug}`}
      className="group block border-t border-[var(--hw-ink)] pt-6"
    >
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--hw-gold)]">
          {article.series_label || 'Human Weather'}
        </div>
        <div
          className={`font-mono text-[8px] tracking-[0.2em] uppercase ${
            isFree ? 'text-[var(--hw-sage)]' : 'text-[var(--hw-ink3)]'
          }`}
        >
          {isFree ? 'Free' : 'Members'}
        </div>
      </div>
      <h3 className="font-serif text-[clamp(24px,3vw,32px)] font-light text-[var(--hw-ink)] group-hover:text-[var(--hw-gold)] transition-colors duration-500 mb-3 leading-[1.1]">
        {article.subtitle || article.title}
      </h3>
      {article.subtitle && article.title && (
        <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--hw-ink3)] mb-4">
          {article.title}
        </p>
      )}
      <p className="font-body text-sm text-[var(--hw-ink2)] mb-6 line-clamp-2 leading-[1.75]">
        {article.excerpt}
      </p>
      <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--hw-ink3)]">
        {article.published_at || '2026'} · {article.reading_time_mins || 9} min read
      </div>
    </Link>
  );
}

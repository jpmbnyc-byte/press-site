import { Link } from 'react-router-dom';

export default function ArticleCard({ article }) {
  return (
    <Link
      to={`/journal/${article.slug}`}
      className="group block border-t border-[var(--hw-ink)] pt-6"
    >
      <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--hw-gold)] mb-4">
        {article.series_label || 'Human Weather'}
      </div>
      <h3 className="font-serif text-[clamp(24px,3vw,32px)] font-light text-[var(--hw-ink)] group-hover:text-[var(--hw-gold)] transition-colors duration-500 mb-3 leading-[1.1]">
        {article.title}
      </h3>
      {article.subtitle && (
        <p className="font-serif italic text-lg text-[var(--hw-ink2)] mb-4">{article.subtitle}</p>
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

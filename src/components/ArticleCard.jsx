import { Link } from 'react-router-dom';

export default function ArticleCard({ article }) {
  const isFree = article.access_level === 'free';
  return (
    <Link
      to={`/journal/${article.slug}`}
      className="group block border-t-2 border-[var(--hw-gold)] pt-5 transition-all duration-300 hover:border-[var(--hw-gold-lt)]"
    >
      <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--hw-gold)] mb-3">
        {article.series_label || 'Human Weather'}
      </div>
      <h3 className="font-serif text-2xl font-light text-[var(--hw-ink)] group-hover:text-[var(--hw-gold)] transition-colors duration-350 mb-2 leading-[1.15]">
        {article.title}
      </h3>
      {article.subtitle && (
        <p className="font-serif italic text-base text-[var(--hw-ink2)] mb-4">{article.subtitle}</p>
      )}
      <p className="font-serif text-sm text-[var(--hw-ink2)] mb-4 line-clamp-2 leading-relaxed">
        {article.excerpt}
      </p>
      <div className="flex items-center justify-between">
        <div className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--hw-ink3)]">
          JP Bobo · {article.reading_time_mins || 9} min
        </div>
        <span
          className={`font-mono text-[8px] tracking-[0.15em] uppercase ${
            isFree ? 'text-[var(--hw-sage)]' : 'text-[var(--hw-gold)]'
          }`}
        >
          {isFree ? 'Free' : 'Members'}
        </span>
      </div>
    </Link>
  );
}
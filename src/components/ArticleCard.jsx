import { Link } from 'react-router-dom';
import { formatPublicationDate } from '@/lib/editorial';
import EssayThumbnail from '@/components/EssayThumbnail';

export default function ArticleCard({ article }) {
  const isFree = article.access_level === 'free';
  const published = formatPublicationDate(article.published_at);

  return (
    <Link
      to={`/journal/${article.slug}`}
      className="group block border-t border-[var(--hw-ink)] pt-6"
    >
      <EssayThumbnail article={article} />
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
      <h3 className="font-serif text-[clamp(24px,3vw,32px)] font-light text-[var(--hw-ink)] group-hover:text-[var(--hw-gold)] transition-colors duration-500 mb-2 leading-[1.1]">
        {article.title}
      </h3>
      {article.subtitle && (
        <p className="font-serif italic text-base text-[var(--hw-rust)] mb-4 leading-relaxed">
          {article.subtitle}
        </p>
      )}
      <p className="font-body text-sm text-[var(--hw-ink2)] mb-6 line-clamp-2 leading-[1.75]">
        {article.excerpt}
      </p>
      <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--hw-ink3)]">
        {published || 'Publication date forthcoming'} · {article.reading_time_mins || 9} min read
      </div>
    </Link>
  );
}

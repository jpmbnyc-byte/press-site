import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  beginReaderSession,
  lastReaderArticle,
  readReaderMemory,
  recordArticleProgress,
  recordArticleVisit,
} from '@/lib/readerMemory';

function articleSlug(pathname) {
  const match = String(pathname || '').match(/^\/journal\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round((Number(value) || 0) * 100)));
}

function ReturnToField({ memory, previousVisitAt, articles }) {
  const lastEntry = lastReaderArticle(memory);
  const lastArticle = lastEntry ? articles.find(item => item.slug === lastEntry.slug) : null;
  const previousTime = previousVisitAt ? new Date(previousVisitAt).getTime() : 0;
  const fresh = previousTime
    ? articles
        .filter(item => {
          const published = new Date(item.published_at || 0).getTime();
          return published > previousTime && item.slug !== lastArticle?.slug;
        })
        .slice(0, 2)
    : [];

  if (!lastArticle && fresh.length === 0) return null;

  const progress = clampPercent(lastEntry?.progress);
  const completed = lastEntry?.completed === true;

  return (
    <section className="border-y border-[var(--hw-rule)] bg-[var(--hw-paper)] px-6 py-8 md:py-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-start">
        <div className="md:col-span-4">
          <div className="hw-label text-[var(--hw-muted)] mb-3">Return to the Field</div>
          <p className="font-serif text-xl text-[var(--hw-ink2)] leading-relaxed max-w-sm">
            The journal remembers where you left the weather.
          </p>
        </div>

        {lastArticle && (
          <Link
            to={`/journal/${lastArticle.slug}`}
            className="group md:col-span-5 border-l-2 border-[var(--series-ink,var(--hw-ink))] pl-5"
          >
            <div className="hw-label text-[var(--hw-muted)] mb-2">
              {completed ? 'Revisit a field note' : 'Continue reading'}
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-[-0.03em] leading-tight text-[var(--hw-ink)] group-hover:opacity-65 transition-opacity mb-2">
              {lastArticle.title}
            </h2>
            {lastArticle.subtitle && (
              <p className="font-serif text-base text-[var(--hw-muted)] mb-4">{lastArticle.subtitle}</p>
            )}
            {!completed && progress > 0 && (
              <div className="max-w-xs">
                <div className="h-px bg-[var(--hw-rule)] overflow-hidden">
                  <div className="h-px bg-[var(--hw-ink)]" style={{ width: `${progress}%` }} />
                </div>
                <div className="hw-label text-[var(--hw-muted)] mt-2">About {progress}% read</div>
              </div>
            )}
          </Link>
        )}

        <div className="md:col-span-3">
          <div className="hw-label text-[var(--hw-muted)] mb-3">Since your last visit</div>
          {fresh.length > 0 ? (
            <div className="space-y-4">
              {fresh.map(item => (
                <Link key={item.id || item.slug} to={`/journal/${item.slug}`} className="group block">
                  <div className="font-serif text-lg leading-tight text-[var(--hw-ink)] group-hover:opacity-65 transition-opacity">
                    {item.title}
                  </div>
                  <div className="hw-label text-[var(--hw-muted)] mt-1">{item.series_label || 'Human Weather'}</div>
                </Link>
              ))}
            </div>
          ) : (
            <Link to="/journal" className="hw-label text-[var(--hw-ink)] border-b border-[var(--hw-ink)] pb-1">
              Re-enter the archive →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ReaderMemoryLayer() {
  const location = useLocation();
  const [memory, setMemory] = useState(() => readReaderMemory());
  const [previousVisitAt, setPreviousVisitAt] = useState(null);
  const [homeTarget, setHomeTarget] = useState(null);
  const [articles, setArticles] = useState([]);
  const lastSavedRef = useRef({ slug: null, progress: 0 });

  useEffect(() => {
    const session = beginReaderSession();
    setMemory(session.memory);
    setPreviousVisitAt(session.previousVisitAt);

    const onMemory = event => setMemory(event.detail || readReaderMemory());
    window.addEventListener('hw:reader-memory', onMemory);
    return () => window.removeEventListener('hw:reader-memory', onMemory);
  }, []);

  const slug = useMemo(() => articleSlug(location.pathname), [location.pathname]);

  useEffect(() => {
    if (!slug) return;
    const next = recordArticleVisit(slug);
    setMemory(next);
    lastSavedRef.current = {
      slug,
      progress: Number(next.articles?.[slug]?.progress) || 0,
    };
  }, [slug]);

  useEffect(() => {
    if (!slug) return undefined;
    let frame = null;

    const measure = () => {
      frame = null;
      const body = document.querySelector('.article-body');
      if (!body) return;
      const rect = body.getBoundingClientRect();
      const total = Math.max(body.offsetHeight, 1);
      const consumed = Math.min(total, Math.max(0, window.innerHeight * 0.72 - rect.top));
      const progress = consumed / total;
      const previous = lastSavedRef.current.slug === slug ? lastSavedRef.current.progress : 0;
      if (progress < 0.04 || progress < previous + 0.025) return;
      lastSavedRef.current = { slug, progress };
      setMemory(recordArticleProgress(slug, progress));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    const timer = window.setTimeout(measure, 450);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [slug]);

  useEffect(() => {
    if (location.pathname !== '/') {
      setHomeTarget(null);
      return undefined;
    }

    let target = null;
    let observer = null;
    const mount = () => {
      const wall = document.querySelector('.hw-gallery-wall');
      if (!wall || wall.nextElementSibling?.dataset?.hwReaderReturn === 'true') return false;
      target = document.createElement('div');
      target.dataset.hwReaderReturn = 'true';
      wall.insertAdjacentElement('afterend', target);
      setHomeTarget(target);
      return true;
    };

    if (!mount()) {
      observer = new MutationObserver(() => {
        if (mount()) observer?.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
      setHomeTarget(null);
      target?.remove();
    };
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/' || (!previousVisitAt && !lastReaderArticle(memory))) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const all = await base44.entities.Article.list('-published_at', 50);
        if (cancelled) return;
        setArticles(all.filter(item => item.status === 'published' || item.status === 'featured'));
      } catch (error) {
        console.error('Reader return module failed to load:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, previousVisitAt, memory]);

  if (!homeTarget || location.pathname !== '/') return null;
  return createPortal(
    <ReturnToField memory={memory} previousVisitAt={previousVisitAt} articles={articles} />,
    homeTarget
  );
}

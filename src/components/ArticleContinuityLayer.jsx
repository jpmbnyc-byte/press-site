import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import EssayThumbnail from '@/components/EssayThumbnail';
import { readReaderMemory } from '@/lib/readerMemory';

function routeSlug(pathname) {
  const match = String(pathname || '').match(/^\/journal\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function ResumeFieldNote({ entry, onResume }) {
  const percent = Math.max(1, Math.min(99, Math.round((Number(entry?.progress) || 0) * 100)));
  return (
    <div className="max-w-[740px] mx-auto px-6 pb-4">
      <button
        type="button"
        onClick={onResume}
        className="w-full flex items-center justify-between gap-5 border-y border-[var(--hw-rule)] py-4 text-left group"
      >
        <span>
          <span className="hw-label text-[var(--hw-muted)] block mb-1">Return to your place</span>
          <span className="font-serif text-lg text-[var(--hw-ink)]">Resume this field note</span>
        </span>
        <span className="hw-label text-[var(--hw-ink)] whitespace-nowrap group-hover:opacity-60 transition-opacity">
          {percent}% →
        </span>
      </button>
    </div>
  );
}

function NextFieldNote({ current, next, total }) {
  if (!next) return null;
  const sameSeries = next.series_slug && next.series_slug === current?.series_slug;
  const nextOrder = Number(next.series_order) || 1;

  return (
    <section className="border-y border-[var(--hw-rule)] bg-[var(--hw-surface)] px-6 py-14 md:py-16">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
        <div className="md:col-span-4">
          <div className="hw-label text-[var(--hw-muted)] mb-3">Your next field note</div>
          <p className="font-serif text-lg text-[var(--hw-ink2)] leading-relaxed">
            {sameSeries
              ? `Continue the weather system you are already inside.`
              : `Leave this weather and cross into another system.`}
          </p>
          {sameSeries && (
            <div className="hw-label text-[var(--hw-muted)] mt-5">
              Essay {String(nextOrder).padStart(2, '0')}
              {total ? ` / ${String(total).padStart(2, '0')}` : ''}
            </div>
          )}
        </div>

        <Link to={`/journal/${next.slug}`} className="group md:col-span-8 block">
          <EssayThumbnail article={next} compact className="mb-5 max-w-[420px]" />
          <div className="hw-label text-[var(--hw-muted)] mb-2">
            {sameSeries ? `Continue in ${next.series_label || 'this series'}` : next.series_label || 'Human Weather'}
            {next.access_level === 'free' ? ' · Free' : ' · Members'}
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-[-0.035em] leading-[1.02] text-[var(--hw-ink)] group-hover:opacity-65 transition-opacity mb-3">
            {next.title}
          </h2>
          {next.subtitle && (
            <p className="font-serif text-lg text-[var(--hw-muted)] leading-relaxed mb-5">{next.subtitle}</p>
          )}
          <span className="hw-label text-[var(--hw-ink)] border-b border-[var(--hw-ink)] pb-1">
            Enter the next field note →
          </span>
        </Link>
      </div>
    </section>
  );
}

export default function ArticleContinuityLayer() {
  const location = useLocation();
  const slug = useMemo(() => routeSlug(location.pathname), [location.pathname]);
  const [memory, setMemory] = useState(() => readReaderMemory());
  const [current, setCurrent] = useState(null);
  const [next, setNext] = useState(null);
  const [total, setTotal] = useState(null);
  const [resumeTarget, setResumeTarget] = useState(null);
  const [nextTarget, setNextTarget] = useState(null);

  useEffect(() => {
    const onMemory = event => setMemory(event.detail || readReaderMemory());
    window.addEventListener('hw:reader-memory', onMemory);
    return () => window.removeEventListener('hw:reader-memory', onMemory);
  }, []);

  useEffect(() => {
    if (!slug) {
      setCurrent(null);
      setNext(null);
      setTotal(null);
      return undefined;
    }

    let cancelled = false;
    (async () => {
      try {
        const [allArticles, allSeries] = await Promise.all([
          base44.entities.Article.list('-published_at', 100),
          base44.entities.Series.list('sort_order', 10),
        ]);
        if (cancelled) return;
        const live = allArticles.filter(item => item.status === 'published' || item.status === 'featured');
        const found = live.find(item => item.slug === slug) || null;
        setCurrent(found);
        if (!found) return;

        const sameSeries = live
          .filter(item => item.series_slug === found.series_slug && item.slug !== found.slug)
          .sort((a, b) => (Number(a.series_order) || 99) - (Number(b.series_order) || 99));
        const currentOrder = Number(found.series_order) || 0;
        const onward = sameSeries.find(item => (Number(item.series_order) || 0) > currentOrder);
        const fallback = live.find(item => item.slug !== found.slug && item.series_slug !== found.series_slug);
        setNext(onward || fallback || sameSeries[0] || null);

        const seriesItem = allSeries.find(item => item.slug === found.series_slug);
        const inferredTotal = Math.max(
          currentOrder,
          ...sameSeries.map(item => Number(item.series_order) || 0)
        );
        setTotal(Number(seriesItem?.total_essays) || inferredTotal || null);
      } catch (error) {
        console.error('Article continuity failed to load:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      setResumeTarget(null);
      setNextTarget(null);
      return undefined;
    }

    let resume = null;
    let onward = null;
    let observer = null;

    const mount = () => {
      const article = document.querySelector('main article');
      if (!article) return false;

      if (!article.previousElementSibling?.dataset?.hwResumeField) {
        resume = document.createElement('div');
        resume.dataset.hwResumeField = 'true';
        article.insertAdjacentElement('beforebegin', resume);
        setResumeTarget(resume);
      }

      if (!article.nextElementSibling?.dataset?.hwNextField) {
        onward = document.createElement('div');
        onward.dataset.hwNextField = 'true';
        article.insertAdjacentElement('afterend', onward);
        setNextTarget(onward);
      }
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
      setResumeTarget(null);
      setNextTarget(null);
      resume?.remove();
      onward?.remove();
    };
  }, [slug]);

  if (!slug) return null;

  const entry = memory.articles?.[slug];
  const progress = Number(entry?.progress) || 0;
  const showResume = entry && entry.completed !== true && progress >= 0.08 && progress < 0.88;

  const resume = () => {
    const body = document.querySelector('.article-body');
    if (!body) return;
    const top = window.scrollY + body.getBoundingClientRect().top;
    const destination = top + body.offsetHeight * progress - window.innerHeight * 0.22;
    window.scrollTo({ top: Math.max(0, destination), behavior: 'smooth' });
  };

  return (
    <>
      {resumeTarget && showResume
        ? createPortal(<ResumeFieldNote entry={entry} onResume={resume} />, resumeTarget)
        : null}
      {nextTarget && current && next
        ? createPortal(<NextFieldNote current={current} next={next} total={total} />, nextTarget)
        : null}
    </>
  );
}

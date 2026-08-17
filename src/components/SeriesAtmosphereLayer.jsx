import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import '@/seriesAtmospheres.css';

function routeMatch(pathname) {
  const series = String(pathname || '').match(/^\/series\/([^/?#]+)/);
  if (series) return { kind: 'series', slug: decodeURIComponent(series[1]) };
  const article = String(pathname || '').match(/^\/journal\/([^/?#]+)/);
  if (article) return { kind: 'article', slug: decodeURIComponent(article[1]) };
  return null;
}

export default function SeriesAtmosphereLayer() {
  const location = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    const match = routeMatch(location.pathname);
    let cancelled = false;

    root.removeAttribute('data-series');
    root.removeAttribute('data-page-kind');

    if (!match) return undefined;
    root.setAttribute('data-page-kind', match.kind);

    if (match.kind === 'series') {
      root.setAttribute('data-series', match.slug);
      return () => {
        root.removeAttribute('data-series');
        root.removeAttribute('data-page-kind');
      };
    }

    (async () => {
      try {
        const all = await base44.entities.Article.list('-published_at', 100);
        if (cancelled) return;
        const article = all.find(item => item.slug === match.slug);
        if (article?.series_slug) root.setAttribute('data-series', article.series_slug);
      } catch (error) {
        console.error('Series atmosphere failed to load:', error);
      }
    })();

    return () => {
      cancelled = true;
      root.removeAttribute('data-series');
      root.removeAttribute('data-page-kind');
    };
  }, [location.pathname]);

  return null;
}

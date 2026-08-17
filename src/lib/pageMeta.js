/**
 * Client-side document meta updates for browsers and in-app navigation.
 * Vercel Routing Middleware supplies the initial essay head to crawlers.
 */

import { SITE_URL } from '@/lib/site';

const SITE_DESCRIPTION =
  'Journaling the climate within and around us. Essays on emotional climate, faith, bliss, diaspora, and the interior life by JP Bobo.';
const HOME_SHARE_IMAGE =
  'https://tile.loc.gov/storage-services/service/pnp/fsa/8c36000/8c36500/8c36556v.jpg?v=20260817-home-hero';

const DEFAULTS = {
  title: 'Human Weather',
  description: SITE_DESCRIPTION,
  ogTitle: 'Human Weather',
  ogDescription: SITE_DESCRIPTION,
  image: HOME_SHARE_IMAGE,
  imageAlt: 'Passengers leaving Hudson on a ferry in New York, October 1941. Photograph by John Collier Jr.',
  url: `${SITE_URL}/`,
  type: 'website',
  robots: 'index,follow',
};

function setMeta(attr, key, content) {
  if (content == null || content === '') return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// Version share-image URLs so social crawlers see image replacements instead of a stale cached asset.
function essayShareRevision(article) {
  const seed = article?.updated_date || article?.hero_image_url || article?.published_at || '1';
  return encodeURIComponent(String(seed).replace(/[^A-Za-z0-9._-]/g, '-'));
}

export function setPageMeta({
  title,
  description,
  ogTitle,
  ogDescription,
  image,
  imageAlt,
  url,
  type = 'website',
  robots = 'index,follow',
} = {}) {
  const t = title || DEFAULTS.title;
  const d = description || DEFAULTS.description;
  const ot = ogTitle || t;
  const od = ogDescription || d;
  const img = image || DEFAULTS.image;
  const alt = imageAlt || DEFAULTS.imageAlt;
  const u = url || DEFAULTS.url;

  document.title = t;
  setMeta('name', 'description', d);
  setMeta('name', 'robots', robots);

  setMeta('property', 'og:type', type);
  setMeta('property', 'og:site_name', 'Human Weather');
  setMeta('property', 'og:url', u);
  setMeta('property', 'og:title', ot);
  setMeta('property', 'og:description', od);
  setMeta('property', 'og:image', img);
  setMeta('property', 'og:image:secure_url', img);
  setMeta('property', 'og:image:alt', alt);

  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', ot);
  setMeta('name', 'twitter:description', od);
  setMeta('name', 'twitter:image', img);

  setCanonical(u);
}

export function setHomePageMeta() {
  setPageMeta(DEFAULTS);
}

export function setEssayPageMeta(article) {
  if (!article) return;
  const essayName = article.title || 'Essay';
  const series = article.series_label || 'Human Weather';
  const title = `${essayName} — ${series} | Human Weather`;
  const description =
    article.excerpt ||
    article.subtitle ||
    `An essay from ${series} by ${article.author_name || 'JP Bobo'}.`;
  const image = `${SITE_URL}/og/${encodeURIComponent(article.slug)}?v=${essayShareRevision(article)}`;
  const url = `${SITE_URL}/journal/${article.slug}`;

  setPageMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    image,
    imageAlt: `${essayName} — ${series}`,
    url,
    type: 'article',
  });
}

export function setSeriesIndexMeta() {
  setPageMeta({
    title: 'Series | Human Weather',
    description:
      'Explore the Human Weather series: connected essays on emotional climate, faith, culture, diaspora, bliss, and the interior life.',
    url: `${SITE_URL}/series`,
  });
}

export function setSeriesPageMeta(seriesItem) {
  if (!seriesItem) return;
  const title = `${seriesItem.name} — Series | Human Weather`;
  const description = seriesItem.description || seriesItem.tagline || `Read ${seriesItem.name} on Human Weather.`;
  setPageMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    url: `${SITE_URL}/series/${seriesItem.slug}`,
  });
}

export function setNotFoundPageMeta(pathname = '') {
  setPageMeta({
    title: 'Page Not Found | Human Weather',
    description: 'The requested Human Weather page could not be found.',
    url: `${SITE_URL}${pathname || '/'}`,
    robots: 'noindex,follow',
  });
}

export { DEFAULTS as HOME_PAGE_META };

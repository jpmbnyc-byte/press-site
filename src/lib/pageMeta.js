/**
 * Client-side document meta updates (browsers / some in-app previews).
 * Social crawlers also need the Edge middleware at /journal/:slug.
 */

import { SITE_URL, absoluteUrl } from '@/lib/site';

const DEFAULTS = {
  title: 'Human Weather — The Emotional Climate of Modern Life',
  description:
    'A premium editorial platform on emotional climate, faith, bliss, diaspora, and the interior life. Philosophical personal essays by JP Bobo.',
  ogTitle: 'Human Weather — Journaling the Climate Within and Around Us',
  ogDescription:
    'Essays on life, faith & culture. Reflections for a more aware life. Slow thought. Real connection.',
  image: `${SITE_URL}/og-share.jpg`,
  imageAlt: 'Human Weather Press — journaling the climate within and around us',
  url: `${SITE_URL}/`,
  type: 'website',
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

export function setPageMeta({
  title,
  description,
  ogTitle,
  ogDescription,
  image,
  imageAlt,
  url,
  type = 'website',
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

  setMeta('property', 'og:type', type);
  setMeta('property', 'og:site_name', 'Human Weather Press');
  setMeta('property', 'og:url', u);
  setMeta('property', 'og:title', ot);
  setMeta('property', 'og:description', od);
  setMeta('property', 'og:image', img);
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
  const essayName = article.subtitle || article.title || 'Essay';
  const series = article.series_label || 'Human Weather';
  const title = `${essayName} — ${series} | Human Weather`;
  const description =
    article.excerpt ||
    article.subtitle ||
    `An essay from ${series} by ${article.author_name || 'JP Bobo'}.`;
  const image = absoluteUrl(article.hero_image_url || '/og-share.jpg');
  const url = `${SITE_URL}/journal/${article.slug}`;

  setPageMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    image,
    imageAlt: article.hero_image_alt || essayName,
    url,
    type: 'article',
  });
}

export { DEFAULTS as HOME_PAGE_META };

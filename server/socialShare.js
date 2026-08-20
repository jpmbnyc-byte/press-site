import { createClient } from '@base44/sdk';
import { getEditorialImage } from '../src/lib/editorialImages.js';

export const SITE_URL = 'https://www.humanweather.press';

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function replaceTag(html, pattern, replacement) {
  return pattern.test(html)
    ? html.replace(pattern, replacement)
    : html.replace('</head>', `${replacement}\n</head>`);
}

export function shareRevision(article) {
  const seed = article?.updated_date || article?.hero_image_url || article?.published_at || '1';
  return encodeURIComponent(String(seed).replace(/[^A-Za-z0-9._-]/g, '-'));
}

export function shareImageUrl(article) {
  return `${SITE_URL}/og/${encodeURIComponent(article.slug)}?v=${shareRevision(article)}`;
}

export function articleHero(article) {
  const editorialImage = getEditorialImage(article);
  if (!editorialImage?.src) return null;
  return {
    url: new URL(editorialImage.src, `${SITE_URL}/`).toString(),
    alt: editorialImage.alt || '',
  };
}

export async function getPublicArticle(slug) {
  const appId = process.env.VITE_BASE44_APP_ID;
  if (!appId) return null;

  const base44 = createClient({
    appId,
    serverUrl: process.env.VITE_BASE44_APP_BASE_URL || 'https://humanweather.base44.app',
  });

  try {
    const matches = await base44.entities.Article.filter({ slug });
    const rows = Array.isArray(matches) ? matches : [];
    return rows.find((item) => item.status === 'published' || item.status === 'featured') || null;
  } finally {
    base44.cleanup?.();
  }
}

export function applyArticleMeta(html, article) {
  const essayName = article.title || 'Essay';
  const series = article.series_label || 'Human Weather';
  const title = `${essayName} — ${series} | Human Weather`;
  const description =
    article.excerpt ||
    article.subtitle ||
    `An essay from ${series} by ${article.author_name || 'JP Bobo'}.`;
  const canonical = `${SITE_URL}/journal/${encodeURIComponent(article.slug)}`;
  const hero = articleHero(article);
  const image = shareImageUrl(article);
  const imageAlt = hero?.alt || `${essayName} — ${series}`;

  const values = {
    title: escapeHtml(title),
    description: escapeHtml(description),
    canonical: escapeHtml(canonical),
    image: escapeHtml(image),
    imageAlt: escapeHtml(imageAlt),
  };

  let output = html;
  output = replaceTag(output, /<title>[^<]*<\/title>/i, `<title>${values.title}</title>`);
  output = replaceTag(output, /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${values.description}" />`);
  output = replaceTag(output, /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, '<meta property="og:type" content="article" />');
  output = replaceTag(output, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${values.canonical}" />`);
  output = replaceTag(output, /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${values.title}" />`);
  output = replaceTag(output, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${values.description}" />`);
  output = replaceTag(output, /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${values.image}" />`);
  output = replaceTag(output, /<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image:secure_url" content="${values.image}" />`);
  output = replaceTag(output, /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image:alt" content="${values.imageAlt}" />`);
  output = output.replace(/<meta\s+property="og:image:type"\s+content="[^"]*"\s*\/?>/i, '');
  output = output.replace(/<meta\s+property="og:image:width"\s+content="[^"]*"\s*\/?>/i, '');
  output = output.replace(/<meta\s+property="og:image:height"\s+content="[^"]*"\s*\/?>/i, '');
  output = replaceTag(output, /<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>/i, '<meta name="twitter:card" content="summary_large_image" />');
  output = replaceTag(output, /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${values.title}" />`);
  output = replaceTag(output, /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${values.description}" />`);
  output = replaceTag(output, /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${values.image}" />`);
  output = replaceTag(output, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${values.canonical}" />`);

  if (article.published_at && !/<meta\s+property="article:published_time"/i.test(output)) {
    output = output.replace(
      '</head>',
      `<meta property="article:published_time" content="${escapeHtml(article.published_at)}" />\n</head>`,
    );
  }

  return output;
}

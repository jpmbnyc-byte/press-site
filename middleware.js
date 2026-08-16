import { createClient } from '@base44/sdk';

const SITE_URL = 'https://www.humanweather.press';

export const config = {
  matcher: ['/journal/:slug'],
  runtime: 'nodejs',
};

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function replaceTag(html, pattern, replacement) {
  return pattern.test(html)
    ? html.replace(pattern, replacement)
    : html.replace('</head>', `${replacement}\n</head>`);
}

function essayOgUrl(article) {
  return `${SITE_URL}/og/${encodeURIComponent(article.slug)}`;
}

function applyEssayHead(html, article) {
  const essayName = article.title || 'Essay';
  const seriesName = article.series_label || 'Human Weather';
  const title = `${essayName} — ${seriesName} | Human Weather`;
  const description =
    article.excerpt ||
    article.subtitle ||
    `An essay from ${seriesName} by ${article.author_name || 'JP Bobo'}.`;
  const canonical = `${SITE_URL}/journal/${encodeURIComponent(article.slug)}`;
  const image = essayOgUrl(article);
  const imageAlt = `${essayName} — ${seriesName}`;

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
  output = replaceTag(output, /<meta\s+property="og:image:type"\s+content="[^"]*"\s*\/?>/i, '<meta property="og:image:type" content="image/png" />');
  output = replaceTag(output, /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image:alt" content="${values.imageAlt}" />`);
  output = replaceTag(output, /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${values.title}" />`);
  output = replaceTag(output, /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${values.description}" />`);
  output = replaceTag(output, /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${values.image}" />`);
  output = replaceTag(output, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${values.canonical}" />`);

  if (article.published_at) {
    output = output.replace('</head>', `<meta property="article:published_time" content="${escapeHtml(article.published_at)}" />\n</head>`);
  }

  return output;
}

async function getPublicArticle(slug) {
  const appId = process.env.VITE_BASE44_APP_ID;
  if (!appId) return null;

  const base44 = createClient({
    appId,
    serverUrl: process.env.VITE_BASE44_APP_BASE_URL || 'https://humanweather.base44.app',
  });

  try {
    const matches = await base44.entities.Article.filter({ slug });
    const rows = Array.isArray(matches) ? matches : [];
    return rows.find((article) => article.status === 'published' || article.status === 'featured') || null;
  } finally {
    base44.cleanup?.();
  }
}

export default async function middleware(request) {
  const url = new URL(request.url);

  if (url.hostname === 'humanweather.press' || url.hostname === 'humanweather.vercel.app') {
    return Response.redirect(`${SITE_URL}${url.pathname}${url.search}`, 308);
  }

  const slug = decodeURIComponent(url.pathname.replace(/^\/journal\//, '')).trim();
  const shellResponse = await fetch(new URL('/index.html', request.url), {
    headers: { 'user-agent': request.headers.get('user-agent') || 'HumanWeather-Metadata' },
  });

  if (!shellResponse.ok || !slug) return shellResponse;

  let html = await shellResponse.text();

  try {
    const article = await getPublicArticle(slug);
    if (article) html = applyEssayHead(html, article);
  } catch (error) {
    console.error('[press metadata middleware]', error);
  }

  const headers = new Headers(shellResponse.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'public, s-maxage=300, stale-while-revalidate=86400');
  headers.delete('content-length');

  return new Response(html, { status: shellResponse.status, headers });
}

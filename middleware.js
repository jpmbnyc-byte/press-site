/**
 * Edge middleware: social crawlers hitting /journal/:slug get HTML with
 * essay-specific Open Graph tags (hero image + title/excerpt).
 * Humans still receive the SPA via vercel.json rewrites.
 * Home (/) keeps the static og-share.jpg from index.html.
 */

const SITE = 'https://www.humanweather.press';
const APP_ID = '6a57ce138c2f29923fec6bc4';
const BASE44 = 'https://humanweather.base44.app';

const BOT_RE =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|TelegramBot|SkypeUriPreview|Googlebot|bingbot|Applebot|Pinterest|redditbot|Embedly|Quora Link Preview|BitlyBot|Outbrain|vkShare|W3C_Validator|developers\.google\.com\/\+\/web\/snippet|InstantMessage|Slack-ImgProxy|TwitterBot|LinkedInBot|Baiduspider|DuckDuckBot|YandexBot|ia_archiver|preview|crawler|spider|bot/i;

export const config = {
  matcher: ['/journal/:slug*'],
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function absoluteUrl(url) {
  if (!url) return `${SITE}/og-share.jpg`;
  // Prefer .press host when assets were previously stored on the Vercel hostname.
  const normalized = String(url).replace(
    /^https?:\/\/humanweather\.vercel\.app/i,
    SITE,
  );
  if (/^https?:\/\//i.test(normalized)) return normalized;
  return `${SITE}${normalized.startsWith('/') ? '' : '/'}${normalized}`;
}

async function fetchArticleBySlug(slug) {
  const res = await fetch(`${BASE44}/api/entities/Article`, {
    headers: { 'X-App-Id': APP_ID },
  });
  if (!res.ok) return null;
  const articles = await res.json();
  if (!Array.isArray(articles)) return null;
  return articles.find((a) => a.slug === slug) || null;
}

function essayShareHtml(article, slug) {
  const essayName = article.subtitle || article.title || 'Essay';
  const series = article.series_label || 'Human Weather';
  const title = `${essayName} — ${series} | Human Weather`;
  const description =
    article.excerpt ||
    article.subtitle ||
    `An essay from ${series} by ${article.author_name || 'JP Bobo'}.`;
  const image = absoluteUrl(article.hero_image_url);
  const imageAlt = article.hero_image_alt || essayName;
  const url = `${SITE}/journal/${slug}`;
  const e = escapeHtml;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${e(title)}</title>
  <meta name="description" content="${e(description)}" />
  <link rel="canonical" href="${e(url)}" />

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Human Weather" />
  <meta property="og:url" content="${e(url)}" />
  <meta property="og:title" content="${e(title)}" />
  <meta property="og:description" content="${e(description)}" />
  <meta property="og:image" content="${e(image)}" />
  <meta property="og:image:alt" content="${e(imageAlt)}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${e(title)}" />
  <meta name="twitter:description" content="${e(description)}" />
  <meta name="twitter:image" content="${e(image)}" />
</head>
<body>
  <article>
    <h1><a href="${e(url)}">${e(essayName)}</a></h1>
    <p>${e(series)} · ${e(article.author_name || 'JP Bobo')}</p>
    <p>${e(description)}</p>
    <p><img src="${e(image)}" alt="${e(imageAlt)}" width="1200" /></p>
  </article>
</body>
</html>`;
}

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_RE.test(ua)) {
    return;
  }

  const { pathname } = new URL(request.url);
  const match = pathname.match(/^\/journal\/([^/]+)\/?$/);
  if (!match) return;

  const slug = decodeURIComponent(match[1]);
  try {
    const article = await fetchArticleBySlug(slug);
    if (!article) return;

    return new Response(essayShareHtml(article, slug), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, s-maxage=300, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('[middleware] essay OG', err);
    return;
  }
}

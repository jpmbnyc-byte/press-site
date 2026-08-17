import { deflateSync } from 'node:zlib';
import { createClient } from '@base44/sdk';
import { getEditorialImage } from './src/lib/editorialImages.js';

const SITE_URL = 'https://www.humanweather.press';
const WIDTH = 1200;
const HEIGHT = 630;
const PAPER = [252, 252, 250];
const BLACK = [10, 10, 10];
const MUTED = [110, 110, 104];
const RULE = [216, 216, 210];

const SERIES_SYSTEM = {
  'relational faith': { order: 1, color: '#1D3FBF' },
  'on bliss': { order: 2, color: '#E0A21A' },
  'the procession': { order: 3, color: '#8C2F1E' },
  'no parade': { order: 4, color: '#38434D' },
  'song of circumstance': { order: 5, color: '#0E6B5A' },
  'sunrise protocol': { order: 6, color: '#E23A17' },
  'human weather': { order: 7, color: '#0A0A0A' },
};

const FONT = {
  A:['01110','10001','10001','11111','10001','10001','10001'], B:['11110','10001','10001','11110','10001','10001','11110'],
  C:['01111','10000','10000','10000','10000','10000','01111'], D:['11110','10001','10001','10001','10001','10001','11110'],
  E:['11111','10000','10000','11110','10000','10000','11111'], F:['11111','10000','10000','11110','10000','10000','10000'],
  G:['01111','10000','10000','10111','10001','10001','01111'], H:['10001','10001','10001','11111','10001','10001','10001'],
  I:['11111','00100','00100','00100','00100','00100','11111'], J:['00111','00010','00010','00010','10010','10010','01100'],
  K:['10001','10010','10100','11000','10100','10010','10001'], L:['10000','10000','10000','10000','10000','10000','11111'],
  M:['10001','11011','10101','10101','10001','10001','10001'], N:['10001','11001','10101','10011','10001','10001','10001'],
  O:['01110','10001','10001','10001','10001','10001','01110'], P:['11110','10001','10001','11110','10000','10000','10000'],
  Q:['01110','10001','10001','10001','10101','10010','01101'], R:['11110','10001','10001','11110','10100','10010','10001'],
  S:['01111','10000','10000','01110','00001','00001','11110'], T:['11111','00100','00100','00100','00100','00100','00100'],
  U:['10001','10001','10001','10001','10001','10001','01110'], V:['10001','10001','10001','10001','10001','01010','00100'],
  W:['10001','10001','10001','10101','10101','10101','01010'], X:['10001','10001','01010','00100','01010','10001','10001'],
  Y:['10001','10001','01010','00100','00100','00100','00100'], Z:['11111','00001','00010','00100','01000','10000','11111'],
  '0':['01110','10001','10011','10101','11001','10001','01110'], '1':['00100','01100','00100','00100','00100','00100','01110'],
  '2':['01110','10001','00001','00010','00100','01000','11111'], '3':['11110','00001','00001','01110','00001','00001','11110'],
  '4':['00010','00110','01010','10010','11111','00010','00010'], '5':['11111','10000','10000','11110','00001','00001','11110'],
  '6':['01110','10000','10000','11110','10001','10001','01110'], '7':['11111','00001','00010','00100','01000','01000','01000'],
  '8':['01110','10001','10001','01110','10001','10001','01110'], '9':['01110','10001','10001','01111','00001','00001','01110'],
  '.':['00000','00000','00000','00000','00000','00110','00110'], ',':['00000','00000','00000','00000','00110','00110','00100'],
  ':':['00000','00110','00110','00000','00110','00110','00000'], ';':['00000','00110','00110','00000','00110','00110','00100'],
  '-':['00000','00000','00000','11111','00000','00000','00000'], '/':['00001','00010','00100','01000','10000','00000','00000'],
  '&':['01100','10010','10100','01000','10101','10010','01101'], "'":['00100','00100','00000','00000','00000','00000','00000'],
  '?':['01110','10001','00001','00010','00100','00000','00100'], '!':['00100','00100','00100','00100','00100','00000','00100'],
  '(':['00010','00100','01000','01000','01000','00100','00010'], ')':['01000','00100','00010','00010','00010','00100','01000'],
  ' ':['00000','00000','00000','00000','00000','00000','00000'], '·':['00000','00000','00100','00000','00000','00000','00000'],
};

export const config = {
  matcher: ['/journal/:slug', '/og/:slug'],
  runtime: 'nodejs',
};

function escapeHtml(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function replaceTag(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace('</head>', `${replacement}\n</head>`);
}

function hexRgb(hex) {
  const value = String(hex || '#0A0A0A').replace('#', '');
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16) || 0);
}

function seriesSystem(seriesName = '') {
  return SERIES_SYSTEM[String(seriesName).trim().toLowerCase()] || { order: 0, color: '#0A0A0A' };
}

function cleanText(value = '') {
  return String(value)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[—–]/g, '-')
    .replace(/[^A-Za-z0-9 .,:;\-\/&'!?()·]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanStandfirst(article) {
  const value = cleanText(article.subtitle || article.excerpt || '');
  return value.length <= 145 ? value : `${value.slice(0, 142).trimEnd()}...`;
}

function wrap(text, maxChars, maxLines) {
  const words = cleanText(text).toUpperCase().split(' ').filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= maxChars || !line) {
      line = next;
      continue;
    }
    lines.push(line);
    line = word;
    if (lines.length === maxLines - 1) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  const used = lines.join(' ').split(' ').filter(Boolean).length;
  if (used < words.length && lines.length) {
    const i = lines.length - 1;
    lines[i] = `${lines[i].slice(0, Math.max(1, maxChars - 3)).trimEnd()}...`;
  }
  return lines;
}

function setPixel(pixels, x, y, color) {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
  const index = (y * WIDTH + x) * 3;
  pixels[index] = color[0];
  pixels[index + 1] = color[1];
  pixels[index + 2] = color[2];
}

function fillRect(pixels, x, y, width, height, color) {
  const x0 = Math.max(0, x);
  const y0 = Math.max(0, y);
  const x1 = Math.min(WIDTH, x + width);
  const y1 = Math.min(HEIGHT, y + height);
  for (let py = y0; py < y1; py += 1) {
    for (let px = x0; px < x1; px += 1) setPixel(pixels, px, py, color);
  }
}

function drawText(pixels, text, x, y, scale, color, spacing = 1) {
  let cursor = x;
  for (const raw of String(text).toUpperCase()) {
    const glyph = FONT[raw] || FONT['?'];
    for (let gy = 0; gy < 7; gy += 1) {
      for (let gx = 0; gx < 5; gx += 1) {
        if (glyph[gy][gx] === '1') fillRect(pixels, cursor + gx * scale, y + gy * scale, scale, scale, color);
      }
    }
    cursor += (5 + spacing) * scale;
  }
  return cursor;
}

function textWidth(text, scale, spacing = 1) {
  return Math.max(0, String(text).length * (5 + spacing) * scale - spacing * scale);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuffer, data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

function encodePng(pixels) {
  const raw = Buffer.alloc((WIDTH * 3 + 1) * HEIGHT);
  const rowSize = WIDTH * 3 + 1;
  for (let y = 0; y < HEIGHT; y += 1) {
    const rawOffset = y * rowSize;
    raw[rawOffset] = 0;
    pixels.copy(raw, rawOffset + 1, y * WIDTH * 3, (y + 1) * WIDTH * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(WIDTH, 0);
  ihdr.writeUInt32BE(HEIGHT, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const signature = Buffer.from([137,80,78,71,13,10,26,10]);
  return Buffer.concat([signature, pngChunk('IHDR', ihdr), pngChunk('IDAT', deflateSync(raw, { level: 9 })), pngChunk('IEND', Buffer.alloc(0))]);
}

function renderEssayPng(article, series) {
  const pixels = Buffer.alloc(WIDTH * HEIGHT * 3);
  for (let i = 0; i < pixels.length; i += 3) {
    pixels[i] = PAPER[0]; pixels[i + 1] = PAPER[1]; pixels[i + 2] = PAPER[2];
  }

  const seriesName = article.series_label || series?.name || 'Human Weather';
  const system = seriesSystem(seriesName);
  const accent = hexRgb(system.color);
  const seriesOrder = Number(series?.sort_order) || system.order || null;
  const essayOrder = Number(article.series_order) || 1;
  const total = Number(series?.total_essays) || null;
  const coordinate = `${seriesOrder ? `S${String(seriesOrder).padStart(2, '0')} · ` : ''}E${String(essayOrder).padStart(2, '0')}${total ? `/${String(total).padStart(2, '0')}` : ''}`;

  fillRect(pixels, 0, 0, 48, HEIGHT, accent);
  drawText(pixels, coordinate, 104, 66, 3, accent);

  const title = cleanText(article.title || 'Human Weather');
  const titleScale = title.length > 48 ? 8 : title.length > 34 ? 9 : 10;
  const titleLines = wrap(title, titleScale === 10 ? 17 : titleScale === 9 ? 20 : 23, 2);
  let y = 150;
  for (const line of titleLines) {
    drawText(pixels, line, 104, y, titleScale, BLACK);
    y += titleScale * 9;
  }

  const ruleY = Math.max(345, y + 18);
  fillRect(pixels, 104, ruleY, 1006, 2, RULE);

  const standfirst = cleanStandfirst(article);
  if (standfirst) {
    const standLines = wrap(standfirst, 45, 3);
    let standY = ruleY + 34;
    for (const line of standLines) {
      drawText(pixels, line, 104, standY, 4, MUTED);
      standY += 39;
    }
  }

  fillRect(pixels, 104, 548, 1006, 1, RULE);
  drawText(pixels, 'HUMANWEATHER.PRESS', 104, 574, 3, BLACK);
  const footerSeries = cleanText(seriesName).toUpperCase();
  const footerWidth = textWidth(footerSeries, 3);
  drawText(pixels, footerSeries, Math.max(650, 1110 - footerWidth), 574, 3, MUTED);

  return encodePng(pixels);
}

function articleHero(article) {
  const editorialImage = getEditorialImage(article);
  if (!editorialImage?.src) return null;
  return {
    url: new URL(editorialImage.src, `${SITE_URL}/`).toString(),
    alt: editorialImage.alt || '',
  };
}

function applyEssayHead(html, article) {
  const essayName = article.title || 'Essay';
  const series = article.series_label || 'Human Weather';
  const title = `${essayName} — ${series} | Human Weather`;
  const description = article.excerpt || article.subtitle || `An essay from ${series} by ${article.author_name || 'JP Bobo'}.`;
  const canonical = `${SITE_URL}/journal/${encodeURIComponent(article.slug)}`;
  const hero = articleHero(article);
  const image = hero?.url || `${SITE_URL}/og/${encodeURIComponent(article.slug)}`;
  const imageAlt = hero?.alt || `${essayName} — ${series}`;

  const values = { title: escapeHtml(title), description: escapeHtml(description), canonical: escapeHtml(canonical), image: escapeHtml(image), imageAlt: escapeHtml(imageAlt) };
  let output = html;
  output = replaceTag(output, /<title>[^<]*<\/title>/i, `<title>${values.title}</title>`);
  output = replaceTag(output, /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${values.description}" />`);
  output = replaceTag(output, /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, '<meta property="og:type" content="article" />');
  output = replaceTag(output, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${values.canonical}" />`);
  output = replaceTag(output, /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${values.title}" />`);
  output = replaceTag(output, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${values.description}" />`);
  output = replaceTag(output, /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${values.image}" />`);
  if (hero) {
    output = output.replace(/<meta\s+property="og:image:type"\s+content="[^"]*"\s*\/?>/i, '');
  } else {
    output = replaceTag(output, /<meta\s+property="og:image:type"\s+content="[^"]*"\s*\/?>/i, '<meta property="og:image:type" content="image/png" />');
  }
  output = replaceTag(output, /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image:alt" content="${values.imageAlt}" />`);
  output = replaceTag(output, /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${values.title}" />`);
  output = replaceTag(output, /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${values.description}" />`);
  output = replaceTag(output, /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${values.image}" />`);
  output = replaceTag(output, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${values.canonical}" />`);
  if (article.published_at) output = output.replace('</head>', `<meta property="article:published_time" content="${escapeHtml(article.published_at)}" />\n</head>`);
  return output;
}

async function getPublicArticleData(slug) {
  const appId = process.env.VITE_BASE44_APP_ID;
  if (!appId) return null;
  const base44 = createClient({ appId, serverUrl: process.env.VITE_BASE44_APP_BASE_URL || 'https://humanweather.base44.app' });
  try {
    const matches = await base44.entities.Article.filter({ slug });
    const rows = Array.isArray(matches) ? matches : [];
    const article = rows.find((item) => item.status === 'published' || item.status === 'featured');
    if (!article) return null;
    const seriesRows = await base44.entities.Series.list('sort_order', 100).catch(() => []);
    const seriesList = Array.isArray(seriesRows) ? seriesRows : [];
    const series = seriesList.find((item) =>
      (article.series_id && item.id === article.series_id) ||
      (article.series_slug && item.slug === article.series_slug) ||
      (article.series_label && item.name === article.series_label),
    );
    return { article, series };
  } finally {
    base44.cleanup?.();
  }
}

export default async function middleware(request) {
  const url = new URL(request.url);
  if (url.hostname === 'humanweather.press' || url.hostname === 'humanweather.vercel.app') return Response.redirect(`${SITE_URL}${url.pathname}${url.search}`, 308);

  const isOg = url.pathname.startsWith('/og/');
  const slug = decodeURIComponent(url.pathname.replace(isOg ? /^\/og\// : /^\/journal\//, '')).trim();
  if (!slug) return new Response('Not found', { status: 404 });

  try {
    const data = await getPublicArticleData(slug);
    if (isOg) {
      if (!data?.article) return new Response('Essay not found', { status: 404 });
      const hero = articleHero(data.article);
      if (hero?.url) return Response.redirect(hero.url, 307);
      const png = renderEssayPng(data.article, data.series);
      return new Response(png, { headers: { 'content-type': 'image/png', 'cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800' } });
    }

    const shellResponse = await fetch(new URL('/index.html', request.url), { headers: { 'user-agent': request.headers.get('user-agent') || 'HumanWeather-Metadata' } });
    if (!shellResponse.ok) return shellResponse;
    let html = await shellResponse.text();
    if (data?.article) html = applyEssayHead(html, data.article);
    const headers = new Headers(shellResponse.headers);
    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'public, s-maxage=300, stale-while-revalidate=86400');
    for (const header of ['content-encoding', 'content-length', 'transfer-encoding', 'etag', 'content-md5', 'content-digest', 'digest']) {
      headers.delete(header);
    }
    return new Response(html, { status: shellResponse.status, headers });
  } catch (error) {
    console.error('[press metadata middleware]', error);
    if (isOg) return new Response('Unable to render essay card', { status: 500 });
    return fetch(new URL('/index.html', request.url), { headers: { 'user-agent': request.headers.get('user-agent') || 'HumanWeather-Metadata' } });
  }
}
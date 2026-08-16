import React from 'react';
import { createClient } from '@base44/sdk';
import { ImageResponse } from '@vercel/og';

const PAPER = '#FCFCFA';
const INK = '#0A0A0A';
const MUTED = '#6E6E68';

const SERIES_SYSTEM = {
  'relational faith': { order: 1, color: '#1D3FBF' },
  'on bliss': { order: 2, color: '#E0A21A' },
  'the procession': { order: 3, color: '#8C2F1E' },
  'no parade': { order: 4, color: '#38434D' },
  'song of circumstance': { order: 5, color: '#0E6B5A' },
  'sunrise protocol': { order: 6, color: '#E23A17' },
  'human weather': { order: 7, color: '#0A0A0A' },
};

function cleanStandfirst(article) {
  const value = String(article.subtitle || article.excerpt || '').replace(/\s+/g, ' ').trim();
  return value.length <= 150 ? value : `${value.slice(0, 147).trimEnd()}…`;
}

function seriesSystem(seriesName = '') {
  return SERIES_SYSTEM[String(seriesName).trim().toLowerCase()] || { order: 0, color: INK };
}

function titleSize(title) {
  if (title.length > 48) return 54;
  if (title.length > 34) return 62;
  return 72;
}

async function getPublicArticleData(slug) {
  const appId = process.env.VITE_BASE44_APP_ID;
  if (!appId) return null;

  const base44 = createClient({
    appId,
    serverUrl: process.env.VITE_BASE44_APP_BASE_URL || 'https://humanweather.base44.app',
  });

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

export default async function handler(request) {
  const url = new URL(request.url);
  const slug = String(url.searchParams.get('slug') || '').trim();
  if (!slug) return new Response('slug is required', { status: 400 });

  const data = await getPublicArticleData(slug);
  if (!data?.article) return new Response('Essay not found', { status: 404 });

  const { article, series } = data;
  const seriesName = article.series_label || series?.name || 'Human Weather';
  const system = seriesSystem(seriesName);
  const seriesOrder = Number(series?.sort_order) || system.order || null;
  const essayOrder = Number(article.series_order) || 1;
  const essayTotal = Number(series?.total_essays) || null;
  const coordinate = `${seriesOrder ? `S${String(seriesOrder).padStart(2, '0')} · ` : ''}E${String(essayOrder).padStart(2, '0')}${essayTotal ? `/${String(essayTotal).padStart(2, '0')}` : ''}`;
  const title = article.title || 'Human Weather';
  const standfirst = cleanStandfirst(article);

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', background: PAPER, color: INK, fontFamily: 'sans-serif' }}>
      <div style={{ width: 48, height: '100%', background: system.color, display: 'flex' }} />
      <div style={{ flex: 1, height: '100%', padding: '58px 68px 52px 64px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 20, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 52 }}>
          {coordinate}
        </div>
        <div style={{ display: 'flex', fontSize: titleSize(title), lineHeight: 1.02, letterSpacing: '-0.035em', maxWidth: 920, marginBottom: 28 }}>
          {title}
        </div>
        {standfirst ? (
          <div style={{ display: 'flex', fontSize: 30, lineHeight: 1.24, color: MUTED, maxWidth: 880 }}>
            {standfirst}
          </div>
        ) : null}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #D8D8D2', paddingTop: 18, fontSize: 17, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          <div style={{ display: 'flex' }}>HUMANWEATHER.PRESS</div>
          <div style={{ display: 'flex', color: MUTED }}>{seriesName}</div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  );
}

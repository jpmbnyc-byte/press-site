import { createClient } from '@base44/sdk';
import fs from 'node:fs';
import path from 'node:path';

const APP_ID = process.env.VITE_BASE44_APP_ID || '6a57ce138c2f29923fec6bc4';
const SERVER_URL = process.env.VITE_BASE44_APP_BASE_URL || 'https://humanweather.base44.app';
const TOKEN = process.env.BASE44_ACCESS_TOKEN;
const CONTENT_DIR = path.resolve('content/essays');

if (!TOKEN) {
  console.error('BASE44_ACCESS_TOKEN is not set.');
  process.exit(1);
}

const base44 = createClient({
  appId: APP_ID,
  token: TOKEN,
  serverUrl: SERVER_URL,
  appBaseUrl: SERVER_URL,
  requiresAuth: false,
});

async function resolveSeries(seriesInput) {
  if (!seriesInput) return null;

  const allSeries = await base44.entities.Series.list('sort_order', 50);

  if (seriesInput.slug) {
    const found = allSeries.find(s => s.slug === seriesInput.slug);
    if (!found) {
      throw new Error(`Series with slug "${seriesInput.slug}" not found. Create it via seriesInput.new instead.`);
    }
    return found;
  }

  if (seriesInput.new) {
    const existing = allSeries.find(s => s.slug === seriesInput.new.slug);
    if (existing) return existing;
    const created = await base44.entities.Series.create({
      is_active: true,
      access_level: 'free_first',
      ...seriesInput.new,
    });
    console.log(`Created new series: ${created.name} (${created.slug})`);
    return created;
  }

  throw new Error('series must specify either { slug } or { new: {...} }');
}

async function publishOne(filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const { series, ...articleFields } = raw;

  if (!articleFields.title || !articleFields.slug) {
    throw new Error(`${filePath}: title and slug are required`);
  }

  const seriesRecord = await resolveSeries(series);

  const payload = {
    status: 'draft',
    access_level: 'free',
    ...articleFields,
    ...(seriesRecord
      ? {
          series_id: seriesRecord.id,
          series_label: seriesRecord.name,
          series_slug: seriesRecord.slug,
        }
      : {}),
  };

  const existingArticles = await base44.entities.Article.list('-published_at', 200);
  const existing = existingArticles.find(a => a.slug === payload.slug);

  if (existing) {
    await base44.entities.Article.update(existing.id, payload);
    console.log(`Updated article: ${payload.title} (${payload.slug})`);
  } else {
    await base44.entities.Article.create(payload);
    console.log(`Created article: ${payload.title} (${payload.slug})`);
  }
}

async function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.log(`No ${CONTENT_DIR} directory found; nothing to publish.`);
    return;
  }

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(CONTENT_DIR, f));

  if (files.length === 0) {
    console.log('No essay JSON files found; nothing to publish.');
    return;
  }

  for (const file of files) {
    await publishOne(file);
  }
}

main().catch(err => {
  console.error('[publish-essay] failed:', err?.message || 'unknown error');
  process.exit(1);
});

import { createClient } from '@base44/sdk';

const c = createClient({
  appId: '6a57ce138c2f29923fec6bc4',
  requiresAuth: false,
  serverUrl: 'https://base44.app',
});

console.log('config', c.getConfig());
const series = await c.entities.Series.list('sort_order', 10);
console.log('series', series.length, series.map((s) => s.name).join(', '));
const articles = await c.entities.Article.list('-published_at', 50);
const live = articles.filter((a) => a.status === 'published' || a.status === 'featured');
console.log('articles', articles.length, 'live', live.length);
console.log(live.map((a) => `${a.status}:${a.slug}`).join('\n'));

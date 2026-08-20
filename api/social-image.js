import { articleHero, getPublicArticle } from '../server/socialShare.js';

function firstQuery(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(request, response) {
  response.setHeader('X-HW-Social-Route', 'image');
  const slug = String(firstQuery(request.query?.slug) || '').trim();
  if (!slug) {
    response.status(400).send('Missing essay slug');
    return;
  }

  try {
    const article = await getPublicArticle(slug);
    if (!article) {
      response.status(404).send('Essay not found');
      return;
    }

    const hero = articleHero(article);
    if (!hero?.url) {
      response.status(404).send('Essay image not found');
      return;
    }

    const upstream = await fetch(hero.url, {
      redirect: 'follow',
      headers: {
        accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
        'user-agent': request.headers['user-agent'] || 'HumanWeather-SocialImage',
      },
    });

    const contentType = upstream.headers.get('content-type') || '';
    if (!upstream.ok || !contentType.toLowerCase().startsWith('image/')) {
      response.redirect(302, hero.url);
      return;
    }

    const bytes = Buffer.from(await upstream.arrayBuffer());
    response.setHeader('Content-Type', contentType);
    response.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=31536000, immutable');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.status(200).send(bytes);
  } catch (error) {
    console.error('[social image]', error);
    response.status(500).send('Unable to render essay image');
  }
}

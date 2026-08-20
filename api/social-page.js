import { applyArticleMeta, getPublicArticle } from '../server/socialShare.js';

function firstQuery(value) {
  return Array.isArray(value) ? value[0] : value;
}

function shellOrigin(request) {
  const protoHeader = firstQuery(request.headers['x-forwarded-proto']) || 'https';
  const hostHeader = firstQuery(request.headers['x-forwarded-host']) || request.headers.host || 'www.humanweather.press';
  const proto = String(protoHeader).split(',')[0].trim();
  const host = String(hostHeader).split(',')[0].trim();
  return `${proto}://${host}`;
}

export default async function handler(request, response) {
  const slug = String(firstQuery(request.query?.slug) || '').trim();
  if (!slug) {
    response.status(400).send('Missing essay slug');
    return;
  }

  try {
    const shellResponse = await fetch(`${shellOrigin(request)}/index.html`, {
      headers: {
        'user-agent': request.headers['user-agent'] || 'HumanWeather-SocialPreview',
      },
    });

    if (!shellResponse.ok) {
      response.status(shellResponse.status).send(await shellResponse.text());
      return;
    }

    const shell = await shellResponse.text();
    const article = await getPublicArticle(slug);
    const html = article ? applyArticleMeta(shell, article) : shell;

    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    response.status(200).send(html);
  } catch (error) {
    console.error('[social page]', error);
    response.status(500).send('Unable to render essay preview');
  }
}

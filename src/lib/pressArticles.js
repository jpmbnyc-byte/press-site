import { base44 } from '@/api/base44Client';
import {
  hasPressAccess,
  previewMembersBody,
  previewMembersBodyByMinutes,
  WATERS_EDGE_SLUG,
  WATERS_EDGE_PREVIEW_MINUTES,
} from '@/lib/membership';

function isLive(article) {
  return article?.status === 'published' || article?.status === 'featured';
}

function buildPreviewBody(article) {
  const body = article?.body_md || '';
  if (article?.slug === WATERS_EDGE_SLUG) {
    return previewMembersBodyByMinutes(body, {
      minutes: WATERS_EDGE_PREVIEW_MINUTES,
      readingTimeMins: article.reading_time_mins,
    });
  }
  return previewMembersBody(body);
}

/** Mirror server gateArticleForReader for the entity fallback path. */
export function gateArticleForReader(article, user) {
  if (!article) return null;
  const access = String(article.access_level || 'free');
  const entitled = access !== 'members' || hasPressAccess(user);
  const fullBody = String(article.body_md || '');

  if (entitled) {
    return {
      ...article,
      body_md: fullBody,
      body_gated: false,
      can_read_full: true,
    };
  }

  return {
    ...article,
    body_md: buildPreviewBody(article),
    body_gated: true,
    can_read_full: false,
  };
}

function publicArticleCard(article) {
  const rest = { ...article };
  delete rest.body_md;
  return { ...rest, has_full_body: false };
}

async function fetchViaFunction(slug) {
  const res = await base44.functions.invoke('getPressArticle', { slug });
  const data = res?.data || res;
  if (data?.error) {
    const err = new Error(data.error);
    err.code = data.code || 'function_error';
    throw err;
  }
  if (!data?.article) {
    const err = new Error('Essay not found');
    err.code = 'not_found';
    throw err;
  }
  return data;
}

async function fetchViaEntities(slug, user) {
  const all = await base44.entities.Article.list('-published_at', 200);
  const articles = Array.isArray(all) ? all : [];
  const found = articles.find(a => a.slug === slug && isLive(a));
  if (!found) {
    const err = new Error('Essay not found');
    err.code = 'not_found';
    throw err;
  }

  const related = articles
    .filter(a => isLive(a) && a.series_label === found.series_label && a.id !== found.id)
    .map(publicArticleCard);

  return {
    article: gateArticleForReader(found, user),
    related,
    source: 'entities',
  };
}

/**
 * Load a published/featured essay with body gating.
 *
 * Prefers Base44 function `getPressArticle` when the plan allows backend
 * functions. Falls back to the public entity API + client-side gating when
 * functions are blocked (402) or unavailable — common on this app today.
 */
export async function fetchPressArticle(slug, user = null) {
  if (!slug) throw new Error('slug is required');

  try {
    const data = await fetchViaFunction(slug);
    return { ...data, source: 'function' };
  } catch (err) {
    // Function missing / plan blocked / network — use entities.
    // Still rethrow true not-found from the function so we don't double-fetch.
    if (err?.code === 'not_found') throw err;
    console.warn('[fetchPressArticle] function unavailable, using entities', err?.message || err);
    return fetchViaEntities(slug, user);
  }
}

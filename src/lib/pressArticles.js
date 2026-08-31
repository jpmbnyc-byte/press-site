import { base44 } from '@/api/base44Client';
import {
  hasPressAccess,
  previewMembersBody,
  previewMembersBodyByMinutes,
  WATERS_EDGE_SLUG,
  WATERS_EDGE_PREVIEW_MINUTES,
} from '@/lib/membership';
import { formatPublicationDate } from '@/lib/editorial';

function isLive(article) {
  return article?.status === 'published' || article?.status === 'featured';
}

function withEditorialDate(article) {
  if (!article) return article;
  return {
    ...article,
    published_at: formatPublicationDate(article.published_at) || article.published_at,
  };
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
  const prepared = withEditorialDate(article);

  if (entitled) {
    return {
      ...prepared,
      body_md: fullBody,
      body_gated: false,
      can_read_full: true,
    };
  }

  return {
    ...prepared,
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
  return {
    ...data,
    article: withEditorialDate(data.article),
  };
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

function entitledReaderReceivedGatedFunctionResponse(data, user) {
  const article = data?.article;
  if (!article || !hasPressAccess(user)) return false;
  if (String(article.access_level || 'free') !== 'members') return false;

  // The local authenticated reader is entitled, but the backend function can
  // occasionally resolve a different/anonymous session and return a preview.
  // Treat anything short of an explicit full-body grant as a mismatch and
  // re-run the existing entity path, which applies the same entitlement helper.
  return article.can_read_full !== true || article.body_gated === true;
}

/**
 * Load a published/featured essay with body gating.
 *
 * Prefers Base44 function `getPressArticle` when the plan allows backend
 * functions. Falls back to the public entity API + client-side gating when
 * functions are blocked (402), unavailable, or return a gated preview for a
 * reader who the local authenticated session already identifies as entitled.
 */
export async function fetchPressArticle(slug, user = null) {
  if (!slug) throw new Error('slug is required');

  try {
    const data = await fetchViaFunction(slug);

    if (entitledReaderReceivedGatedFunctionResponse(data, user)) {
      console.warn('[fetchPressArticle] entitled reader received gated function response; using entities');
      return fetchViaEntities(slug, user);
    }

    return { ...data, source: 'function' };
  } catch (err) {
    // Function missing / plan blocked / network — use entities.
    // Still rethrow true not-found from the function so we don't double-fetch.
    if (err?.code === 'not_found') throw err;
    console.warn('[fetchPressArticle] function unavailable, using entities', err?.message || err);
    return fetchViaEntities(slug, user);
  }
}

/** Server-side article body preview / entitlement helpers (Deno). */

export const WATERS_EDGE_SLUG = "relational-faith-the-mirror-at-the-waters-edge";
export const WATERS_EDGE_PREVIEW_MINUTES = 3;
const DEFAULT_WORDS_PER_MINUTE = 200;

function countWords(text = "") {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function hasPressAccess(user: Record<string, unknown> | null | undefined): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  const status = user.membership_status;
  return status === "active" || status === "trialing";
}

export function previewMembersBody(bodyMd = "", maxParagraphs = 3): string {
  if (!bodyMd) return "";
  const parts = bodyMd.split(/\n\s*\n/);
  if (parts.length <= maxParagraphs) {
    const chars = bodyMd.slice(0, 900);
    return chars.length < bodyMd.length ? `${chars.trimEnd()}\n\n…` : bodyMd;
  }
  return `${parts.slice(0, maxParagraphs).join("\n\n").trimEnd()}\n\n…`;
}

export function previewMembersBodyByMinutes(
  bodyMd = "",
  {
    minutes = 3,
    readingTimeMins,
    wordsPerMinute = DEFAULT_WORDS_PER_MINUTE,
  }: {
    minutes?: number;
    readingTimeMins?: number | null;
    wordsPerMinute?: number;
  } = {},
): string {
  if (!bodyMd) return "";
  const totalWords = countWords(bodyMd);
  if (!totalWords) return "";

  const wpm =
    readingTimeMins && readingTimeMins > 0
      ? totalWords / readingTimeMins
      : wordsPerMinute;
  const wordLimit = Math.max(1, Math.round(wpm * minutes));

  if (totalWords <= wordLimit) return bodyMd;

  const parts = bodyMd.split(/\n\s*\n/);
  let used = 0;
  const kept: string[] = [];
  for (const part of parts) {
    const partWords = countWords(part);
    kept.push(part);
    used += partWords;
    if (used >= wordLimit) break;
  }

  if (!kept.length) {
    return `${bodyMd.trim().split(/\s+/).slice(0, wordLimit).join(" ")}\n\n…`;
  }
  return `${kept.join("\n\n").trimEnd()}\n\n…`;
}

export function buildPreviewBody(article: {
  slug?: string;
  body_md?: string;
  reading_time_mins?: number;
}): string {
  const body = article.body_md || "";
  if (article.slug === WATERS_EDGE_SLUG) {
    return previewMembersBodyByMinutes(body, {
      minutes: WATERS_EDGE_PREVIEW_MINUTES,
      readingTimeMins: article.reading_time_mins,
    });
  }
  return previewMembersBody(body);
}

/** Public list shape — never includes full members body. */
export function publicArticleCard(article: Record<string, unknown>) {
  const rest = { ...article };
  delete rest.body_md;
  return {
    ...rest,
    has_full_body: false,
  };
}

/**
 * Gate a single article for the current reader.
 * Members/free essays get full body; locked members essays get preview only.
 */
export function gateArticleForReader(
  article: Record<string, unknown>,
  user: Record<string, unknown> | null | undefined,
) {
  const access = String(article.access_level || "free");
  const entitled = access !== "members" || hasPressAccess(user);
  const fullBody = String(article.body_md || "");

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
    body_md: buildPreviewBody({
      slug: String(article.slug || ""),
      body_md: fullBody,
      reading_time_mins: Number(article.reading_time_mins) || undefined,
    }),
    body_gated: true,
    can_read_full: false,
  };
}

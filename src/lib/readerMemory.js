const STORAGE_KEY = 'hw-reader-memory-v1';
const SESSION_KEY = 'hw-reader-session-v1';
const MAX_ARTICLES = 120;

const emptyMemory = () => ({
  version: 1,
  firstSeenAt: null,
  lastSeenAt: null,
  articles: {},
});

function storageArea(kind) {
  if (typeof window === 'undefined') return null;
  try {
    return kind === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

function parse(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalize(raw) {
  const base = emptyMemory();
  if (!raw || typeof raw !== 'object') return base;
  const articles = raw.articles && typeof raw.articles === 'object' ? raw.articles : {};
  return {
    version: 1,
    firstSeenAt: raw.firstSeenAt || null,
    lastSeenAt: raw.lastSeenAt || null,
    articles,
  };
}

export function readReaderMemory() {
  const storage = storageArea('local');
  if (!storage) return emptyMemory();
  try {
    return normalize(parse(storage.getItem(STORAGE_KEY), emptyMemory()));
  } catch {
    return emptyMemory();
  }
}

function notify(memory) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('hw:reader-memory', { detail: memory }));
}

export function writeReaderMemory(next) {
  const memory = normalize(next);
  const storage = storageArea('local');
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(memory));
    } catch {
      // Reader memory is enhancement-only. Never block the publication on storage.
    }
  }
  notify(memory);
  return memory;
}

export function beginReaderSession() {
  const session = storageArea('session');
  const existing = session ? parse(session.getItem(SESSION_KEY), null) : null;
  const memory = readReaderMemory();

  if (existing?.startedAt) {
    return { memory, previousVisitAt: existing.previousVisitAt || null };
  }

  const now = new Date().toISOString();
  const previousVisitAt = memory.lastSeenAt || null;
  const next = writeReaderMemory({
    ...memory,
    firstSeenAt: memory.firstSeenAt || now,
    lastSeenAt: now,
  });

  if (session) {
    try {
      session.setItem(SESSION_KEY, JSON.stringify({ startedAt: now, previousVisitAt }));
    } catch {
      // Ignore session storage restrictions.
    }
  }

  return { memory: next, previousVisitAt };
}

function pruneArticles(articles) {
  const entries = Object.entries(articles).sort(
    ([, a], [, b]) => new Date(b?.lastReadAt || 0) - new Date(a?.lastReadAt || 0)
  );
  return Object.fromEntries(entries.slice(0, MAX_ARTICLES));
}

export function recordArticleVisit(slug) {
  if (!slug) return readReaderMemory();
  const memory = readReaderMemory();
  const now = new Date().toISOString();
  const previous = memory.articles?.[slug] || {};
  return writeReaderMemory({
    ...memory,
    articles: pruneArticles({
      ...memory.articles,
      [slug]: {
        ...previous,
        slug,
        firstReadAt: previous.firstReadAt || now,
        lastReadAt: now,
        progress: Number(previous.progress) || 0,
        completed: previous.completed === true,
      },
    }),
  });
}

export function recordArticleProgress(slug, value) {
  if (!slug || !Number.isFinite(value)) return readReaderMemory();
  const memory = readReaderMemory();
  const previous = memory.articles?.[slug] || { slug };
  const progress = Math.max(Number(previous.progress) || 0, Math.min(Math.max(value, 0), 1));
  const completed = previous.completed === true || progress >= 0.9;
  return writeReaderMemory({
    ...memory,
    articles: pruneArticles({
      ...memory.articles,
      [slug]: {
        ...previous,
        slug,
        lastReadAt: previous.lastReadAt || new Date().toISOString(),
        progress,
        completed,
      },
    }),
  });
}

export function readerArticleEntries(memory = readReaderMemory()) {
  return Object.values(memory.articles || {}).sort(
    (a, b) => new Date(b?.lastReadAt || 0) - new Date(a?.lastReadAt || 0)
  );
}

export function lastReaderArticle(memory = readReaderMemory()) {
  return readerArticleEntries(memory)[0] || null;
}

export function readArticleCount(memory = readReaderMemory()) {
  return readerArticleEntries(memory).length;
}

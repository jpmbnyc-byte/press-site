/** Public brand origin for canonical URLs and social shares. */
export const SITE_URL = 'https://www.humanweather.press';

export function absoluteUrl(path = '/') {
  if (!path) return `${SITE_URL}/`;
  const rewritten = String(path).replace(
    /^https?:\/\/humanweather\.vercel\.app/i,
    SITE_URL,
  );
  if (/^https?:\/\//i.test(rewritten)) return rewritten;
  return `${SITE_URL}${rewritten.startsWith('/') ? '' : '/'}${rewritten}`;
}

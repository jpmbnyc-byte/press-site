import { base44 } from '@/api/base44Client';

/**
 * Load a published/featured essay with server-side body gating.
 * Members essays return preview-only body_md unless the caller is entitled.
 */
export async function fetchPressArticle(slug) {
  if (!slug) throw new Error('slug is required');
  const res = await base44.functions.invoke('getPressArticle', { slug });
  const data = res?.data || res;
  if (data?.error) {
    const err = new Error(data.error);
    err.code = data.code;
    throw err;
  }
  if (!data?.article) {
    throw new Error('Essay not found');
  }
  return data;
}

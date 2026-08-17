import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SHARE_PREVIEW_VERSION = 'hero-20260817';

export default function EssayShareFreshnessLayer() {
  const location = useLocation();

  useEffect(() => {
    const match = String(location.pathname || '').match(/^\/journal\/([^/?#]+)/);
    if (!match || typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    if (url.searchParams.get('share') === SHARE_PREVIEW_VERSION) return;

    url.searchParams.set('share', SHARE_PREVIEW_VERSION);
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  }, [location.pathname]);

  return null;
}

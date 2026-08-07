import { useEffect, useState } from 'react';
import { SITE_URL } from '@/lib/site';

/**
 * Compact share row for free essays. Uses text links (no cards/pills)
 * so it sits quietly under the essay ornament.
 */
export default function EssayShareLinks({ article }) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  if (!article?.slug) return null;

  const url = `${SITE_URL}/journal/${article.slug}`;
  const title = article.subtitle || article.title || 'Human Weather';
  const shareText = `${title} — Human Weather Press`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(shareText);
  const encodedBody = encodeURIComponent(
    `${shareText}\n\n${article.excerpt ? `${article.excerpt}\n\n` : ''}${url}`,
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({
        title: shareText,
        text: article.excerpt || shareText,
        url,
      });
    } catch {
      // User cancelled or share unavailable — ignore.
    }
  };

  const linkClass =
    'text-[var(--hw-ink2)] hover:text-[var(--hw-gold)] transition-colors duration-300';

  return (
    <div className="mt-10 pt-8 border-t border-[rgba(154,125,46,0.18)] text-center">
      <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--hw-ink3)] mb-5">
        Share this essay
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 font-mono text-[10px] tracking-[0.2em] uppercase">
        <button type="button" onClick={copyLink} className={linkClass}>
          {copied ? 'Copied' : 'Copy link'}
        </button>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          X
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          LinkedIn
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Facebook
        </a>
        <a
          href={`mailto:?subject=${encodedTitle}&body=${encodedBody}`}
          className={linkClass}
        >
          Email
        </a>
        {canNativeShare && (
          <button type="button" onClick={nativeShare} className={linkClass}>
            Share…
          </button>
        )}
      </div>
    </div>
  );
}

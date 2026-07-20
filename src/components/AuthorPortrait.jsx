export const AUTHOR_PORTRAIT_SRC =
  '/jp-bobo.jpg';

export const AUTHOR_PORTRAIT_FALLBACK =
  'https://media.base44.com/images/public/6a57ce138c2f29923fec6bc4/500b00ca1_IMG_4897.jpeg';

/**
 * Minimal gold-circle author portrait for article bylines and author marks.
 */
export default function AuthorPortrait({ size = 'md', className = '', alt = 'JP Bobo' }) {
  const sizeClass =
    size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-16 h-16' : size === 'xl' ? 'w-24 h-24' : 'w-12 h-12';

  return (
    <span
      className={`inline-flex shrink-0 rounded-full p-[1px] bg-[var(--hw-gold)] ${className}`}
      aria-hidden={alt ? undefined : true}
    >
      <img
        src={AUTHOR_PORTRAIT_SRC}
        alt={alt}
        width={48}
        height={48}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          if (e.currentTarget.src !== AUTHOR_PORTRAIT_FALLBACK) {
            e.currentTarget.src = AUTHOR_PORTRAIT_FALLBACK;
          }
        }}
        className={`${sizeClass} rounded-full object-cover object-[center_18%] ring-offset-2 ring-offset-[var(--hw-bg)] bg-[var(--hw-surface)]`}
      />
    </span>
  );
}

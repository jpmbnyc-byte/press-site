import { getEditorialImage } from '@/lib/editorialImages';

export default function EssayThumbnail({
  article,
  compact = false,
  eager = false,
  className = 'mb-6',
}) {
  const image = getEditorialImage(article);
  if (!image) return null;

  return (
    <div
      className={`hw-essay-thumbnail${compact ? ' hw-essay-thumbnail--compact' : ''} ${className}`}
      aria-hidden="true"
    >
      <img
        src={image.src}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}

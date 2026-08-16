export default function EditorialFigure({
  src,
  alt,
  kind = 'document',
  caption = '',
  year = new Date().getFullYear(),
  className = '',
}) {
  const generated = kind === 'generated';
  const provenance = generated
    ? `Generated field. Human Weather, ${year}.${caption ? ` ${caption}` : ''}`
    : caption;

  return (
    <figure
      className={`hw-visual ${generated ? 'hw-generated' : 'hw-document'} ${className}`.trim()}
      data-provenance={generated ? 'generated' : 'document'}
    >
      <img src={src} alt={alt || ''} loading="lazy" decoding="async" />
      {provenance ? <figcaption className="hw-media-caption">{provenance}</figcaption> : null}
    </figure>
  );
}

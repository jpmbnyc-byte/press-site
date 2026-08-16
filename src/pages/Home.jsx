import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ArticleCard from '@/components/ArticleCard';
import NewsletterSignup from '@/components/NewsletterSignup';
import { WATERS_EDGE_PREVIEW_MINUTES, WATERS_EDGE_SLUG } from '@/lib/membership';
import { setHomePageMeta } from '@/lib/pageMeta';

const HERO_IMAGE = '/home/human-weather-hero-collier-1941.webp';
const HERO_CAPTION =
  'John Collier Jr. Hudson River Valley, New York, October 1941. Farm Security Administration/Office of War Information Photograph Collection, Library of Congress.';

const FEATURED_PREVIEW_SLUG = WATERS_EDGE_SLUG;

function essayDisplayTitle(essay) {
  return essay?.title;
}

function essayEyebrow(essay, fallback = 'Featured') {
  return [
    essay?.series_label,
    essay?.series_order
      ? `Essay ${String(essay.series_order).padStart(2, '0')}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ') || fallback;
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [freeEssays, setFreeEssays] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHomePageMeta();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const allArticles = await base44.entities.Article.list('-published_at', 50);
        const live = allArticles.filter(a => a.status === 'published' || a.status === 'featured');
        const feat = live
          .filter(a => a.featured || a.status === 'featured')
          .sort((a, b) => (a.featured_order ?? 99) - (b.featured_order ?? 99));
        setFeatured(feat.length ? feat : live.slice(0, 1));
        setLatest(live.slice(0, 4));
        const freeRank = (a) => {
          if (a.slug === 'relational-faith-the-distance-we-choose') return 0;
          if (a.series_slug === 'relational-faith') return 1;
          return 2;
        };
        setFreeEssays(
          live
            .filter(a => a.access_level === 'free')
            .sort((a, b) => freeRank(a) - freeRank(b) || (a.series_order || 99) - (b.series_order || 99))
        );

        const allSeries = await base44.entities.Series.list('sort_order', 10);
        setSeries(allSeries.filter(s => s.is_active));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const spotlight =
    featured.find(a => a.slug === FEATURED_PREVIEW_SLUG) ||
    latest.find(a => a.slug === FEATURED_PREVIEW_SLUG) ||
    featured[0] ||
    latest[0];

  const spotlightIsWatersEdge = spotlight?.slug === FEATURED_PREVIEW_SLUG;
  const spotlightIsPreview = spotlight?.access_level === 'members';
  const freeToHighlight = freeEssays.filter(a => a.slug !== spotlight?.slug);
  const freeLead = freeToHighlight[0];
  const freeRest = freeToHighlight.slice(1);

  return (
    <div className="bg-[var(--hw-bg)]">
      <section className="bg-[var(--hw-bg)]">
        <div className="hw-gallery-wall px-5 py-14 md:px-10 md:py-24">
          <figure className="hw-gallery-installation max-w-[1280px] mx-auto m-0">
            <div className="hw-gallery-canvas">
              <img
                src={HERO_IMAGE}
                alt="Passengers leaving Hudson on a ferry in New York, October 1941"
                className="block w-full aspect-[16/9] object-cover object-center"
                loading="eager"
                decoding="async"
              />
            </div>
            <figcaption className="hw-gallery-label">
              <span className="hw-gallery-label-index">Field Study 001</span>
              <span className="block">{HERO_CAPTION}</span>
            </figcaption>
          </figure>
        </div>

        <div className="px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-4xl mx-auto">
            <div className="hw-label text-[var(--hw-muted)] mb-8">A Field Journal</div>
            <h1 className="font-heading text-[clamp(48px,9vw,112px)] font-medium text-[var(--hw-ink)] leading-[0.9] tracking-[-0.05em] mb-10">
              Human Weather
            </h1>
            <p className="font-serif text-2xl md:text-[32px] text-[var(--hw-ink2)] leading-[1.25] max-w-[26ch] mb-12">
              The emotional climate of modern life. A field journal exploring the seasons, storms, and patterns within us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/subscribe"
                className="hw-label text-center text-[var(--hw-paper)] bg-[var(--hw-ink)] border border-[var(--hw-ink)] px-8 py-4"
              >
                Enter the Field Station
              </Link>
              <Link
                to="/journal"
                className="hw-label text-center text-[var(--hw-ink)] border border-[var(--hw-ink)] px-8 py-4"
              >
                Read the Journal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {loading && (
        <div className="px-6 py-5 text-center font-mono text-[9px] tracking-[0.25em] uppercase text-[var(--hw-ink3)]" role="status">
          Opening the latest field notes…
        </div>
      )}

      {spotlight && (
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--hw-gold)] mb-3">
                {spotlightIsWatersEdge
                  ? `Featured Preview · ${WATERS_EDGE_PREVIEW_MINUTES} min free`
                  : spotlightIsPreview
                    ? 'Featured Preview'
                    : 'Featured'}
              </div>
              <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-[var(--hw-ink3)] mb-6">
                {essayEyebrow(spotlight)}
              </div>
              <h2 className="font-serif text-[clamp(32px,5vw,52px)] font-light text-[var(--hw-ink)] leading-[1.05] tracking-[-0.01em] mb-3">
                {essayDisplayTitle(spotlight)}
              </h2>
              {spotlight.subtitle && (
                <p className="font-serif italic text-xl text-[var(--hw-rust)] mb-5 leading-relaxed max-w-md">
                  {spotlight.subtitle}
                </p>
              )}
              {spotlight.excerpt && (
                <p className="font-serif text-lg text-[var(--hw-ink2)] mb-8 leading-relaxed max-w-md">
                  {spotlight.excerpt}
                </p>
              )}
              <Link
                to={`/journal/${spotlight.slug}`}
                className="inline-block font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--hw-ink)] border-b border-[var(--hw-gold)] pb-1 hover:text-[var(--hw-gold)] transition-colors duration-300"
              >
                {spotlightIsWatersEdge
                  ? `Begin ${WATERS_EDGE_PREVIEW_MINUTES}-minute preview →`
                  : spotlightIsPreview
                    ? 'Begin the preview →'
                    : 'Read free →'}
              </Link>
            </div>
          </div>
        </section>
      )}

      {freeLead && (
        <section className="py-20 md:py-24 px-6 bg-[var(--hw-surface)]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 md:mb-16 max-w-2xl animate-[hw-rise_0.8s_ease-out_both]">
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--hw-sage)] mb-3">
                Read Free
              </div>
              <h2 className="font-serif text-[clamp(32px,5vw,44px)] font-light text-[var(--hw-ink)] mb-4">
                Open essays. No membership required.
              </h2>
              <p className="font-serif italic text-lg text-[var(--hw-ink2)] leading-relaxed">
                Full essays you can finish today.
                {freeLead.series_label === spotlight?.series_label
                  ? ` ${essayDisplayTitle(freeLead)} opens the same corridor as the featured preview.`
                  : ' No account required.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              <Link
                to={`/journal/${freeLead.slug}`}
                className="group lg:col-span-7 block animate-[hw-rise_0.9s_ease-out_0.08s_both]"
              >
                <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-[var(--hw-sage)] mb-3">
                  Free essay · {essayEyebrow(freeLead, freeLead.series_label)}
                </div>
                <h3 className="font-serif text-[clamp(28px,4vw,40px)] font-light text-[var(--hw-ink)] group-hover:text-[var(--hw-gold)] transition-colors duration-500 leading-[1.08] mb-3">
                  {essayDisplayTitle(freeLead)}
                </h3>
                {freeLead.subtitle && (
                  <p className="font-serif italic text-lg text-[var(--hw-rust)] mb-4 leading-relaxed max-w-xl">
                    {freeLead.subtitle}
                  </p>
                )}
                {freeLead.excerpt && (
                  <p className="font-serif text-lg text-[var(--hw-ink2)] mb-6 leading-relaxed max-w-xl">
                    {freeLead.excerpt}
                  </p>
                )}
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--hw-ink)] border-b border-[var(--hw-sage)] pb-1 group-hover:text-[var(--hw-gold)] group-hover:border-[var(--hw-gold)] transition-colors duration-300">
                  Read the full essay →
                </span>
              </Link>

              {freeRest.length > 0 && (
                <div className="lg:col-span-5 space-y-10 animate-[hw-rise_0.9s_ease-out_0.16s_both]">
                  <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-[var(--hw-ink3)]">
                    Also free
                  </div>
                  {freeRest.map(essay => (
                    <Link
                      key={essay.id}
                      to={`/journal/${essay.slug}`}
                      className="group block border-t border-[var(--hw-gold)] pt-5"
                    >
                      <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-[var(--hw-sage)] mb-3">
                        Free · {essay.series_label || 'Human Weather'}
                      </div>
                      <h3 className="font-serif text-2xl font-light text-[var(--hw-ink)] group-hover:text-[var(--hw-gold)] transition-colors duration-500 mb-2 leading-tight">
                        {essayDisplayTitle(essay)}
                      </h3>
                      {essay.subtitle && (
                        <p className="font-serif italic text-sm text-[var(--hw-rust)] mb-2 leading-relaxed">
                          {essay.subtitle}
                        </p>
                      )}
                      {essay.excerpt && (
                        <p className="font-serif text-base text-[var(--hw-ink2)] line-clamp-2 leading-relaxed">
                          {essay.excerpt}
                        </p>
                      )}
                    </Link>
                  ))}
                  <Link
                    to="/journal?access=free"
                    className="inline-block font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--hw-ink)] border-b border-[var(--hw-gold)] pb-1 hover:text-[var(--hw-gold)] transition-colors duration-300"
                  >
                    All free essays →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="flex items-center justify-center py-8">
        <div className="w-20 h-px bg-[var(--hw-gold)] opacity-30" />
        <span className="mx-4 text-[var(--hw-gold)] opacity-40 text-xs">✦</span>
        <div className="w-20 h-px bg-[var(--hw-gold)] opacity-30" />
      </div>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-16">
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--hw-gold)] mb-3">
                From the Journal
              </div>
              <h2 className="font-serif text-[clamp(32px,5vw,44px)] font-light text-[var(--hw-ink)]">
                Recent Reports
              </h2>
            </div>
            <Link
              to="/journal"
              className="hidden md:inline-block font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--hw-ink)] border-b border-[var(--hw-gold)] pb-1 hover:text-[var(--hw-gold)] transition-colors duration-300"
            >
              View Archive →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
            {latest
              .filter(a => a.slug !== spotlight?.slug)
              .slice(0, 4)
              .map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-[rgba(108,87,89,0.18)]">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--hw-gold)] mb-4">
            Seven Corridors
          </div>
          <h2 className="font-serif text-[clamp(32px,5vw,44px)] font-light text-[var(--hw-ink)] mb-4">
            Seven Series. One Question.
          </h2>
          <p className="font-serif italic text-lg text-[var(--hw-ink2)] mb-16 max-w-2xl">
            What is the weather inside you, and what is it doing to everything you touch?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {series.map((s, i) => (
              <Link
                key={s.id}
                to={`/series/${s.slug}`}
                className="group block border-t border-[var(--hw-gold)] pt-5 hover:border-[var(--hw-gold-lt)] transition-colors duration-500"
              >
                <div className="font-mono text-[10px] text-[var(--hw-gold)] mb-3">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-serif text-2xl font-light text-[var(--hw-ink)] group-hover:text-[var(--hw-gold)] transition-colors duration-500 mb-2">
                  {s.name}
                </h3>
                <p className="font-serif italic text-sm text-[var(--hw-ink2)] mb-3">{s.tagline}</p>
                <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--hw-ink3)]">
                  {s.essay_count_published || 0} of {s.total_essays || 0} essays
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#0e0d0a]">
        <div className="max-w-3xl mx-auto text-center animate-[hw-rise_0.8s_ease-out]">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#c4a84a] mb-5">
            Gospels Live
          </div>
          <h2 className="font-serif text-[clamp(28px,4vw,44px)] font-light text-[#f0e9d8] mb-6 leading-tight">
            The oldest somatic map, spoken aloud.
          </h2>
          <p className="font-serif italic text-lg text-[#c8b99a] mb-4 max-w-xl mx-auto leading-relaxed">
            Forty-eight live climates — English and Latin. Be not afraid / Nolite timere. Regulation
            older than polyvagal theory. Draw a climate, or receive a command at random.
          </p>
          <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-[#c8b99a]/70 mb-10">
            Chamber practice · Learn Latin · Random draw
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/gospels"
              className="inline-block font-mono text-[10px] tracking-[0.3em] uppercase text-[#0e0d0a] bg-[#c4a84a] px-10 py-4 hover:bg-[#e0c870] transition-all duration-500"
            >
              Enter the Chamber →
            </Link>
            <Link
              to="/gospels?view=archive"
              className="inline-block font-mono text-[10px] tracking-[0.3em] uppercase text-[#F7F4EE] border border-[#F7F4EE] px-10 py-4 hover:bg-[#F7F4EE] hover:text-[#1C1C1C] transition-all duration-500"
            >
              Browse 48 Commands →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 text-center border-t border-[rgba(108,87,89,0.18)]">
        <div className="max-w-xl mx-auto">
          <div className="font-serif text-[clamp(28px,4vw,40px)] font-light italic text-[var(--hw-ink)] leading-relaxed mb-8">
            &ldquo;We are not forecasting the weather. We are living inside it.&rdquo;
          </div>
          <div className="w-16 h-px bg-[var(--hw-gold)] opacity-40 mx-auto" />
        </div>
      </section>

      <section className="py-24 px-6 bg-[var(--hw-surface)]">
        <NewsletterSignup source="homepage" />
      </section>
    </div>
  );
}

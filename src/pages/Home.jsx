import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ArticleCard from '@/components/ArticleCard';
import NewsletterSignup from '@/components/NewsletterSignup';
import { setHomePageMeta } from '@/lib/pageMeta';

const HERO_IMAGE =
  'https://media.base44.com/images/public/6a57ce138c2f29923fec6bc4/5efc2a849_generated_image.png';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
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

        const allSeries = await base44.entities.Series.list('sort_order', 10);
        setSeries(allSeries.filter(s => s.is_active));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--hw-bg)]">
        <div className="w-8 h-8 border-2 border-[var(--hw-gold)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const spotlight = featured[0] || latest[0];
  const spotlightTitle = spotlight?.subtitle || spotlight?.title;
  const spotlightEyebrow = [
    spotlight?.series_label,
    spotlight?.series_order
      ? `Essay ${String(spotlight.series_order).padStart(2, '0')} of 7`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="bg-[var(--hw-bg)]">
      {/* Brand hero — full-bleed image + Field Station CTAs */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover animate-[hw-hero-in_1.2s_ease-out]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(28,28,28,0.20) 0%, rgba(28,28,28,0.60) 100%)',
          }}
        />
        <div className="relative z-10 text-center px-6 max-w-2xl animate-[hw-rise_0.9s_ease-out_0.15s_both]">
          <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#F7F4EE] opacity-70 mb-8">
            A Field Journal
          </div>
          <h1 className="font-serif text-[clamp(48px,9vw,96px)] font-light text-[#F7F4EE] leading-[0.95] tracking-[-0.02em] mb-8">
            Human Weather
          </h1>
          <p className="font-serif italic text-xl md:text-2xl text-[#F7F4EE] opacity-80 leading-relaxed max-w-lg mx-auto mb-10">
            The emotional climate of modern life. A field journal exploring the seasons, storms, and
            patterns within us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/subscribe"
              className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#F7F4EE] border border-[#F7F4EE] px-10 py-4 hover:bg-[#F7F4EE] hover:text-[#1C1C1C] transition-all duration-500"
            >
              Enter the Field Station
            </Link>
            <Link
              to="/journal"
              className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#F7F4EE] border border-[#F7F4EE] px-10 py-4 hover:bg-[#F7F4EE] hover:text-[#1C1C1C] transition-all duration-500"
            >
              Read the Journal
            </Link>
          </div>
        </div>
      </section>

      {/* Featured essay spotlight */}
      {spotlight && (
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              {spotlight.hero_image_url ? (
                <img
                  src={spotlight.hero_image_url}
                  alt={spotlight.hero_image_alt || ''}
                  className="w-full aspect-[4/5] object-cover"
                />
              ) : (
                <div className="w-full aspect-[4/5] bg-[var(--hw-surface)]" />
              )}
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--hw-gold)] mb-6">
                {spotlightEyebrow || 'Featured'}
              </div>
              <h2 className="font-serif text-[clamp(32px,5vw,52px)] font-light text-[var(--hw-ink)] leading-[1.05] tracking-[-0.01em] mb-6">
                {spotlightTitle}
              </h2>
              {spotlight.excerpt && (
                <p className="font-serif italic text-xl text-[var(--hw-ink2)] mb-8 leading-relaxed max-w-md">
                  {spotlight.excerpt}
                </p>
              )}
              <Link
                to={`/journal/${spotlight.slug}`}
                className="inline-block font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--hw-ink)] border-b border-[var(--hw-gold)] pb-1 hover:text-[var(--hw-gold)] transition-colors duration-300"
              >
                Read Essay →
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="flex items-center justify-center py-8">
        <div className="w-20 h-px bg-[var(--hw-gold)] opacity-30" />
        <span className="mx-4 text-[var(--hw-gold)] opacity-40 text-xs">✦</span>
        <div className="w-20 h-px bg-[var(--hw-gold)] opacity-30" />
      </div>

      {/* Recent reports */}
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
            {latest.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* Seven series */}
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
                  {s.essay_count_published || 0} of 7 essays
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Gospels Live callout */}
      <section className="py-24 px-6 bg-[#0e0d0a]">
        <div className="max-w-3xl mx-auto text-center animate-[hw-rise_0.8s_ease-out]">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#c4a84a] mb-5">
            Gospels Live
          </div>
          <h2 className="font-serif text-[clamp(28px,4vw,44px)] font-light text-[#f0e9d8] mb-6 leading-tight">
            The oldest somatic map, spoken aloud.
          </h2>
          <p className="font-serif italic text-lg text-[#c8b99a] mb-10 max-w-xl mx-auto leading-relaxed">
            Be not afraid. Peace, be still. Take heart. Living commands from the Gospels — regulation
            protocols older than polyvagal theory.
          </p>
          <Link
            to="/gospels"
            className="inline-block font-mono text-[10px] tracking-[0.3em] uppercase text-[#F7F4EE] border border-[#F7F4EE] px-10 py-4 hover:bg-[#F7F4EE] hover:text-[#1C1C1C] transition-all duration-500"
          >
            Enter the Chamber →
          </Link>
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

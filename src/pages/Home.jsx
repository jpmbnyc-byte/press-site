import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SomaticField from '@/components/SomaticField';
import ArticleCard from '@/components/ArticleCard';
import NewsletterSignup from '@/components/NewsletterSignup';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const allArticles = await base44.entities.Article.list('-published_at', 50);
        const live = allArticles.filter(a => a.status === 'published' || a.status === 'featured');
        const feat = live.filter(a => a.featured || a.status === 'featured');
        setFeatured(feat.length ? feat : live.slice(0, 1));
        setLatest(live.slice(0, 3));

        const allSeries = await base44.entities.Series.list('sort_order', 10);
        setSeries(allSeries.filter(s => s.is_active));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(s => (s + 1) % featured.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e0d0a]">
        <div className="w-8 h-8 border-2 border-[#c4a84a] border-t-transparent rounded-none animate-spin"></div>
      </div>
    );
  }

  const hero = featured[currentSlide];

  return (
    <div>
      {/* Hero Carousel */}
      {hero && (
        <section
          className="relative h-[440px] md:h-[560px] flex items-center justify-center overflow-hidden"
          onMouseEnter={() => {}}
        >
          {hero.hero_image_url && (
            <img
              src={hero.hero_image_url}
              alt={hero.hero_image_alt || ''}
              className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
            />
          )}
          <div className="absolute inset-0 bg-[rgba(10,8,6,0.62)]" />
          <div className="relative z-10 text-center px-6 max-w-3xl">
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#c4a84a] mb-6">
              {hero.series_label || 'Human Weather'}
            </div>
            <h1 className="font-serif text-[clamp(36px,6vw,60px)] font-light text-[#f0e9d8] tracking-[-0.02em] leading-[1.08] mb-6">
              {hero.title}
            </h1>
            {hero.subtitle && (
              <p className="font-serif italic text-xl text-[#f0e9d8] opacity-65 mb-8 max-w-xl mx-auto">
                {hero.subtitle}
              </p>
            )}
            <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#f0e9d8] opacity-40 mb-8">
              JP Bobo · {hero.reading_time_mins || 9} min read
            </div>
            <Link
              to={`/journal/${hero.slug}`}
              className="inline-block font-mono text-[10px] tracking-[0.25em] uppercase text-[#c4a84a] border border-[#c4a84a] px-8 py-3 hover:bg-[#c4a84a] hover:text-[#0e0d0a] transition-all duration-300"
            >
              Read Essay →
            </Link>
          </div>
          {featured.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {featured.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 transition-colors duration-300 ${
                    i === currentSlide ? 'bg-[#c4a84a]' : 'bg-[#f0e9d8] opacity-30'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Weekly Dispatch Strip */}
      <section className="bg-[#1a1810] py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex-1">
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#c4a84a] mb-4">This Week</div>
            <h2 className="font-serif text-3xl text-[#f0e9d8] font-light mb-3">The Distance We Choose</h2>
            <p className="font-serif italic text-base text-[#f0e9d8] opacity-50 max-w-xl">
              On relational proximity, the four dimensions of nearness, and what happens when one of the parties is God.
            </p>
          </div>
          <div className="text-left md:text-right">
            <Link
              to="/journal/relational-faith-the-distance-we-choose"
              className="inline-block font-mono text-[10px] tracking-[0.2em] uppercase text-[#c4a84a] border border-[#c4a84a] px-6 py-3 hover:bg-[#c4a84a] hover:text-[#0e0d0a] transition-all duration-300"
            >
              Read the dispatch →
            </Link>
            <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#f0e9d8] opacity-30 mt-3">
              1,247 readers
            </div>
          </div>
        </div>
      </section>

      {/* Journal Grid — Latest Three */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--hw-gold)] mb-3">From the Journal</div>
        <h2 className="font-serif text-4xl font-light text-[var(--hw-ink)] mb-12">Recent Essays</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latest.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            to="/journal"
            className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--hw-gold)] border border-[var(--hw-gold)] px-8 py-3 hover:bg-[var(--hw-gold)] hover:text-[var(--hw-bg)] transition-all duration-300 inline-block"
          >
            View All Essays →
          </Link>
        </div>
      </section>

      {/* The Series — All Seven */}
      <section className="py-20 px-6 border-t border-[rgba(154,125,46,0.18)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl font-light text-[var(--hw-ink)] mb-3">Seven Series. One Question.</h2>
          <p className="font-serif italic text-lg text-[var(--hw-ink2)] mb-12 max-w-2xl">
            What is the weather inside you, and what is it doing to everything you touch?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {series.map((s, i) => (
              <Link
                key={s.id}
                to={`/series/${s.slug}`}
                className="group block border-t-2 border-[var(--hw-gold)] pt-4 hover:border-[var(--hw-gold-lt)] transition-colors duration-300"
              >
                <div className="font-mono text-[9px] text-[var(--hw-gold)] mb-2">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-serif text-xl font-light text-[var(--hw-ink)] group-hover:text-[var(--hw-gold)] transition-colors duration-300 mb-1">
                  {s.name}
                </h3>
                <p className="font-serif italic text-sm text-[var(--hw-rust)] mb-2">{s.tagline}</p>
                <div className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--hw-ink3)]">
                  {s.essay_count_published || 0} of 7 essays
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* The App Callout */}
      <section className="bg-[#0e0d0a] py-24 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#c4a84a] mb-4">The Practice</div>
            <h2 className="font-serif text-4xl font-light text-[#f0e9d8] mb-6">Map Your Internal Climate</h2>
            <p className="font-serif text-lg text-[#c8b99a] leading-relaxed mb-8 max-w-md">
              The Human Weather app maps what you feel in your body and prescribes regulated responses — breathwork,
              frequency therapy, light therapy, and sacred commands. The publication is the intellectual world that
              practice lives inside.
            </p>
            <a
              href="https://humanweather.social"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#c4a84a] border border-[#c4a84a] px-8 py-3 hover:bg-[#c4a84a] hover:text-[#0e0d0a] transition-all duration-300 inline-block"
            >
              Open humanweather.social →
            </a>
          </div>
          <div className="flex-shrink-0 w-56 md:w-64">
            <SomaticField size={8} />
            <div className="text-center font-mono text-[9px] tracking-[0.3em] uppercase text-[#c4a84a] opacity-50 mt-6">
              Somatic Field
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-24 px-6 bg-[var(--hw-bg)] transition-colors duration-500">
        <NewsletterSignup source="homepage" />
      </section>
    </div>
  );
}
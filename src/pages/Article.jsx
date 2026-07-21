import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';
import AuthorPortrait from '@/components/AuthorPortrait';
import { startCheckout } from '@/lib/stripeCheckout';

export default function Article() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [checkoutError, setCheckoutError] = useState('');

  const handleCheckout = async (planId) => {
    setCheckoutError('');
    setCheckoutPlan(planId);
    try {
      await startCheckout(planId);
    } catch (err) {
      setCheckoutError(err.message || 'Checkout failed. Please try again.');
      setCheckoutPlan(null);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const all = await base44.entities.Article.list('-published_at', 100);
        const found = all.find(a => a.slug === slug);
        if (found) {
          setArticle(found);
          try {
            await base44.entities.Article.update(found.id, {
              view_count: (found.view_count || 0) + 1,
            });
          } catch (e) {}
          if (found.series_label) {
            setRelated(
              all.filter(a => a.series_label === found.series_label && a.id !== found.id).slice(0, 2)
            );
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--hw-gold)] border-t-transparent rounded-none animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 text-center">
        <div>
          <p className="font-serif text-2xl text-[var(--hw-ink3)] mb-6">Essay not found.</p>
          <Link to="/journal" className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--hw-gold)] border border-[var(--hw-gold)] px-6 py-3 hover:bg-[var(--hw-gold)] hover:text-[var(--hw-bg)] transition-all duration-300 inline-block">
            ← Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[200] bg-transparent">
        <div className="h-full bg-[var(--hw-gold)] transition-all duration-150" style={{ width: `${progress}%` }} />
      </div>

      {/* Article header */}
      <header className="max-w-[740px] mx-auto px-6 pt-12 pb-8">
        <div className="w-12 h-[2px] bg-[var(--hw-gold)] mb-6" />
        <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-[var(--hw-rust)] mb-4">
          {article.series_label || 'Human Weather'} · Essay {article.series_order || 1} of 7
        </div>
        <h1 className="font-serif text-[clamp(36px,5vw,56px)] font-light leading-[1.08] tracking-[-0.01em] text-[var(--hw-ink)] mb-4">
          {article.title}
        </h1>
        {article.subtitle && (
          <p className="font-serif italic text-2xl text-[var(--hw-rust)] mb-6">{article.subtitle}</p>
        )}
        {article.excerpt && (
          <p className="font-serif italic text-lg text-[var(--hw-ink2)] max-w-[540px] mb-8">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-4 pb-8 border-b border-[rgba(154,125,46,0.22)]">
          <AuthorPortrait size="md" />
          <div className="flex flex-col gap-[2px]">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--hw-ink)]">
              {article.author_name || 'JP Bobo'}
            </div>
            <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--hw-ink3)]">
              {article.published_at || '2026'} · {article.reading_time_mins || 9} min read
            </div>
          </div>
        </div>
      </header>

      {/* Hero image */}
      {article.hero_image_url && (
        <div className="w-full mb-12">
          <img
            src={article.hero_image_url}
            alt={article.hero_image_alt || ''}
            className="w-full max-h-[520px] object-cover object-[center_30%]"
          />
          {article.hero_image_caption && (
            <div className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--hw-ink3)] mt-2 text-center max-w-[740px] mx-auto px-6">
              {article.hero_image_caption}
            </div>
          )}
        </div>
      )}

      {/* Article body */}
      <article className="max-w-[680px] mx-auto px-6 pb-16">
        <div className="article-body">
          <ReactMarkdown
            components={{
              hr: () => <div className="hw-ornament">✦ · ✦ · ✦</div>,
              blockquote: ({ children }) => (
                <blockquote>{children}</blockquote>
              ),
              p: ({ children }) => <p>{children}</p>,
              h2: ({ children }) => (
                <h2 className="font-serif text-3xl font-light mt-12 mb-6 text-[var(--hw-ink)]">{children}</h2>
              ),
              em: ({ children }) => <em className="italic">{children}</em>,
              strong: ({ children }) => (
                <strong className="font-semibold text-[var(--hw-ink)]">{children}</strong>
              ),
            }}
          >
            {article.body_md}
          </ReactMarkdown>
        </div>

        {/* End mark */}
        <div className="text-center text-[var(--hw-gold)] text-lg mt-12">✦</div>

        {/* Paywall gate */}
        {article.access_level === 'members' && (
          <div className="mt-16 border-t border-b border-[rgba(154,125,46,0.18)] py-12 text-center bg-[var(--hw-surface)]">
            <h3 className="font-serif text-3xl font-light text-[var(--hw-ink)] mb-3">
              This essay continues for members.
            </h3>
            <p className="font-serif italic text-lg text-[var(--hw-ink2)] mb-8 max-w-md mx-auto">
              Join to read all 49 essays across seven series.
            </p>
            {checkoutError && (
              <p className="font-serif text-sm text-[var(--hw-gold)] mb-4">{checkoutError}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4 max-w-md mx-auto">
              <button
                type="button"
                disabled={!!checkoutPlan}
                onClick={() => handleCheckout('member_monthly')}
                className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--hw-gold)] border border-[var(--hw-gold)] px-8 py-4 hover:bg-[var(--hw-gold)] hover:text-[var(--hw-bg)] transition-all duration-300 disabled:opacity-60"
              >
                {checkoutPlan === 'member_monthly' ? 'Redirecting…' : '$9 / month'}
              </button>
              <button
                type="button"
                disabled={!!checkoutPlan}
                onClick={() => handleCheckout('member_yearly')}
                className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--hw-gold)] border border-[var(--hw-gold)] px-8 py-4 hover:bg-[var(--hw-gold)] hover:text-[var(--hw-bg)] transition-all duration-300 disabled:opacity-60"
              >
                {checkoutPlan === 'member_yearly' ? 'Redirecting…' : '$72 / year — save 33%'}
              </button>
            </div>
            <button
              type="button"
              disabled={!!checkoutPlan}
              onClick={() => handleCheckout('member_app_yearly')}
              className="inline-block font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--hw-bg)] bg-[var(--hw-gold)] px-8 py-4 hover:bg-[var(--hw-gold-lt)] transition-all duration-300 mb-4 disabled:opacity-60"
            >
              {checkoutPlan === 'member_app_yearly'
                ? 'Redirecting…'
                : '$96 / year — Member + App Bundle'}
            </button>
            <p className="font-serif italic text-sm text-[var(--hw-ink3)] mt-2">
              <Link to="/subscribe" className="text-[var(--hw-gold)] hover:underline">
                Compare plans
              </Link>
              {' · '}
              First essay in every series is always free.
            </p>
          </div>
        )}

        {/* App CTA */}
        <div className="mt-16 bg-[#0e0d0a] py-12 px-6 text-center">
          <p className="font-serif text-2xl font-light text-[#f0e9d8] mb-2">
            What is your climate right now?
          </p>
          <a
            href="https://humanweather.social"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#c4a84a] hover:text-[#e0c870] transition-colors duration-300"
          >
            humanweather.social →
          </a>
        </div>
      </article>

      {/* Related essays */}
      {related.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 py-16 border-t border-[rgba(154,125,46,0.18)]">
          <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--hw-gold)] mb-6">
            Continue in {article.series_label}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {related.map(a => (
              <Link
                key={a.id}
                to={`/journal/${a.slug}`}
                className="group block border-t-2 border-[var(--hw-gold)] pt-4"
              >
                <div className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--hw-ink3)] mb-2">
                  Essay {String(a.series_order || 1).padStart(2, '0')} of 7
                </div>
                <h4 className="font-serif text-xl font-light text-[var(--hw-ink)] group-hover:text-[var(--hw-gold)] transition-colors duration-300 mb-1">
                  {a.title}
                </h4>
                <p className="font-serif italic text-sm text-[var(--hw-ink2)]">{a.subtitle}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-20 px-6 border-t border-[rgba(154,125,46,0.18)]">
        <div className="max-w-md mx-auto text-center">
          <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--hw-gold)] mb-4">
            The Weekly Dispatch
          </div>
          <p className="font-serif italic text-lg text-[var(--hw-ink2)] mb-6">
            Editorial. No noise. The interior forecast for modern life.
          </p>
          <Link
            to="/subscribe"
            className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--hw-gold)] border border-[var(--hw-gold)] px-8 py-3 hover:bg-[var(--hw-gold)] hover:text-[var(--hw-bg)] transition-all duration-300 inline-block"
          >
            Subscribe Free →
          </Link>
        </div>
      </section>
    </div>
  );
}
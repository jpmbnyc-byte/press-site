import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import AuthorPortrait from '@/components/AuthorPortrait';
import NewsletterSignup from '@/components/NewsletterSignup';
import { startCheckout } from '@/lib/stripeCheckout';
import { useAuth } from '@/lib/AuthContext';
import { hasPressAccess, WATERS_EDGE_PREVIEW_MINUTES, WATERS_EDGE_SLUG } from '@/lib/membership';
import { fetchPressArticle } from '@/lib/pressArticles';
import { setEssayPageMeta, setHomePageMeta } from '@/lib/pageMeta';
import { formatPublicationDate } from '@/lib/editorial';
import { STRIPE_PLANS } from '@/lib/stripePlans';

const monthlyPlan = STRIPE_PLANS.member_monthly;
const yearlyPlan = STRIPE_PLANS.member_yearly;

export default function Article() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [freeCompanion, setFreeCompanion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [checkoutError, setCheckoutError] = useState('');
  const canReadMembers = hasPressAccess(user);
  const bodyLocked =
    article?.body_gated === true ||
    (article?.access_level === 'members' && !canReadMembers && article?.can_read_full !== true);

  const handleCheckout = async (planId) => {
    setCheckoutError('');
    setCheckoutPlan(planId);
    try {
      await startCheckout(planId, { user });
    } catch (err) {
      setCheckoutError(err.message || 'Checkout failed. Please try again.');
      setCheckoutPlan(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchPressArticle(slug, user);
        if (cancelled) return;
        const found = data.article;
        setArticle(found);
        setEssayPageMeta(found);

        const sameSeries = Array.isArray(data.related) ? data.related : [];
        const freeInSeries = sameSeries
          .filter(a => a.access_level === 'free')
          .sort((a, b) => (a.series_order || 99) - (b.series_order || 99));
        setFreeCompanion(found.access_level === 'members' ? freeInSeries[0] || null : null);
        setRelated(
          [...sameSeries]
            .sort((a, b) => {
              if (a.access_level === 'free' && b.access_level !== 'free') return -1;
              if (b.access_level === 'free' && a.access_level !== 'free') return 1;
              return (a.series_order || 99) - (b.series_order || 99);
            })
            .slice(0, 2)
        );
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setArticle(null);
          setRelated([]);
          setFreeCompanion(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      setHomePageMeta();
    };
  }, [slug, canReadMembers, user]);

  useEffect(() => {
    if (loading || !article || article.slug !== slug) return undefined;

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loading, article, slug]);

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
      <div className="max-w-[740px] mx-auto px-6 pt-12 pb-24" aria-busy="true">
        <div className="w-12 h-[2px] bg-[var(--hw-gold)] mb-8" />
        <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-[var(--hw-ink3)] mb-6">
          Opening essay…
        </div>
        <div className="h-12 max-w-[620px] bg-[var(--hw-surface)] mb-4" />
        <div className="h-7 max-w-[520px] bg-[var(--hw-surface)] mb-8 opacity-80" />
        <div className="h-px bg-[rgba(154,125,46,0.18)] mb-10" />
        <div className="space-y-4 max-w-[680px]">
          <div className="h-4 bg-[var(--hw-surface)]" />
          <div className="h-4 bg-[var(--hw-surface)]" />
          <div className="h-4 w-4/5 bg-[var(--hw-surface)]" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 text-center">
        <div>
          <p className="font-serif text-2xl text-[var(--hw-ink3)] mb-6">Essay not found.</p>
          <Link
            to="/journal"
            className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--hw-gold)] border border-[var(--hw-gold)] px-6 py-3 hover:bg-[var(--hw-gold)] hover:text-[var(--hw-bg)] transition-all duration-300 inline-block"
          >
            ← Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  const published = formatPublicationDate(article.published_at);
  const isWatersEdge = article.slug === WATERS_EDGE_SLUG;
  const returnPath = `/journal/${article.slug}`;
  const loginForYearly = `/login?next=${encodeURIComponent(returnPath)}&plan=${encodeURIComponent(yearlyPlan.id)}`;

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[200] bg-transparent">
        <div
          className="h-full bg-[var(--hw-gold)] transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <header className="max-w-[740px] mx-auto px-6 pt-12 pb-8">
        <div className="w-12 h-[2px] bg-[var(--hw-gold)] mb-6" />
        <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-[var(--hw-rust)] mb-4">
          {isWatersEdge ? 'Featured Preview · ' : ''}
          {article.series_label || 'Human Weather'} · Essay {String(article.series_order || 1).padStart(2, '0')}
          {article.access_level === 'free' ? ' · Free' : ''}
        </div>
        <h1 className="scroll-mt-20 font-serif text-[clamp(36px,5vw,56px)] font-light leading-[1.08] tracking-[-0.01em] text-[var(--hw-ink)] mb-4">
          {article.title}
        </h1>
        {article.subtitle && (
          <p className="font-serif italic text-2xl text-[var(--hw-rust)] mb-6">{article.subtitle}</p>
        )}
        {article.excerpt && (
          <p className="font-serif text-lg text-[var(--hw-ink2)] max-w-[540px] mb-8 leading-relaxed">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-4 pb-8 border-b border-[rgba(154,125,46,0.22)]">
          <AuthorPortrait size="md" />
          <div className="flex flex-col gap-[2px]">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--hw-ink)]">
              {article.author_name || 'JP Bobo'}
            </div>
            <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--hw-ink3)]">
              {published || 'Publication date forthcoming'} · {article.reading_time_mins || 9} min read
            </div>
          </div>
        </div>
      </header>

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

      <article className="max-w-[680px] mx-auto px-6 pb-16">
        <div className="article-body">
          <ReactMarkdown
            components={{
              hr: () => <div className="hw-ornament">✦ · ✦ · ✦</div>,
              blockquote: ({ children }) => <blockquote>{children}</blockquote>,
              p: ({ children }) => <p>{children}</p>,
              h2: ({ children }) => (
                <h2 className="scroll-mt-20 font-serif text-3xl font-light mt-12 mb-6 text-[var(--hw-ink)]">
                  {children}
                </h2>
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

        {!bodyLocked && <div className="text-center text-[var(--hw-gold)] text-lg mt-12">✦</div>}

        {bodyLocked && (
          <div className="mt-10 border-y border-[rgba(154,125,46,0.18)] py-12 text-center bg-[var(--hw-surface)] px-6">
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--hw-gold)] mb-4">
              Member reading
            </div>
            <h3 className="font-serif text-3xl font-light text-[var(--hw-ink)] mb-3">
              {isWatersEdge ? 'The preview ends here.' : 'Continue the essay.'}
            </h3>
            <p className="font-serif text-lg text-[var(--hw-ink2)] mb-8 max-w-md mx-auto leading-relaxed">
              {isWatersEdge
                ? `You've reached about ${WATERS_EDGE_PREVIEW_MINUTES} minutes of reading. Membership opens the rest of this essay and the members archive.`
                : 'Membership opens the rest of this essay and the members archive.'}
            </p>
            {checkoutError && (
              <p className="font-serif text-sm text-[var(--hw-rust)] mb-4" role="alert">{checkoutError}</p>
            )}

            {!isAuthenticated ? (
              <div className="max-w-md mx-auto">
                <Link
                  to={loginForYearly}
                  className="block bg-[var(--hw-gold)] text-[var(--hw-bg)] px-8 py-4 font-mono text-[10px] tracking-[0.25em] uppercase hover:bg-[var(--hw-gold-lt)] transition-colors mb-4"
                >
                  Log in & start {yearlyPlan.trialDays}-day trial · {yearlyPlan.amountLabel}
                </Link>
                <p className="font-serif text-sm text-[var(--hw-ink3)]">
                  New reader?{' '}
                  <Link
                    to={`/register?next=${encodeURIComponent(returnPath)}&plan=${encodeURIComponent(yearlyPlan.id)}`}
                    className="text-[var(--hw-gold)] hover:underline"
                  >
                    Create an account
                  </Link>
                  {' · '}
                  <Link to="/subscribe" className="text-[var(--hw-gold)] hover:underline">
                    Compare plans
                  </Link>
                </p>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <button
                  type="button"
                  disabled={!!checkoutPlan}
                  onClick={() => handleCheckout(yearlyPlan.id)}
                  className="w-full bg-[var(--hw-gold)] text-[var(--hw-bg)] px-8 py-4 font-mono text-[10px] tracking-[0.25em] uppercase hover:bg-[var(--hw-gold-lt)] transition-colors disabled:opacity-60 mb-3"
                >
                  {checkoutPlan === yearlyPlan.id
                    ? 'Redirecting…'
                    : `Start ${yearlyPlan.trialDays}-day trial · ${yearlyPlan.amountLabel}`}
                </button>
                <button
                  type="button"
                  disabled={!!checkoutPlan}
                  onClick={() => handleCheckout(monthlyPlan.id)}
                  className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--hw-gold)] hover:underline disabled:opacity-60"
                >
                  {checkoutPlan === monthlyPlan.id ? 'Redirecting…' : `Prefer monthly? ${monthlyPlan.amountLabel}`}
                </button>
                <span className="mx-2 text-[var(--hw-ink3)]">·</span>
                <Link to="/subscribe" className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--hw-gold)] hover:underline">
                  Compare plans
                </Link>
              </div>
            )}
          </div>
        )}

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

      {freeCompanion && (
        <section className="max-w-[680px] mx-auto px-6 py-14 border-t border-[rgba(154,125,46,0.18)]">
          <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--hw-sage)] mb-4">
            Read free in {article.series_label}
          </div>
          <Link to={`/journal/${freeCompanion.slug}`} className="group block">
            <h3 className="font-serif text-3xl font-light text-[var(--hw-ink)] group-hover:text-[var(--hw-gold)] transition-colors duration-300 mb-2 leading-tight">
              {freeCompanion.title}
            </h3>
            {freeCompanion.subtitle && (
              <p className="font-serif italic text-lg text-[var(--hw-rust)] mb-3 leading-relaxed">
                {freeCompanion.subtitle}
              </p>
            )}
            {freeCompanion.excerpt && (
              <p className="font-serif text-lg text-[var(--hw-ink2)] mb-5 leading-relaxed">
                {freeCompanion.excerpt}
              </p>
            )}
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--hw-ink)] border-b border-[var(--hw-sage)] pb-1 group-hover:text-[var(--hw-gold)] group-hover:border-[var(--hw-gold)] transition-colors">
              Read the full free essay →
            </span>
          </Link>
        </section>
      )}

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
                className={`group block border-t-2 pt-4 ${
                  a.access_level === 'free' ? 'border-[var(--hw-sage)]' : 'border-[var(--hw-gold)]'
                }`}
              >
                <div className="font-mono text-[8px] tracking-[0.15em] uppercase text-[var(--hw-ink3)] mb-2">
                  Essay {String(a.series_order || 1).padStart(2, '0')}
                  {a.access_level === 'free' ? ' · Free' : ' · Members'}
                </div>
                <h4 className="font-serif text-xl font-light text-[var(--hw-ink)] group-hover:text-[var(--hw-gold)] transition-colors duration-300 mb-1">
                  {a.title}
                </h4>
                {a.subtitle && (
                  <p className="font-serif italic text-sm text-[var(--hw-rust)]">{a.subtitle}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="py-20 px-6 border-t border-[rgba(154,125,46,0.18)]">
        <NewsletterSignup source="article_footer" />
      </section>
    </div>
  );
}

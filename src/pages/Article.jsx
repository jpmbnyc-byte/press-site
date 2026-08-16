import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import AuthorPortrait from '@/components/AuthorPortrait';
import NewsletterSignup from '@/components/NewsletterSignup';
import { useRegister } from '@/components/Register';
import { startCheckout } from '@/lib/stripeCheckout';
import { useAuth } from '@/lib/AuthContext';
import { hasPressAccess, WATERS_EDGE_PREVIEW_MINUTES, WATERS_EDGE_SLUG } from '@/lib/membership';
import { fetchPressArticle } from '@/lib/pressArticles';
import { setEssayPageMeta, setHomePageMeta } from '@/lib/pageMeta';
import { formatPublicationDate } from '@/lib/editorial';
import { getSeriesMeta, publicationYear } from '@/lib/editorialSystem';
import { STRIPE_PLANS } from '@/lib/stripePlans';

const monthlyPlan = STRIPE_PLANS.member_monthly;
const yearlyPlan = STRIPE_PLANS.member_yearly;

export default function Article() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { setRegister } = useRegister();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [freeCompanion, setFreeCompanion] = useState(null);
  const [loading, setLoading] = useState(true);
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
        const seriesName = found.series_label || 'Human Weather';
        const seriesMeta = getSeriesMeta(seriesName);
        const essayTotal = Math.max(
          Number(found.series_order) || 1,
          ...sameSeries.map(item => Number(item.series_order) || 0),
        );
        setRegister({
          pathname: `/journal/${found.slug}`,
          seriesName,
          seriesOrder: seriesMeta.order,
          essayOrder: Number(found.series_order) || 1,
          essayTotal,
          year: publicationYear(found.published_at),
          color: seriesMeta.color,
        });

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
  }, [slug, canReadMembers, user, setRegister]);

  useEffect(() => {
    if (loading || !article || article.slug !== slug) return undefined;

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loading, article, slug]);

  if (loading) {
    return (
      <div className="max-w-[740px] mx-auto px-6 pt-12 pb-24" aria-busy="true">
        <div className="w-12 h-px bg-[var(--hw-rule)] mb-8" />
        <div className="hw-label text-[var(--hw-muted)] mb-6">Opening essay…</div>
        <div className="h-12 max-w-[620px] bg-[var(--hw-surface)] mb-4" />
        <div className="h-7 max-w-[520px] bg-[var(--hw-surface)] mb-8" />
        <div className="h-px bg-[var(--hw-rule)] mb-10" />
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
          <p className="font-serif text-2xl text-[var(--hw-muted)] mb-6">Essay not found.</p>
          <Link
            to="/journal"
            className="hw-label text-[var(--hw-ink)] border border-[var(--hw-ink)] px-6 py-3 inline-block"
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
  const seriesMeta = getSeriesMeta(article.series_label || 'Human Weather');

  return (
    <div style={{ '--series-ink': seriesMeta.color }}>
      <header className="max-w-[740px] mx-auto px-6 pt-12 pb-8">
        <div className="w-12 h-px bg-[var(--series-ink)] mb-6" />
        <div className="hw-label text-[var(--series-ink)] mb-4">
          {isWatersEdge ? 'Featured Preview · ' : ''}
          {article.series_label || 'Human Weather'} · Essay {String(article.series_order || 1).padStart(2, '0')}
          {article.access_level === 'free' ? ' · Free' : ''}
        </div>
        <h1 className="scroll-mt-20 font-heading text-[32px] md:text-[44px] font-medium leading-[1.04] tracking-[-0.035em] text-[var(--hw-ink)] mb-4">
          {article.title}
        </h1>
        {article.subtitle && (
          <p className="font-serif text-2xl text-[var(--hw-muted)] mb-6">{article.subtitle}</p>
        )}
        {article.excerpt && (
          <p className="font-serif text-[19px] text-[var(--hw-ink2)] max-w-[68ch] mb-8 leading-[1.65]">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-4 pb-8 border-b border-[var(--hw-rule)]">
          <AuthorPortrait size="md" />
          <div className="flex flex-col gap-[2px]">
            <div className="hw-label text-[var(--hw-ink)]">{article.author_name || 'JP Bobo'}</div>
            <div className="hw-label text-[var(--hw-muted)]">
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
            <div className="hw-media-caption mt-2 text-center max-w-[740px] mx-auto px-6">
              {article.hero_image_caption}
            </div>
          )}
        </div>
      )}

      <article className="max-w-[68ch] mx-auto px-6 pb-16">
        <div className="article-body">
          <ReactMarkdown
            components={{
              hr: () => <div className="hw-ornament">—</div>,
              blockquote: ({ children }) => <blockquote>{children}</blockquote>,
              p: ({ children }) => <p>{children}</p>,
              h2: ({ children }) => (
                <h2 className="scroll-mt-20 font-heading text-2xl font-medium mt-12 mb-6 text-[var(--hw-ink)]">
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

        {bodyLocked && (
          <div className="mt-10 border-y border-[var(--hw-rule)] py-12 text-center bg-[var(--hw-surface)] px-6">
            <div className="hw-label text-[var(--hw-ink)] mb-4">Member reading</div>
            <h3 className="font-heading text-3xl font-medium text-[var(--hw-ink)] mb-3">
              {isWatersEdge ? 'The preview ends here.' : 'Continue the essay.'}
            </h3>
            <p className="font-serif text-[19px] text-[var(--hw-ink2)] mb-8 max-w-md mx-auto leading-[1.65]">
              {isWatersEdge
                ? `You've reached about ${WATERS_EDGE_PREVIEW_MINUTES} minutes of reading. Membership opens the rest of this essay and the members archive.`
                : 'Membership opens the rest of this essay and the members archive.'}
            </p>
            {checkoutError && (
              <p className="font-serif text-sm text-[var(--hw-muted)] mb-4" role="alert">{checkoutError}</p>
            )}

            {!isAuthenticated ? (
              <div className="max-w-md mx-auto">
                <Link
                  to={loginForYearly}
                  className="block bg-[var(--hw-ink)] text-[var(--hw-paper)] px-8 py-4 hw-label mb-4"
                >
                  Log in & start {yearlyPlan.trialDays}-day trial · {yearlyPlan.amountLabel}
                </Link>
                <p className="font-serif text-sm text-[var(--hw-muted)]">
                  New reader?{' '}
                  <Link
                    to={`/register?next=${encodeURIComponent(returnPath)}&plan=${encodeURIComponent(yearlyPlan.id)}`}
                    className="text-[var(--hw-ink)] underline"
                  >
                    Create an account
                  </Link>
                  {' · '}
                  <Link to="/subscribe" className="text-[var(--hw-ink)] underline">
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
                  className="w-full bg-[var(--hw-ink)] text-[var(--hw-paper)] px-8 py-4 hw-label disabled:opacity-60 mb-3"
                >
                  {checkoutPlan === yearlyPlan.id
                    ? 'Redirecting…'
                    : `Start ${yearlyPlan.trialDays}-day trial · ${yearlyPlan.amountLabel}`}
                </button>
                <button
                  type="button"
                  disabled={!!checkoutPlan}
                  onClick={() => handleCheckout(monthlyPlan.id)}
                  className="hw-label text-[var(--hw-ink)] underline disabled:opacity-60"
                >
                  {checkoutPlan === monthlyPlan.id ? 'Redirecting…' : `Prefer monthly? ${monthlyPlan.amountLabel}`}
                </button>
                <span className="mx-2 text-[var(--hw-muted)]">·</span>
                <Link to="/subscribe" className="hw-label text-[var(--hw-ink)] underline">
                  Compare plans
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-16 bg-[var(--hw-ink)] py-12 px-6 text-center">
          <p className="font-serif text-2xl text-[var(--hw-paper)] mb-2">What is your climate right now?</p>
          <a
            href="https://humanweather.social"
            target="_blank"
            rel="noopener noreferrer"
            className="hw-label text-[var(--hw-paper)] underline"
          >
            humanweather.social →
          </a>
        </div>
      </article>

      {freeCompanion && (
        <section className="max-w-[68ch] mx-auto px-6 py-14 border-t border-[var(--hw-rule)]">
          <div className="hw-label text-[var(--hw-muted)] mb-4">Read free in {article.series_label}</div>
          <Link to={`/journal/${freeCompanion.slug}`} className="group block">
            <h3 className="font-heading text-3xl font-medium text-[var(--hw-ink)] mb-2 leading-tight">
              {freeCompanion.title}
            </h3>
            {freeCompanion.subtitle && (
              <p className="font-serif text-lg text-[var(--hw-muted)] mb-3 leading-relaxed">
                {freeCompanion.subtitle}
              </p>
            )}
            {freeCompanion.excerpt && (
              <p className="font-serif text-lg text-[var(--hw-ink2)] mb-5 leading-relaxed">
                {freeCompanion.excerpt}
              </p>
            )}
            <span className="hw-label text-[var(--hw-ink)] border-b border-[var(--hw-ink)] pb-1">
              Read the full free essay →
            </span>
          </Link>
        </section>
      )}

      {related.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 py-16 border-t border-[var(--hw-rule)]">
          <div className="hw-label text-[var(--series-ink)] mb-6">Continue in {article.series_label}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {related.map(a => (
              <Link
                key={a.id}
                to={`/journal/${a.slug}`}
                className="group block border-t border-[var(--hw-rule)] pt-4"
              >
                <div className="hw-label text-[var(--hw-muted)] mb-2">
                  Essay {String(a.series_order || 1).padStart(2, '0')}
                  {a.access_level === 'free' ? ' · Free' : ' · Members'}
                </div>
                <h4 className="font-heading text-xl font-medium text-[var(--hw-ink)] mb-1">{a.title}</h4>
                {a.subtitle && (
                  <p className="font-serif text-sm text-[var(--hw-muted)]">{a.subtitle}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="py-20 px-6 border-t border-[var(--hw-rule)]">
        <NewsletterSignup source="article_footer" />
      </section>
    </div>
  );
}

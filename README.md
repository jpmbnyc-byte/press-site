# Base44 Project

Use this repository to run and edit the app locally, then publish changes back through Base44.

Any change pushed to the repo will also be reflected in the Base44 Builder.

## Prerequisites

1. Clone the repository using the project's Git URL.
2. Navigate to the project directory.
3. Install dependencies: `npm install`.
4. Install the Base44 CLI: `npm install -g base44@latest`.

See the [Base44 CLI docs](https://docs.base44.com/developers/references/cli/get-started/overview) if you want to run Base44 commands directly.

## Run Locally

```bash
base44 dev
```

For frontend-only work against the hosted backend:

```bash
npm run dev
```

## Deploy On Vercel (press site)

This repo is a Vite SPA. Content stays on Base44 at `https://humanweather.base44.app`. Vercel serves the frontend and proxies `/api/*` to that backend.

1. Import this GitHub repo in Vercel (framework preset: Vite, output: `dist`).
2. Production env is in `.env.production`.
3. Deploy. `vercel.json` rewrites `/api/*` → Base44 and SPA routes → `index.html`.

## Favicon & social share

- **Favicon:** day/night PNGs + SVG in `public/` (`favicon.svg`, `favicon-day.png`, `favicon-night.png`, `apple-icon.png`). Wired in `index.html` and theme-swapped in `src/lib/hwTheme.jsx`.
- **Default OG image:** `public/og-share.jpg` (1200×630) — home defaults in `index.html`.
- **Essay OG for crawlers:** Vercel Edge `middleware.js` serves essay-specific Open Graph HTML for bots on `/journal/:slug`. Browsers get client meta via `src/lib/pageMeta.js`.
- **Share links:** free essays show Copy / X / LinkedIn / Facebook / Email (plus native Share when available) via `EssayShareLinks` on the article page.

## Membership closed loop (auth + Stripe + paywall + app)

### Flow

1. Reader **creates an account / logs in** (`/register`, `/login`).
2. Chooses a plan on `/subscribe` → Base44 function `createCheckout` opens Stripe Checkout (7-day trial) with `client_reference_id = user.id` (requires backend functions capability).
3. Stripe webhook → Base44 function `stripeWebhook` sets User membership fields.
4. **Members essays** load via `fetchPressArticle()`: prefers `getPressArticle` when functions work; otherwise uses the public entity API and **client-gates** members `body_md` to a preview.
5. **Member + App bundle** (`member_app_yearly`) also sets `app_access` + `app_unlock_token` for **humanweather.social**.

### Members body gating

- Frontend always uses `fetchPressArticle(slug, user)` on essay pages.
- When Base44 backend functions are available: `getPressArticle` returns gated `body_md` (`body_gated` / `can_read_full`).
- **Current live plan:** Base44 returns `402 Functions are blocked - app owner lacks backend functions capability`, so the site falls back to `entities.Article` + client-side preview gating. Do **not** push admin-only FLS on `body_md` until functions are enabled — that would blank every essay.

### Bundle → PWA

- Unlock URL pattern: `https://humanweather.social/?hw_unlock=1&email=…&token=…`
- Verification API (for the PWA):  
  `POST https://humanweather.base44.app/functions/verifyAppAccess`  
  body: `{ "email": "…", "token": "…" }` → `{ access: true|false, … }`

### Deploy backend (when functions are unlocked)

From repo root (must be logged into Base44 CLI):

```bash
npx base44 login
npx base44 functions deploy  # getPressArticle + Stripe functions
# Set secrets in Base44 dashboard or via CLI if available:
# STRIPE_SECRET_KEY
# STRIPE_WEBHOOK_SECRET
# STRIPE_PRICE_MEMBER_MONTHLY=price_1TvRUwL5xkl5Azg8hpLAksIu
# STRIPE_PRICE_MEMBER_YEARLY=price_1TvRUxL5xkl5Azg8b4m7xmZh
# STRIPE_PRICE_MEMBER_APP_YEARLY=price_1TvRUyL5xkl5Azg8afW0Kfau
# SITE_URL=https://www.humanweather.press
# HW_SOCIAL_APP_URL=https://humanweather.social
```

Only after functions work, consider locking `Article.body_md` with FLS and pushing entities.

Point the Stripe webhook (live) to:

```
https://humanweather.base44.app/functions/stripeWebhook
```

Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

### User fields

See `base44/entities/User.jsonc`: `stripe_customer_id`, `membership_plan`, `membership_status`, `membership_period_end`, `app_access`, `app_unlock_token`, `app_access_granted_at`.

## Docs & Support

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)

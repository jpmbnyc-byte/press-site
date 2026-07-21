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

Run the full local development environment from the project root:

```bash
base44 dev
```

`base44 dev` starts the local Base44 development backend and, when this app is configured for it, also starts the frontend dev server for you. Use the frontend URL printed by the command.

For example, when the Base44 project config includes a `serveCommand`, `base44 dev` can launch the frontend too:

```json5
{
  "site": {
    "serveCommand": "npm run dev"
  }
}
```

In a Base44 project this lives in `base44/config.jsonc`.

## Run Only The Frontend

If you only want to work on the frontend against the hosted Base44 backend, run:

```bash
npm run dev
```

Open the local URL printed by Vite.

## Use The Hosted Backend

For frontend-only development, create or update `.env.local` in the project root:

```bash
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

`VITE_BASE44_APP_ID` identifies the Base44 app.

`VITE_BASE44_APP_BASE_URL` tells the Base44 Vite plugin where to send local `/api` requests. Point it at your deployed Base44 app URL when you want the local frontend to use the hosted backend.

When you use `base44 dev`, the command injects the local Base44 values for you, so `.env.local` is mainly needed for frontend-only workflows.

## Publish Your Changes

After pushing your changes to git, open the Base44 dashboard and publish the app:

```bash
base44 dashboard open
```

## Deploy On Vercel (press site)

This repo is a Vite SPA. Content (essays, series, newsletter) stays on the hosted Base44 backend at `https://humanweather.base44.app`. Vercel serves the frontend and proxies `/api/*` to that backend.

1. Import this GitHub repo in Vercel (framework preset: Vite, output: `dist`).
2. Production env is already set in `.env.production` (`VITE_BASE44_APP_ID`, `VITE_BASE44_APP_BASE_URL`). You can override the same keys in the Vercel dashboard if needed.
3. Deploy. `vercel.json` rewrites:
   - `/api/*` → `https://humanweather.base44.app/api/*`
   - all other routes → `/index.html` (SPA routing)

What ships from this build: Home, Journal, Article, Series, About, Subscribe, Gospels, theme, newsletter form, and reading UI — all reading/writing Base44 entities at runtime.

## Stripe memberships (live Checkout)

Subscribe CTAs use Stripe Checkout Sessions (`mode: subscription`) with a 7-day trial. Server routes live under `/api/stripe/*` on Vercel (not proxied to Base44).

| Plan | Price | Checkout `planId` |
|------|--------|-------------------|
| Member monthly | $9/mo | `member_monthly` |
| Member yearly | $72/yr | `member_yearly` |
| Member + App | $96/yr | `member_app_yearly` |

### Connect your Stripe account

1. Create a [restricted API key](https://docs.stripe.com/keys/restricted-api-keys) with permissions to manage Products, Prices, Checkout Sessions, Billing Portal, and Webhooks (use `rk_live_…` for production).
2. From the repo root, create products/prices (and optional Payment Links):

```bash
STRIPE_SECRET_KEY=rk_live_... SITE_URL=https://humanweather.vercel.app npm run stripe:setup
```

3. In the Vercel project → Settings → Environment Variables, add what the script prints:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_MEMBER_MONTHLY`
   - `STRIPE_PRICE_MEMBER_YEARLY`
   - `STRIPE_PRICE_MEMBER_APP_YEARLY`
   - `SITE_URL=https://humanweather.vercel.app`
   - `STRIPE_WEBHOOK_SECRET` (after step 4)
4. In Stripe Dashboard → Developers → Webhooks, add endpoint:
   - URL: `https://humanweather.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the signing secret into `STRIPE_WEBHOOK_SECRET`
5. Redeploy Vercel so the new env vars apply.
6. Smoke-test: open `/subscribe` → Start Free Trial → complete Checkout with a [test card](https://docs.stripe.com/testing) in test mode, or a real card in live mode.

Billing portal: “Manage existing membership” on `/subscribe` (needs a prior Checkout `session_id` or customer id).

Local tip: Stripe API routes need the Vercel runtime (`vercel dev`) or a deployed preview; plain `npm run dev` only proxies `/api` to Base44.

## Docs & Support

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Base44 CLI command reference: [https://docs.base44.com/developers/references/cli/commands/introduction](https://docs.base44.com/developers/references/cli/commands/introduction)

Support: [https://app.base44.com/support](https://app.base44.com/support)

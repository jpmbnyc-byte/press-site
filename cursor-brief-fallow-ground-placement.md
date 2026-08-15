# Cursor brief — publish "The Fallow Ground" to humanweather.press

## Rule zero

Do not invent a template. Find how `relational-faith-the-mirror-at-the-waters-edge`
is stored and rendered, and replicate that path exactly. New essay, same machinery.
If a field exists on that essay and is not specified below, ask rather than guess.

Locate first, then edit:
- the route/page for `/journal/relational-faith-the-mirror-at-the-waters-edge`
- the data source behind it (MDX file, JSON/TS content array, CMS fetch, Ghost API)
- the Relational Faith series index and whatever component lists its essays
- the No Parade series index, and how an empty series currently renders
- the site-wide journal index, if separate from the series index

Report those four paths back before writing anything.

---

## Canonical values

| Field | Value |
|---|---|
| Title | The Fallow Ground |
| Subtitle | A year of work with no crop, four years of keeping a record honest, and what the first rain is actually for. |
| Series | No Parade |
| Position | Essay 01 of 7 — series debut |
| Slug | `no-parade-the-fallow-ground` |
| Full path | `/journal/no-parade-the-fallow-ground` |
| Word count | 1,829 |
| Reading time | 9 min |
| Scripture | Hosea 10:12 |
| Meta description | Hosea tells a man to sow and reap before he tells him to break ground. On fallow, crust, and the rain that arrives at the start of a season. |

Reading time is measured, not estimated. If the template computes it from a
words-per-minute constant, check the constant produces 9 and hard-code it if not.

---

## Body handling

Source file: `the-fallow-ground-draft-07.md`.

- Section breaks in the source are `---`. They must render as the same rule
  element RF04 uses. There are **no section headings** and none may be added.
- Italics carry Hebrew and Latin transliteration — *nîrû lakem nîr*, *nîr*,
  *yārâ*, *yoreh*, *torah*, *docebit*, and *fallow* at first mention. Preserve
  the circumflex and macron characters; do not normalize to ASCII.
- Scripture is blockquoted and italicized where it appears in full.
- No pull quotes, no drop caps, no author bio block, no "related reading"
  module, unless RF04 already carries them.

---

## Placement

This is the first essay to exist in the No Parade series. Expect the series
to be currently rendering as an empty or placeholder state — find that state
and make sure it now renders a populated series with one entry, not a
one-item list inside a shell built for zero.

1. Add to the No Parade series index as essay 01.
2. Add to the journal index in reverse-chronological position.
3. No previous/next links — nothing precedes or follows it yet. Confirm the
   template degrades cleanly rather than rendering empty arrows.
4. If the No Parade series has a landing description, confirm it still reads
   correctly now that a reader can click through to something.

## Gating

Free. Site rule is first essay of each series free, and this is the debut.
Confirm no membership check fires on this route, and that it is reachable
by a logged-out visitor in a fresh browser session — test that specifically,
because a gate that only appears to logged-out users is the failure mode
that ships unnoticed.

## One thing worth fixing while you're in there

A fetch of `humanweather.press` returns the `<head>` and nothing else — title,
description, and social tags are present, but no body content in the served
HTML. That is consistent with client-side rendering.

If essay bodies aren't in the initial HTML response, then search crawlers,
link-preview scrapers, and readability tools get an empty page. For a site
whose entire product is long-form text, that's expensive.

Ask Cursor to confirm whether `/journal/*` routes are statically generated or
server-rendered. If they're client-only, that's a separate ticket and a real
one — but check before assuming, because a crawler and a raw fetch don't
always see the same thing.

---

## Hero image

### Rule zero applies here too

Check whether `relational-faith-the-mirror-at-the-waters-edge` carries a hero
image. If it does, match its aspect ratio, position, caption treatment and
loading strategy exactly. If it does not, this essay introduces the pattern
for the site and the implementation below becomes the template — flag that
before building it.

### Technical spec

- Master: 2400 × 1600 (3:2), sRGB, WebP with JPEG fallback
- Social crop: 1200 × 630, generated from the master, not a separate shot
- Hero is the LCP element: eager loading, `fetchpriority="high"`, explicit
  width and height attributes to prevent layout shift
- Responsive `srcset` at 2400 / 1600 / 1200 / 800
- No text overlay, no gradient scrim, no title burned into the image
- No caption unless the Mirror essay carries one
- Alt text: `Bare tilled soil under flat overcast light, furrow lines running
  out of frame, nothing growing.`

### Art direction

Kinfolk register: flat diffuse daylight, muted and desaturated, generous
negative space, matte finish, no gloss, no saturation, no lens flare, subject
placed off-center with the frame mostly empty. Film grain acceptable. Shallow
depth acceptable. Composition still and unpeopled.

**Subject: bare worked ground, shot from above or at a low oblique angle.**
Furrow lines visible. Soil dry, grey-brown, faintly cracked at the surface.
Crop tight enough that scale is ambiguous — the viewer should not immediately
read "farm."

### Non-negotiable exclusions

The essay ends before the harvest. The image has to end there too.

- No green. No seedlings, no shoots, no growth of any kind
- No golden hour, no warm backlight, no sunbeams
- No hands, no people, no boots, no tools held by anyone
- No sunrise, no horizon line, no sky as subject
- No rain visibly falling — standing water on a hard surface is permitted,
  falling rain is not
- No wheat, no harvest, no baskets, no abundance

Anything on that list converts the picture into the consolation the essay
spent nine minutes refusing.

### Generation prompt, if generating

> Overhead photograph of bare, dry, freshly worked farm soil. Flat overcast
> daylight, no shadows, no sun. Muted grey-brown earth tones, desaturated,
> matte. Visible furrow lines running diagonally out of frame. Fine surface
> cracking. Nothing growing. No people, no tools, no sky, no horizon. Wide
> empty composition, generous negative space, editorial still-life framing.
> Medium format film look, subtle grain, shallow depth of field.
> — negative: green, plants, seedlings, sunrise, golden hour, warm light,
> hands, people, sky, rain, wheat, harvest, vibrant color, HDR

A photograph you take yourself would be better than either stock or
generation. Bare ground in flat light is one of the few subjects genuinely
available to anyone with a phone and an overcast morning, and a real one will
not carry the faint sameness that stock and generated field imagery both have.

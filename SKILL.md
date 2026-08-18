---
name: the-savvy-expat-design-system
description: >-
  The design system and coding conventions for The Savvy Expat — a Next.js 14
  App Router site (VSL homepage, newsletter archive backed by beehiiv, squeeze
  page). Read this before making any visual or structural change so new work
  matches the existing site instead of drifting from it.
---

# The Savvy Expat — Design System & Conventions

A Next.js 14 (App Router) site for a Philippines-relocation newsletter/coaching
brand. Three surfaces: `/` is a VSL (video sales letter) homepage for the
coaching offer, `/newsletter` is a categorized archive of beehiiv newsletter
issues, `/subscribe` is a minimal squeeze page. Premium editorial feel: soft
lavender fields, one accent purple, heavy black type, generous white space,
subtle motion everywhere.

**Rule of thumb: reuse what's below before inventing something new.** Every
utility class, component, and pattern here is already used in multiple places.
A new page or section should look like it was built by the same hand as
everything else — check this file first.

---

## Colors

Defined in `tailwind.config.ts` under `theme.extend.colors` — use the Tailwind
names (`bg-primary`, `text-ink/60`, etc.), never hardcode these hexes in a
className unless matching an inline-style edge case (gradients, box-shadows).

| Token | Hex | Tailwind class | Use |
|---|---|---|---|
| `primary` | `#4934FB` | `bg-primary` / `text-primary` | Buttons, links, active states, accent |
| `primary-soft` | `#7A5CFF` | `bg-primary-soft` | Gradient endpoint (paired with `primary`) |
| `ink` | `#041630` | `text-ink` | All body/heading text (never pure black) |
| `on-primary` | `#FFFFFF` | `text-on-primary` | Text on solid-purple backgrounds |
| `line` | `#E3E3E3` | `border-line` | Rare hairline borders (mostly superseded by `ring-ink/10`) |
| `lavender` | `#F4F2FF` | `bg-lavender` | Image-placeholder / empty-state fill |
| page background | `#E9E7F4` | set directly in `globals.css` `body{}` | The site's base — NOT white |
| card white | `#FFFFFF` | `bg-white` | Cards that need to pop off the lavender base |

**The page background is lavender (`#E9E7F4`), not white.** Cards sit on top
of it in one of two fills — pick by whether it needs to pop or blend:

- **`bg-white`** — grid cards, modals, form inputs. High contrast, "this is
  clickable/interactive."
- **`.card-soft`** (soft lavender→white diagonal gradient, own shadow) — stat
  tiles, service cards, quote cards, subscribe panels, newsletter content card.
  Lower contrast, "this belongs to the page."

  If something looks "too white" against the rest of the site, it should
  almost always become `.card-soft`, not a different white.

**Category color system** (`lib/categories.ts`) — six fixed hues, one per
newsletter topic, used for badge chips, filter-pill dots, and nothing else.
Never invent a 7th; recategorize into the closest existing one:

| id | Label | Chip | Dot |
|---|---|---|---|
| `stories` | Client Stories | `bg-amber-100 text-amber-700` | `bg-amber-500` |
| `money` | Cost of Living & Money | `bg-emerald-100 text-emerald-700` | `bg-emerald-500` |
| `guides` | Lifestyle & Guides | `bg-sky-100 text-sky-700` | `bg-sky-500` |
| `visas` | Visas & Residency | `bg-violet-100 text-violet-700` | `bg-violet-500` |
| `housing` | Housing & Real Estate | `bg-rose-100 text-rose-700` | `bg-rose-500` |
| `healthcare` | Healthcare | `bg-teal-100 text-teal-700` | `bg-teal-500` |

Filter *buttons* (the pill you click) stay on the neutral primary/white
interaction language (`bg-primary` when active, `bg-white ring-1 ring-ink/10`
when not) — only the small dot swatch and the passive badge chip use the
per-category color. Don't recolor the active/selected state per category.

---

## Typography

**Single font family for everything — Satoshi.** No serif, no second display
face. Loaded via Fontshare in `app/layout.tsx`:

```html
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap" rel="stylesheet" />
```

`tailwind.config.ts` maps both `font-sans` and `font-serif` to Satoshi — if
you ever see `font-serif` in older code it still resolves to Satoshi, it's not
a real second typeface.

- **Headings:** `font-black` (900) almost everywhere, `tracking-tight`,
  `leading-tight`/`leading-[1.1]`. Sizes scale `text-3xl sm:text-4xl` (section
  h2) up to `text-4xl sm:text-6xl` (hero h1). Never `font-bold` for a real
  heading — it reads weak next to the rest of the site.
- **Body copy:** default weight, `text-ink/60`–`/70` (never solid `text-ink`
  for paragraph text — always a muted opacity).
- **Eyebrow / labels / bylines:** small, `font-bold` or `font-black`,
  `uppercase`, `tracking-wider`/`tracking-[0.14em]`, `text-ink/40`–`/45`.
  Byline pattern used everywhere content has an author+date:
  `AUTHOR • DATE` — literally rendered as text + a small
  `<span className="text-primary/50">&bull;</span>` + date, inside a
  `flex items-center gap-1.5` container (the gap creates the visual space
  around the bullet; don't add literal space characters).

---

## Spacing & layout scale

- **Page container widths:** `max-w-3xl` (prose/forms), `max-w-4xl` (hero
  copy), `max-w-5xl` (CTA panels), `max-w-6xl` (grids, most section content).
  Always `mx-auto px-6`.
- **Section vertical rhythm:** `py-20` is the default section padding; hero
  sections use `pb-16 pt-10 sm:pt-14`. Sections stack directly — no manual
  margin between them, the padding does the work.
- **Border radius scale** (bigger container = bigger radius):
  - `rounded-xl` — buttons, inputs, small pills
  - `rounded-2xl` — icon containers, images inside cards
  - `rounded-3xl` — cards (the default "this is a card" radius)
  - `rounded-[2rem]` / `rounded-[2.5rem]` — big feature panels, hero images,
    the newsletter content card
- **Card padding:** `p-6` (grid card), `p-8 sm:p-12`–`p-14` (large content
  panel), `p-9` (step cards).
- **Grid gaps:** `gap-5`/`gap-6` for card grids, `gap-x-8 gap-y-10` for looser
  editorial grids.

---

## Core utility classes (`app/globals.css`)

Reach for these before writing new one-off CSS.

```css
.bg-hero        /* soft white radial sheen top-of-section, sits on the lavender body */
.bg-sheen       /* fainter, centered version of the same sheen — mid-page sections */
.bg-glow-purple /* broad soft purple radial wash — one dramatic section per page, not overused */
.card-soft      /* soft lavender→white diagonal gradient + own box-shadow — see Colors above */
.btn-shine      /* animated light-sweep overlay on a button; add alongside bg-primary */
.reveal         /* scroll-fade-up base class — see Reveal component below */
.marker-highlight /* inline bg-primary text-white "highlighter" effect for emphasized phrases */
.post-content   /* wraps any raw beehiiv HTML — see beehiiv integration below */
```

`.btn-shine` usage — always paired with a solid `bg-primary` button, never
used alone:

```tsx
<a className="btn-shine rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3d2ae8]">
  Call To Action
</a>
```

Custom `boxShadow` tokens (`tailwind.config.ts`): `shadow-card` (subtle,
default card elevation), `shadow-glow` (purple-tinted, for primary buttons/
active states), `shadow-glow-lg` (bigger version for hero elements).

---

## Component patterns (`components/`)

- **`Reveal`** — wraps any block that should fade+slide up on scroll.
  `<Reveal delay={100}>...</Reveal>`. Uses IntersectionObserver at
  `threshold: 0` (not a percentage — a tall block like a long list may never
  cross a % threshold), a scroll-position fallback for instant jumps, **and**
  a hard 2.5s `setTimeout` safety net so nothing can ever get stuck invisible.
  Stagger siblings with `delay={i * 100}`. Don't reinvent this per-page.
- **`CountUp`** — animates a number from 0 on scroll-into-view (`end`,
  `suffix`). Same IO + scroll-fallback + timeout-safety pattern as `Reveal`.
- **`BookCallButton`** — the canonical CTA button + `TrustBadge` underneath.
  `size="lg" | "md"`, `withBadge` to hide the badge. Hardcodes the booking
  URL — this is the one component allowed to do that.
- **`TrustBadge`** — the 5-client-avatar stack + star rating + "Trusted by
  50+ Expats 🇵🇭" line, pulled from the live Framer site's real client photos.
  Reused under every CTA button and at the bottom of `/newsletter`.
- **`Header` / `Footer`** — global chrome, included on every page. Header is
  `sticky top-0` with a blurred lavender background
  (`bg-[#E9E7F4]/80 backdrop-blur-xl`). Nav is deliberately minimal: logo,
  a secondary "Newsletter" pill (white, ring-primary/25), primary "Book A
  Call" button. Don't add more nav items without a strong reason — the site
  is intentionally single-CTA-focused.
- **`YouTubeEmbed`** — lite-loading video: renders a static thumbnail +
  play-button overlay, only mounts the real `<iframe>` on click. Accepts a
  custom `thumbnail` prop (falls back to YouTube's own `hqdefault.jpg`).
  Always use this instead of embedding a raw iframe — it's the difference
  between a fast page and a slow one when a page has 5+ videos.
- **`LottieIcon`** — fetches and plays a Lottie JSON animation client-side.
  Used for the animated service icons on the homepage (sourced from the
  brand's real Framer/Lordicon assets, not hand-drawn).
- **`NewsletterGrid`** — the category-filter-pills + search-box + responsive
  card grid used on `/newsletter`. Exports the `NewsletterPost` type; any
  future post-listing UI should reuse this component rather than building a
  parallel one.

**Icons are always inline SVG, hand-written per use** — no icon library
dependency. Standard pattern: `viewBox="0 0 20 20"`, `fill="currentColor"`,
`aria-hidden="true"`, sized via `className="h-4 w-4"` etc. Small icon
components are defined locally at the top of the page/component file that
uses them (e.g. `ArrowIcon`, `MailIcon`) rather than centralized — that's the
established convention here, keep following it.

---

## Motion conventions

- Hover lifts: `hover:-translate-y-0.5` (buttons/pills) to
  `hover:-translate-y-1.5` (cards) + a shadow change, `transition-all
  duration-300`.
- Image zoom-on-hover inside cards: `group` on the card, `transition-transform
  duration-500 group-hover:scale-105` on the `<Image>`.
- Everything respects `prefers-reduced-motion` — animations are disabled in a
  media query at the bottom of `globals.css`. If you add a new CSS animation,
  add it to that block too.
- Marquee rows (`animate-marquee` / `animate-marquee-slow`) pause on hover via
  `.marquee-row:hover` — wrap any new marquee in a `.marquee-row` div to get
  this for free.

---

## Page architecture (App Router)

```
app/
  layout.tsx              — root layout, Satoshi font link, global metadata
  globals.css              — see above
  page.tsx                 — "/" — the VSL homepage
  subscribe/page.tsx        — "/subscribe" — minimal squeeze page
  watch/page.tsx            — redirects to "/" (the VSL used to live here)
  newsletter/
    page.tsx                — archive: featured post + category grid + subscribe CTA
    [id]/page.tsx            — single newsletter reading page
    [id]/not-found.tsx        — styled 404 for a bad newsletter id
  api/subscribe/route.ts    — POSTs an email to beehiiv's subscribe endpoint
components/                — all shared UI, PascalCase file = default export
lib/
  beehiiv.ts                — all beehiiv API calls + data-cleaning (see below)
  categories.ts              — the category taxonomy + auto-classifier
types/beehiiv.ts             — hand-written types for the beehiiv API shapes used
```

- **Server Components by default.** Data fetching (`getPosts`, `getPost`)
  happens in the page component, server-side, so the beehiiv API key never
  reaches the client. Only mark a component `"use client"` when it needs
  state or browser APIs (forms, `Reveal`, `NewsletterGrid`'s filtering,
  `CountUp`, `LottieIcon`, `YouTubeEmbed`).
- **`next/image` for every image**, with `remotePatterns` in
  `next.config.mjs` allow-listing the specific external hosts actually used
  (`*.beehiiv.com`, the beehiiv S3 bucket, `framerusercontent.com`,
  `i.ytimg.com`). Adding a new external image host means adding it there
  first or the build will reject it.
- **Env vars:** `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID` — read server-side
  only via `lib/beehiiv.ts`'s `getConfig()`. Never reference
  `process.env.BEEHIIV_*` directly from a page or component.

---

## beehiiv integration — hard-won gotchas

These cost real debugging time; don't rediscover them.

1. **Use the `rss` content variant, never `web`, for embedding a post's
   body.** `free.web` is a *complete standalone HTML document* (its own
   `<!DOCTYPE>`, stylesheet, fonts, and a duplicate title/byline/avatar/
   share-icon header) — dropping it into the page via
   `dangerouslySetInnerHTML` doubles the header and leaks beehiiv's CSS
   variables into the site's global styles. `free.rss` is a clean
   content-only fragment. `getPost()` already requests
   `expand[]=free_rss_content` — keep it that way.
2. **Every post's rss content needs two things stripped**, both handled in
   `lib/beehiiv.ts`:
   - `stripLeadingBodyImage` — the body opens with the same image already
     shown as the page's own hero image; without stripping it, it shows
     twice.
   - `stripBeehiivFooter` — beehiiv auto-appends a "Powered by beehiiv" promo
     link with UTM tracking to the end of every rss export.
3. **beehiiv wraps every content block in a bordered "section" div** with
   hardcoded inline styles (light background + purple border) — this is
   beehiiv's own editor default, not the author's deliberate choice.
   Neutralized globally in `globals.css` via `.post-content .section` with
   `!important` (inline styles otherwise win). If new visual noise from
   beehiiv's export shows up, the fix pattern is the same: inspect the raw
   HTML, find what's actually beehiiv-default vs. author-authored, and
   neutralize only the default.
4. **The author always opens a newsletter with an `<h1>` reading-time badge**
   (e.g. "3 MIN READ") — real section headings are always `<h2>+`. This let
   `.post-content h1` be safely restyled globally as a small pill badge
   without touching real headings.
5. **Posts with no thumbnail fall back to the publication logo** in the
   beehiiv API response. `isLogoFallback()` detects that specific asset path
   and `backfillThumbnail()` substitutes the post's own first content image
   instead — never let the raw logo-fallback URL render as a thumbnail.
6. **Pagination:** `getPosts()` pages through at 100/page until it runs out —
   the beehiiv API paginates and a single unpaged request silently truncates
   at 20.
7. **Hiding a post from the site ≠ deleting it in beehiiv.** `HIDDEN_POST_IDS`
   in `lib/beehiiv.ts` is a local exclusion list for posts that shouldn't
   show on `/newsletter` (test posts, etc.) — it never calls a destructive
   beehiiv API. Add an id + a comment naming the post's title when hiding one.
8. **Newsletter categorization is automatic, not manual.** beehiiv's own
   `content_tags` field is unused on this publication. `categorizePost()` in
   `lib/categories.ts` keyword-matches title+subtitle against each category
   in a fixed priority order (visa → healthcare → narrative-story-pattern →
   housing → money → default "guides"). New posts get categorized
   automatically on next fetch — nothing to maintain per-post.

---

## Coding conventions

- **TypeScript, strict mode.** Regex flags: this project's `tsconfig.json`
  target doesn't support the `/s` (dotall) flag — use `[\s\S]*?` instead of
  `.*?` with `/s` when a regex needs to match across newlines.
- **Comments:** sparse, and only to explain *why*, never *what* — e.g. "beehiiv
  auto-appends X, so we strip it" is a good comment; "loops over posts" is
  not. Match this density; don't add narration comments to straightforward
  JSX.
- **No CSS modules, no styled-components** — Tailwind utility classes only,
  with the shared one-off patterns promoted into `globals.css` (see Core
  utility classes above) once used more than once.
- **Server actions/mutations:** the one write path is `app/api/subscribe/
  route.ts`, a plain Route Handler POSTing to beehiiv's subscribe endpoint —
  follow that pattern (validate input, server-side fetch with the API key,
  return a typed JSON response) for any future write endpoint.
- **Dev server:** `npm run dev`. It does not persist across a machine
  reboot/session reset — if the site "goes down," it usually just means the
  process died; restart it, don't assume the code broke.

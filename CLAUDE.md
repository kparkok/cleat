@AGENTS.md

# Cleat

Cleat is a member-experience platform for marinas — for any boat owner
(liveaboard, weekend/seasonal, or storage-only), not just liveaboards. It has
two distinct sides: a mobile-first **member app** and a desktop **staff
portal**. This is the Phase 1 MVP: real screens and layouts against mock
data, no backend yet.

Design reference: `design/cleat-full-overview.html` (all 10 screens, colors,
typography, component style) and `design/cleat-home-variants.html` (three
home-screen layout directions — Variant A, hero banner + tide strip, is the
one in use).

## Tech stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Fonts: Fraunces (serif, headings), Inter (sans, body), Space Mono (labels/meta)
- Design tokens (navy/dock/seaglass/coral/paper palette) defined via `@theme`
  in `src/app/globals.css` — generates utilities like `bg-navy`, `text-dock`,
  `border-line`
- No database yet — all content comes from `src/lib/data.ts`

## Route structure

Two route groups under `src/app/`, each with its own layout:

- **`(member)`** — mobile-first, phone-frame shell (`src/app/(member)/layout.tsx`)
  capped to a max-width column. Nested `(app)` group adds the bottom tab bar
  (Home / News / You) via `src/components/member/TabBar.tsx`.
  - `onboarding/` — usage-type selection (liveaboard / weekend & seasonal /
    storage-only). Full-bleed, no tab bar.
  - `marinas/` — marina search + switcher, with member-vs-visiting modal.
    Full-bleed, no tab bar.
  - `(app)/home/` — Variant A home: hero banner (gradient/dock-silhouette
    placeholder by default, swaps to a real photo once a marina uploads
    `bannerImageUrl`), tide/wind/water-temp strip, latest announcement, 2
    quick tiles, office info-link.
  - `(app)/news/` — marina board / community board toggle (official vs.
    member-run posts).
  - `(app)/contacts/` — marina staff + emergency contacts, tap-to-call. This
    is also the "You" tab's content (the mockup doesn't design a separate
    profile screen — `(app)/you/page.tsx` just redirects here).
- **`(staff)`** — desktop sidebar layout (`src/components/staff/Sidebar.tsx`).
  - `dashboard/` — stat cards + recent announcements table.
  - `members/` — member list with usage type + verification status
    (verified / visiting / pending).
  - `announcements/new/` — announcement composer (category, title, message,
    publish/save-as-draft).

Root `src/app/page.tsx` redirects to `/onboarding`.

## Mock data

- `src/lib/types.ts` — all domain types (`Announcement`, `CommunityPost`,
  `Contact`, `CurrentMarina`, `StaffMember`, etc.) plus shared label maps
  (`USAGE_LABELS`, `ANNOUNCEMENT_CATEGORY_LABELS`, `ANNOUNCEMENT_STATUS_LABELS`).
- `src/lib/data.ts` — the actual sample data (Shilshole Bay Marina). Every
  page reads from here; nothing is hardcoded in components. Swap this module
  for real data fetching once the database exists.

## PWA

`public/manifest.webmanifest` + generated icons in `public/icons/`
(192/512/512-maskable/apple-touch-icon), wired into `src/app/layout.tsx`
metadata. Installable as a PWA.

## Build status

**Done:** full member flow (onboarding → home → news → contacts/you →
marina switcher) and full staff flow (dashboard, members, composer), all
verified rendering with zero console errors via Playwright screenshots.

**Explicitly out of scope for Phase 1** (per `design/cleat-full-overview.html`):
issue reporting, marina map, events, and a separate Documents section. Marina
rules/emergency info live as pinned posts on the marina board instead.

**Next up:** wire a real database/backend in place of `lib/data.ts`; nothing
else is currently in progress.

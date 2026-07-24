@AGENTS.md

# Cleat

Cleat is a member-experience platform for marinas — for any boat owner
(liveaboard, weekend/seasonal, or storage-only), not just liveaboards. It has
two distinct sides: a mobile-first **member app** and a desktop **staff
portal**. This is the Phase 1 MVP: real screens and layouts against mock
data, no backend yet.

Design reference: `design/cleat-full-overview.html` (all 10 original
screens, colors, typography, component style), `design/cleat-home-variants.html`
(three home-screen layout directions — Variant A, hero banner + tide strip,
is the one in use), and `design/cleat-marina-profile.html` (the marina
profile screen + amenity chips on search results).

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
  capped to a max-width column, wrapped in `MarinaProvider` (see below).
  Nested `(app)` group adds the bottom tab bar (Home / News / You) via
  `src/components/member/TabBar.tsx`.
  - `onboarding/` — usage-type selection (liveaboard / weekend & seasonal /
    storage-only). Full-bleed, no tab bar.
  - `marinas/` — marina search + switcher, with member-vs-visiting modal.
    Full-bleed, no tab bar. Excludes only the *currently active* marina from
    the list — marinas you already belong to (home or visiting) still show
    up, tagged accordingly, so you can switch back to them.
  - `(app)/home/` — Variant A home: hero banner (gradient/dock-silhouette
    placeholder by default, swaps to a real photo once a marina uploads
    `bannerImageUrl`), tide/wind/water-temp strip, latest announcement, 2
    quick tiles, office info-link (→ `/marina`).
  - `(app)/news/` — marina board / community board toggle (official vs.
    member-run posts).
  - `(app)/contacts/` — marina staff + emergency contacts, tap-to-call, plus
    a "Switch or add a marina" link (→ `/marinas`). This is also the "You"
    tab's content (the mockup doesn't design a separate profile screen —
    `(app)/you/page.tsx` just redirects here).
  - `(app)/marina/` — marina profile: status strip (verified/staff-managed vs.
    community-run), hours card (today emphasized, separate fuel dock hours),
    amenities grid split into staff-verified (solid tiles) and
    member-submitted (dashed tiles), "Suggest an amenity" prompt (UI only,
    doesn't persist).
- **`(staff)`** — desktop sidebar layout (`src/components/staff/Sidebar.tsx`).
  - `dashboard/` — stat cards + recent announcements table.
  - `members/` — member list with usage type + verification status
    (verified / visiting / pending).
  - `announcements/new/` — announcement composer (category, title, message,
    publish/save-as-draft).

Root `src/app/page.tsx` redirects to `/onboarding`.

## Mock data & multi-marina state

- `src/lib/types.ts` — all domain types. `Marina` is the full per-marina
  shape (conditions, hours, amenities, office, etc.) — the same shape is
  used whether a marina is the member's active one or just a search result,
  so switching is just pointing at a different record, not fetching
  differently-shaped data. Other types: `Announcement`, `CommunityPost`,
  `Contact`, `StaffMember`, `Amenity`/`AmenityIconId`, `MemberMarinaMembership`
  (`{ marinaId, role: "home" | "visiting" }`), plus shared label maps
  (`USAGE_LABELS`, `ANNOUNCEMENT_CATEGORY_LABELS`, `ANNOUNCEMENT_STATUS_LABELS`).
- `src/lib/data.ts` — `sampleMarinas: Marina[]` holds all 4 sample marinas
  (Shilshole Bay, Fairhaven, Elliott Bay, Port Townsend — the last is
  community-run, so all its amenities are member-submitted, none verified).
  `defaultMemberMarinas` seeds a new member with just their home marina.
  `staffManagedMarina` is a fixed lookup (Shilshole) for the staff portal,
  which is intentionally *not* wired to the member's marina-switching state.
- `src/components/member/MarinaProvider.tsx` — client-side React Context
  wrapping the whole `(member)` route group. Holds `activeMarina` (derived)
  and `memberMarinas`, exposes `switchMarina(marinaId, role)`. Designating a
  new "home" demotes the previous home to "visiting" rather than dropping
  it. Persisted to `localStorage` (hydrated post-mount to avoid SSR
  mismatch) so the active marina survives a hard reload. Any member page
  needing the active marina calls `useMarina()` instead of importing static
  data — this is why Home/News/Contacts/marina-profile/onboarding are all
  client components.
- Everything else (announcements, contacts, staff members) is still global
  mock data, not yet modeled per-marina — a known simplification, not a bug.

## PWA

`public/manifest.webmanifest` + generated icons in `public/icons/`
(192/512/512-maskable/apple-touch-icon), wired into `src/app/layout.tsx`
metadata. Installable as a PWA.

## Build status

**Done:** full member flow (onboarding → home → news → contacts/you →
marina profile → marina switcher, with working multi-marina state) and full
staff flow (dashboard, members, composer). All verified end-to-end via
Playwright (including the switch-marinas-back-and-forth loop and persistence
across hard reloads) with zero console errors and zero TypeScript errors.

**Explicitly out of scope for Phase 1** (per `design/cleat-full-overview.html`):
issue reporting, marina map, events, and a separate Documents section. Marina
rules/emergency info live as pinned posts on the marina board instead.

**Next up:** no active task. The last identified priority was wiring a real
backend/database in place of `lib/data.ts` (today even the "active marina"
state is client-only, persisted per-browser via `localStorage`, not tied to
a real account) — but confirm with the user before assuming that's next.

@AGENTS.md

# Cleat

Cleat is a member-experience platform for marinas — for any boat owner, not
just liveaboards. It has two distinct sides: a mobile-first **member app**
and a desktop **staff portal**. This is the Phase 1 MVP: real screens and
layouts against mock data, no backend yet.

Design reference: `design/cleat-full-overview.html` (all 10 original
screens, colors, typography, component style), `design/cleat-home-variants.html`
(three home-screen layout directions — Variant A, hero banner + tide strip,
is the one in use), `design/cleat-marina-profile.html` (the marina profile
screen + amenity chips on search results), and `design/cleat-you-tab-final.html`
(the You tab: name-only profile, posts nested per marina card).

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
  - `onboarding/` and `marinas/` — both render `MarinaSwitchFlow` (find a
    marina → "I'm a member here" / "I'm visiting"), just with a different
    candidate list: onboarding shows every marina, the switcher excludes
    only the *currently active* one (marinas you already belong to, home or
    visiting, still show up — tagged accordingly — so you can switch back).
    Both full-bleed, no tab bar. There's exactly one implementation of this
    flow (`components/member/MarinaSwitchFlow.tsx`,
    `MarinaFinder.tsx`, `MembershipChoiceSheet.tsx`), not two.
  - `(app)/home/` — Variant A home: hero banner (gradient/dock-silhouette
    placeholder by default, swaps to a real photo once a marina uploads
    `bannerImageUrl`), tide/wind/water-temp strip, latest announcement, 2
    quick tiles, office info-link (→ `/marina`).
  - `(app)/news/` — marina board / community board toggle (official vs.
    member-run posts). Community board is filtered to `activeMarina.id`.
  - `(app)/contacts/` — marina staff + emergency contacts, tap-to-call, plus
    a "Switch or add a marina" link (→ `/marinas`).
  - `(app)/you/` — profile header (name + email only, no usage type) and a
    card per marina in `memberMarinas`, each showing slip/dock info (home)
    or "Visited {date}" (past visit), a Home/Past-visit badge, and — nested
    inside the card — up to 2 of the member's own recent posts at that
    marina with a "See all N posts" link if there are more. Cards with no
    posts just omit that sub-section. "Add another"/"Add a marina" → `/marinas`.
    Bottom: notification settings / sign out (placeholders, no backend).
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
  differently-shaped data. `CommunityPost` carries `marinaId` (which board it
  lives on — News filters by `activeMarina.id`) and `authorIsMe` (drives the
  You tab's per-marina post lists). `MemberMarinaMembership` is
  `{ marinaId, role: "home" | "visiting", visitedDates? }` — `visitedDates`
  is stamped automatically whenever a membership becomes "visiting" (see
  MarinaProvider below). Other types: `Announcement`, `Contact`,
  `StaffMember`, `Amenity`/`AmenityIconId`, `MemberProfile`, plus shared
  label maps (`ANNOUNCEMENT_CATEGORY_LABELS`, `ANNOUNCEMENT_STATUS_LABELS`).
  There is no member-facing "usage type" concept (liveaboard/weekend/storage)
  — it was removed; onboarding now just asks which marina + home-or-visiting.
- `src/lib/data.ts` — `sampleMarinas: Marina[]` holds all 4 sample marinas
  (Shilshole Bay, Fairhaven, Elliott Bay, Port Townsend — the last is
  community-run, so all its amenities are member-submitted, none verified).
  `currentMember` is the signed-in member shown on the You tab (Rosa T. —
  the same person the staff Members list shows as id "rosa"). `communityPosts`
  is ordered newest-first *within each marina*; the You tab relies on that
  array order (filter + `slice(0, 2)`) rather than parsing display dates.
  `defaultMemberMarinas` seeds Rosa with her home marina *and* a past visit
  to Fairhaven, so the You tab's two-card scenario is visible without
  switching marinas first. `staffManagedMarina` is a fixed lookup (Shilshole)
  for the staff portal, intentionally *not* wired to the member's
  marina-switching state.
- `src/components/member/MarinaProvider.tsx` — client-side React Context
  wrapping the whole `(member)` route group. Holds `activeMarina` (derived)
  and `memberMarinas`, exposes `switchMarina(marinaId, role)`. Designating a
  new "home" demotes the previous home to "visiting" (stamping today's date
  as `visitedDates`) rather than dropping it. Persisted to `localStorage`
  (hydrated post-mount to avoid SSR mismatch) so the active marina survives
  a hard reload. Any member page needing the active marina calls
  `useMarina()` instead of importing static data — this is why
  Home/News/Contacts/marina-profile/onboarding/You are all client components.
- Announcements, contacts, and staff members are still global mock data, not
  modeled per-marina — a known simplification, not a bug.

## PWA

`public/manifest.webmanifest` + generated icons in `public/icons/`
(192/512/512-maskable/apple-touch-icon), wired into `src/app/layout.tsx`
metadata. Installable as a PWA.

## Build status

**Done:** full member flow (onboarding → home → news → contacts → you →
marina profile → marina switcher, with working multi-marina state) and full
staff flow (dashboard, members, composer). All verified end-to-end via
Playwright (including the switch-marinas-back-and-forth loop, persistence
across hard reloads, and the You tab's nested-posts/see-all/no-posts-card
cases) with zero console errors and zero TypeScript errors. Onboarding no
longer asks a usage-type question — it reuses the marina switcher's
find-a-marina + home/visiting flow verbatim (same components). The You tab
is a real screen now (profile + per-marina post cards), not a redirect to
Contacts.

**Explicitly out of scope for Phase 1** (per `design/cleat-full-overview.html`):
issue reporting, marina map, events, and a separate Documents section. Marina
rules/emergency info live as pinned posts on the marina board instead.

**Next up:** no active task. The last identified priority was wiring a real
backend/database in place of `lib/data.ts` (today even the "active marina"
state is client-only, persisted per-browser via `localStorage`, not tied to
a real account) — but confirm with the user before assuming that's next.

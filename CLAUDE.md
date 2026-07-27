@AGENTS.md

# Cleat

Cleat is a member-experience platform for marinas — for any boat owner, not
just liveaboards. It has two distinct sides: a mobile-first **member app**
and a desktop **staff portal**. This is the Phase 1 MVP: real screens and
layouts, with the member side fully wired to Supabase.

Design reference: `design/cleat-full-overview.html` (all 10 original
screens, colors, typography, component style), `design/cleat-home-variants.html`
(three home-screen layout directions — Variant A, hero banner + tide strip,
is the one in use), `design/cleat-marina-profile.html` (the marina profile
screen + amenity chips on search results), and `design/cleat-you-tab-final.html`
(the You tab: name-only profile, posts nested per marina card).

## Tech stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Supabase (PostgreSQL + PostgREST) — `src/lib/supabase.ts`, env vars in `.env.local`
- Fonts: Fraunces (serif, headings), Inter (sans, body), Space Mono (labels/meta)
- Design tokens (navy/dock/seaglass/coral/paper palette) defined via `@theme`
  in `src/app/globals.css` — generates utilities like `bg-navy`, `text-dock`,
  `border-line`
- Mock data still in `src/lib/data.ts` for the staff portal only (see below)

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
    `bannerImageUrl`), tide/wind/water-temp strip, latest announcement card
    (from `boardAnnouncements` in context — Supabase), 2 quick tiles, office
    info-link (→ `/marina`). Marina name in the banner is tappable and opens
    the unified marina switcher sheet.
  - `(app)/news/` — marina board / community board toggle (official vs.
    member-run posts). Both boards are now Supabase-backed. Community board
    is filtered to `activeMarina.id`. Posts support create, edit, delete, and
    like (optimistic UI). Comments support create, edit, delete. Overflow
    menu (⋮) on own posts and own comments for edit/delete.
  - `(app)/contacts/` — marina staff + emergency contacts, tap-to-call.
    Per-marina from Supabase. Shows animate-pulse skeleton while loading.
    "Switch marina" button opens the unified picker sheet.
  - `(app)/you/` — profile header (name + @username only, no usage type) and
    a card per marina in `memberMarinas`, each showing slip/dock info (home)
    or "Visited {date}" (past visit), a Home/Past-visit badge, and — nested
    inside the card — up to 2 of the member's own recent posts at that marina
    with a "See all N posts" link if there are more. Cards with no posts
    omit that sub-section. "Switch marina" button opens the unified picker.
    Bottom: notification settings / sign out (placeholders, no backend).
  - `(app)/my-posts/[marinaId]/` — full list of the current member's posts
    at one marina. Overflow menu (⋮) for edit/delete on each post.
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

## Backend: what's on Supabase vs. mock data

Schema: `supabase/migrations/001_initial_schema.sql` (tables + seed data).

### Migrated to Supabase (member side)

All member-side data flows through `MarinaProvider` context, fetched from
these modules:

- **`src/lib/marina-db.ts`** — `fetchMarinas()` (full marina shape including
  hours, amenities, conditions, office), `fetchContacts(marinaId)` (staff +
  emergency contacts ordered by `sort_order`).
- **`src/lib/member-db.ts`** — `fetchMemberData()` (member profile + all
  marina memberships via embedded select), `upsertMembership()`,
  `demoteHomeMembership()`. `CURRENT_MEMBER_ID` is hardcoded here (see Auth
  section below).
- **`src/lib/news-db.ts`** — `fetchCommunityPosts(marinaId)`,
  `fetchMyPosts()`, `fetchMarinaBoardData(marinaId)` (announcements +
  pinned posts), plus all mutation helpers: `dbInsertPost`, `dbUpdatePost`,
  `dbDeletePost`, `upsertLike`, `deleteLike`, `dbInsertComment`,
  `dbUpdateComment`, `dbDeleteComment`.

### Still on mock data (`src/lib/data.ts`)

The **staff portal** (dashboard, members list, announcement composer) reads
entirely from `lib/data.ts`. `staffManagedMarina` is a fixed reference to
Shilshole, not reactive to any member state.

`lib/data.ts` also still exports `sampleMarinas`, `defaultMemberMarinas`,
and `currentMember` as fallback seeds used by `MarinaProvider`'s initial
state and error paths — they're referenced there but not the source of truth
at runtime.

## MarinaProvider

`src/components/member/MarinaProvider.tsx` — client-side React Context
wrapping the whole `(member)` route group. Central state manager for all
member data. Key design points:

- **`hydrated` state** (not ref): gates all marina-scoped fetches
  (community posts, board data, contacts) so they use the correct
  `activeMarinaId` after localStorage is restored, not the seed default.
- **`activeMarinaId`** is persisted to `localStorage` (key `cleat:member-marinas`)
  and restored post-mount to survive hard reloads.
- **`viewMarina(id)`** — changes active marina display only, no DB write.
  Used by the unified picker for existing memberships.
- **`switchMarina(id, role)`** — creates or updates a membership row in
  Supabase, with optimistic UI + revert on failure.
- **Optimistic updates** on all post/comment/like mutations, with revert on
  DB failure.
- All mutations update both `posts` (active marina feed) and `myPosts`
  (member's cross-marina post list) where relevant.

Exposed context: `member`, `marinas`, `activeMarina`, `memberMarinas`,
`switchMarina`, `viewMarina`, `posts`, `myPosts`, `postsLoading`,
`boardAnnouncements`, `boardPinned`, `contacts`, `contactsLoading`,
`addPost`, `toggleLike`, `addComment`, `editPost`, `deletePost`,
`editComment`, `deleteComment`.

## Authentication — not yet built

There is **no real authentication**. Every screen currently assumes a single
hardcoded "current member":

- `CURRENT_MEMBER_ID = "00000000-0000-0000-0000-000000000001"` (Rosa T.)
  is hardcoded in `src/lib/member-db.ts` and used by all DB writes.
- The staff portal assumes a fixed managed marina (Shilshole) with no
  login or session concept.
- No RLS policies exist in the schema yet — all tables are open.

**Next planned work:** implement real auth (Supabase Auth), then use the
authenticated session to replace the hardcoded `CURRENT_MEMBER_ID` and add
proper staff/member access control. Do not half-build role-gating without
auth to check against — the staff portal migration to Supabase should happen
after or alongside auth, not before.

## Unified marina switcher

`src/components/member/MarinaSwitcherSheet.tsx` — bottom sheet showing the
member's current marinas (checkmark on active) plus an "+ Add a marina"
option. Opened from three places: Home banner tap, You tab "Switch marina"
button, Contacts "Switch marina" button. Selecting an existing marina calls
`viewMarina()` — no membership change. "+ Add a marina" routes to `/marinas`
(the search/join flow).

## Overflow menu

`src/components/member/OverflowMenu.tsx` — three-dot (⋮) button + dropdown
with Edit / Delete (with inline confirmation). Used on own posts and own
comments in the News community board and My Posts screen.

## PWA

`public/manifest.webmanifest` + generated icons in `public/icons/`
(192/512/512-maskable/apple-touch-icon), wired into `src/app/layout.tsx`
metadata. Installable as a PWA.

## Build status

**Member side complete:** full member flow (onboarding → home → news →
contacts → you → marina profile → marina switcher) backed by Supabase.
Multi-marina state works end-to-end with persistence across hard reloads.
TypeScript clean, zero console errors.

**Staff side on mock data:** dashboard, members list, and announcement
composer are UI-complete but read/write only `lib/data.ts`. Staff portal
migration is blocked on auth (see above).

**Explicitly out of scope for Phase 1** (per `design/cleat-full-overview.html`):
issue reporting, marina map, events, and a separate Documents section. Marina
rules/emergency info live as pinned posts on the marina board instead.

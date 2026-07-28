@AGENTS.md

# Cleat

Cleat is a member-experience platform for marinas — for any boat owner, not
just liveaboards. It has two distinct sides: a mobile-first **member app**
and a desktop **staff portal**. **Phase 1 MVP is functionally complete**:
both sides run on real Supabase data (PostgreSQL + PostgREST), with real
Supabase Auth (magic link) gating the member app end to end and real
role-based access control gating the staff portal. The one remaining
UI-only piece is the announcement composer (see Route structure below), and
Row Level Security is the immediate next priority (see Build status).

Design reference: `design/cleat-full-overview.html` (all 10 original
screens, colors, typography, component style), `design/cleat-home-variants.html`
(three home-screen layout directions — Variant A, hero banner + tide strip,
is the one in use), `design/cleat-marina-profile.html` (the marina profile
screen + amenity chips on search results), and `design/cleat-you-tab-final.html`
(the You tab: name-only profile, posts nested per marina card).

## Tech stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Supabase (PostgreSQL + PostgREST + Auth) — `src/lib/supabase.ts`, env vars
  in `.env.local`. Auth emails route through custom SMTP (Resend) — see
  Authentication below; Supabase's default email provider rate-limits fast.
- Fonts: Fraunces (serif, headings), Inter (sans, body), Space Mono (labels/meta)
- Design tokens (navy/dock/seaglass/coral/paper palette) defined via `@theme`
  in `src/app/globals.css` — generates utilities like `bg-navy`, `text-dock`,
  `border-line`
- `src/lib/data.ts` still exists as seed/fallback data and for the one
  screen with no backend at all (the announcement composer) — see below

## Route structure

Two route groups under `src/app/`, each with its own layout:

- **`(member)`** — mobile-first, phone-frame shell (`src/app/(member)/layout.tsx`),
  wrapped in `AuthProvider` → `AuthGate` → `MarinaProvider` (see
  Authentication below — nothing here renders until someone is signed in
  *and* linked to a member row). Nested `(app)` group adds the bottom tab
  bar (Home / News / You) via `src/components/member/TabBar.tsx`.
  - `onboarding/` and `marinas/` — both render `MarinaSwitchFlow` (find a
    marina → "I'm a member here" / "I'm visiting"), just with a different
    candidate list: onboarding shows every marina, the switcher excludes
    only the *currently active* one (marinas you already belong to, home or
    visiting, still show up — tagged accordingly — so you can switch back).
    Both full-bleed, no tab bar. There's exactly one implementation of this
    flow (`components/member/MarinaSwitchFlow.tsx`,
    `MarinaFinder.tsx`, `MembershipChoiceSheet.tsx`), not two. Note:
    `/onboarding` is where `AuthGate` intercepts for a signed-in-but-unlinked
    account too — see `NewMemberFlow` below, which is a *different*
    component reusing the same `MarinaFinder`/`MembershipChoiceSheet` pieces.
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
    Bottom: notification settings / sign out (sign out is wired to
    `auth-db.ts`'s `signOut()`; notification settings is still a placeholder).
  - `(app)/my-posts/[marinaId]/` — full list of the current member's posts
    at one marina. Overflow menu (⋮) for edit/delete on each post.
  - `(app)/marina/` — marina profile: status strip (verified/staff-managed vs.
    community-run), hours card (today emphasized, separate fuel dock hours),
    amenities grid split into staff-verified (solid tiles) and
    member-submitted (dashed tiles), "Suggest an amenity" prompt (UI only,
    doesn't persist).
- **`(staff)`** — desktop sidebar layout (`src/components/staff/Sidebar.tsx`),
  wrapped in its own `AuthProvider` → `StaffGate` (see Authentication below —
  nothing here renders unless the signed-in member's `role` is `'staff'`;
  everyone else is bounced to the member app).
  - `dashboard/` — stat cards + recent announcements table. Supabase-backed
    via `src/lib/staff-db.ts`'s `fetchDashboardData()`.
  - `members/` — member list with usage type + verification status
    (verified / visiting / pending). Supabase-backed via `staff-db.ts`'s
    `fetchMembersData()`.
  - `announcements/new/` — announcement composer (category, title, message,
    publish/save-as-draft). **UI only, no backend** — `submit()` just
    navigates to `/dashboard`; nothing is ever written anywhere. This was
    true even before the Supabase migration.

Root `src/app/page.tsx` redirects to `/onboarding`.

## Backend: what's on Supabase vs. mock data

Schema: `supabase/migrations/001_initial_schema.sql` (tables + seed data),
`002_auth.sql` (auth wiring — see Authentication below, now applied).

### Migrated to Supabase

Member side (all flows through `MarinaProvider` context):

- **`src/lib/marina-db.ts`** — `fetchMarinas()` (full marina shape including
  hours, amenities, conditions, office), `fetchContacts(marinaId)` (staff +
  emergency contacts ordered by `sort_order`).
- **`src/lib/member-db.ts`** — `getCurrentMemberId()` (resolves the signed-in
  member's real `members.id` via the `auth_user_id` soft link — see
  Authentication), `fetchMemberData()`, `upsertMembership()`,
  `demoteHomeMembership()`.
- **`src/lib/news-db.ts`** — `fetchCommunityPosts(marinaId)`,
  `fetchMyPosts()`, `fetchMarinaBoardData(marinaId)` (announcements +
  pinned posts), plus all mutation helpers: `dbInsertPost`, `dbUpdatePost`,
  `dbDeletePost`, `upsertLike`, `deleteLike`, `dbInsertComment`,
  `dbUpdateComment`, `dbDeleteComment`.

Staff side (partial):

- **`src/lib/staff-db.ts`** — `fetchDashboardData()`, `fetchMembersData()`.
  Both scoped to a fixed `STAFF_MARINA_ID` constant ("shilshole") — there's
  no staff auth/session yet to derive "which marina does this staff account
  manage" from, so it's hardcoded the same way `CURRENT_MEMBER_ID` used to
  be on the member side before real auth existed.

### Still mock/UI-only

- The announcement composer (`(staff)/announcements/new/`) — no backend at
  all, see Route structure above.
- `src/lib/data.ts` still exports `sampleMarinas`, `defaultMemberMarinas`,
  and `currentMember` as fallback seeds used by `MarinaProvider`'s initial
  state and error paths — referenced there but not the source of truth at
  runtime.

## MarinaProvider

`src/components/member/MarinaProvider.tsx` — client-side React Context
wrapping the tabbed member routes (mounted by `AuthGate` once a member is
signed in and linked). Central state manager for all member data. Key
design points:

- **`hydrated` state** (not ref): gates all marina-scoped fetches
  (community posts, board data, contacts) so they use the correct
  `activeMarinaId` after localStorage is restored, not the seed default.
- **`activeMarinaId`** is persisted to `localStorage` (key `cleat:member-marinas`)
  and restored post-mount to survive hard reloads. Cleared on sign-out (see
  Authentication) so the next person to sign in on this browser doesn't
  inherit a stale active marina.
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

## Authentication

Real Supabase Auth (magic link / passwordless email) is wired in and
**confirmed working end to end** for the member side, including the
brand-new-member flow (username → home marina choice → row creation →
landing in the app with the right member/marina data).

- **`src/lib/supabase.ts`** — plain `createClient()`, client-side only.
  Implicit flow, `detectSessionInUrl: true` (both are supabase-js defaults —
  no explicit config needed). No `@supabase/ssr` yet since every member
  route is a client component; would need it if server components/route
  handlers ever need the session.
- **`src/lib/auth-db.ts`** — `sendMagicLink(email)`, `signOut()`,
  `findLinkedMember(userId)` (read-only — does a member row already have
  this `auth_user_id`? Returns `{id, role}` if so, else `null`. Never
  creates or claims anything), `createMemberProfile({userId, email, username})`
  (creates a brand-new row for a first-time sign-in, always with the DB
  default `role: 'member'`).
- **`src/components/member/AuthProvider.tsx`** — session state via
  `supabase.auth.getSession()` + `onAuthStateChange`. Exposes `user`,
  `memberId` (this account's real `members.id`, or `null` if not yet
  linked), `role` (`'member' | 'staff' | null`, resolved in the same query
  as `memberId`), `setMemberId(id, role?)`, `loading`. `memberId`/`role`
  aren't exposed until the link lookup has resolved for that session, so
  `MarinaProvider`/`StaffGate` can never mount before a member row is
  guaranteed to exist (or before we know it doesn't, and need
  `NewMemberFlow` instead). Mounted once per route group — `(member)` and
  `(staff)` each get their own `AuthProvider` instance, both reading the
  same underlying Supabase session independently. **Still has verbose
  temporary `console.log`/`console.error` instrumentation** added while
  debugging the stuck-loading and insert-failure bugs — strip once the flow
  is fully trusted.
- **`src/components/member/AuthGate.tsx`** — the real entry point to the
  member app, mounted at the `(member)` layout level (wraps every member
  route including `/onboarding`). Three-way branch: `loading` → spinner;
  `!user` → `SignInScreen`; `user && !memberId` → `NewMemberFlow`; else
  `MarinaProvider` + the actual route.
- **`src/components/member/SignInScreen.tsx`** — email input → magic link,
  "check your email" confirmation state.
- **`src/components/member/NewMemberFlow.tsx`** — first-time sign-in flow:
  choose a username (validated, 3–20 chars lowercase/digits/underscore),
  then home marina via the same `MarinaFinder` + `MembershipChoiceSheet`
  pieces the switcher uses — composed locally here, not through
  `MarinaSwitchFlow`, since that needs `MarinaProvider`/`useMarina()`,
  which don't exist yet at this point (no member row for them to hold
  state for). `MembershipChoiceSheet` opens defaulted to "I'm a member
  here". Only after both steps does it call `createMemberProfile()` then
  `upsertMembership()` — nothing is written before both are chosen. A
  username collision sends the user back to the username step with a clear
  message rather than silently suffixing it. **Confirmed working end to
  end** (magic link → username → marina choice → landing in the app).
- **`src/lib/errors.ts`** — `describeError()`. `PostgrestError` isn't an
  `Error` instance and doesn't stringify usefully via plain
  `console.error`/`JSON.stringify` — this pulls `message`/`code`/`details`/`hint`
  out explicitly. Used at every Supabase call site that can fail.

### Staff access control

- **`src/components/staff/StaffGate.tsx`** — the real entry point to the
  staff portal, mirroring `AuthGate` on the member side but checking `role`
  instead of just linkage. Mounted at the `(staff)` layout level, wrapped in
  its own `AuthProvider`. Branches: `loading` → spinner; `!user` →
  `SignInScreen` (reused as-is from the member side, wrapped in a
  `min-h-dvh` flex container since it normally relies on the member
  layout's phone-frame column to stretch into); `user && role !== 'staff'`
  → redirect to `/home` (a signed-in-but-unlinked account also lands here,
  since `role` is `null` until linked — the member-side `AuthGate` then
  decides what they see, including `NewMemberFlow` if needed); else render
  the staff shell (`Sidebar` + page content).
- This is an **application-layer** gate only — a non-staff member can't
  reach the staff *UI*, but Row Level Security is still off (see below), so
  the anon key itself has no role awareness. RLS is the next priority
  specifically because of this gap.

### Member row linking model

`members.id` is its own independent UUID — it is **not** the same value as
`auth.users.id`. `members.auth_user_id` (nullable, unique, FK to
`auth.users(id) on delete set null`) is a soft link between the two,
added by `002_auth.sql`. Every place that needs "the current member's id"
resolves it via `getCurrentMemberId()` in `member-db.ts`, which looks up
`members.id where auth_user_id = <session user id>` — not the session id
directly.

The 5 seeded members (Rosa T. + 4 others) are never claimed or linked by
any sign-in — every real sign-in gets its own fresh row via
`createMemberProfile()`. The seeded rows exist purely as demo/reference
data going forward, untouched by app code.

### `supabase/migrations/002_auth.sql` — now applied

Confirmed directly against the live database: `members.role` and
`members.auth_user_id` both exist. (This took a few attempts — the SQL
editor run didn't take effect the first couple of times; if schema changes
ever seem not to have landed, query `information_schema.columns` directly
rather than assuming a SQL editor run succeeded.) Adds:

1. `members.role` (`'member' | 'staff'`, default `'member'`) — now read by
   `StaffGate` (see Staff access control above) to gate the staff portal.
2. `members.auth_user_id` — the soft link described above.

Deliberately does **not** add Row Level Security — every table is exactly
as open via the anon key as before this migration, regardless of `role` or
auth state. Flagged in the migration's own header comment as deferred, and
now that both real auth and staff gating exist, RLS is the top-priority
next task (see Build status) — right now `role` only gates the *UI*, not
the database itself.

### Known gotcha: sandboxed link scanners

Some email clients and corporate security scanners pre-visit links
(including magic links) in a sandboxed browser to scan them for safety,
*before* the real user ever clicks. Since Supabase magic links are
single-use, this can silently consume the token — the real click then
lands on an "expired/already used" error even though the recipient never
actually clicked it before. Worth ruling out first if a magic link fails
on what looks like its first real click.

### Custom SMTP (Resend)

Supabase's default auth email provider has an aggressive rate limit — hit
twice during testing. Configured custom SMTP via Resend (free tier) under
Authentication → Emails → SMTP Settings: host `smtp.resend.com`, port
`465`, username `resend`, password = Resend API key. The sender domain
needs to be verified in Resend's dashboard first (or use their sandbox
domain for quick testing) — an unverified domain causes sends to fail with
a generic "Error sending confirmation email" from Supabase.

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

**Phase 1 MVP is functionally complete.** Member side is fully
Supabase-backed including real auth — multi-marina state works end-to-end
with persistence across hard reloads, magic-link sign-in is confirmed
working (Resend SMTP), and `NewMemberFlow` (username → home marina →
landing in the app) is confirmed working end to end. Staff side is
Supabase-backed (dashboard stats, announcements table, members list) with
real role-based access control: `StaffGate` confirmed working in both
directions — a non-staff member hitting `/dashboard`, `/members`, or
`/announcements/new` directly is redirected to `/home`, and setting
`members.role = 'staff'` on a linked row grants normal access on the next
session resolution. TypeScript clean throughout.

**Known remaining gaps, not blockers for Phase 1 sign-off:**
- The announcement composer (`(staff)/announcements/new/`) is still
  UI-only — `submit()` navigates to `/dashboard` but writes nothing.
- `MarinaProvider.tsx` still imports `sampleMarinas`, `defaultMemberMarinas`,
  `currentMember`, `communityPosts` from `lib/data.ts` as initial/error-path
  state, used only before the real Supabase fetch resolves or if it fails.
- Staff routes are still scoped to a single hardcoded `STAFF_MARINA_ID`
  ("shilshole") in `staff-db.ts` — there's no per-staff-account marina
  scoping yet (see next planned work below).

**Next planned work, in priority order:**

1. **Row Level Security** — currently disabled on every table, left off
   deliberately at Stage 1 pending real auth. Real auth (and staff
   role-gating) now exist, so this is the immediate next task: right now
   the anon key has unrestricted read/write access to everything regardless
   of `role` or sign-in state — `StaffGate` only gates the UI, not the
   database.
2. **Public "Marina Staff sign-up" claim flow** — after RLS, move `role`
   from a single global column on `members` to a per-marina scope on
   `marina_memberships` (a member could plausibly be staff at one marina
   and a regular member at another), and build a real sign-up path for
   staff accounts instead of the manual SQL-editor role flip used for
   testing.
3. Also deferred: PWA manifest verification (installability hasn't been
   re-tested since the auth work), NOAA weather API integration for
   `ConditionsStrip` (currently static/seeded), and later-roadmap features
   below.

**Explicitly out of scope for Phase 1** (per `design/cleat-full-overview.html`):
issue reporting, marina map, events, and a separate Documents section. Marina
rules/emergency info live as pinned posts on the marina board instead.

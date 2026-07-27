-- Cleat — Auth wiring (revised)
-- Run in the Supabase SQL editor (Dashboard → SQL editor → New query).
-- Safe to re-run: every statement uses IF NOT EXISTS / guards.
--
-- Revised from the first draft of this migration, which made members.id
-- itself a foreign key to auth.users(id) — the standard Supabase "profiles"
-- pattern, but it required deleting every member row not backed by a real
-- auth.users account first, which would have destroyed Rosa's entire
-- seeded history (3 marina memberships, 5 posts, 6 comments on those posts,
-- her own comments/likes elsewhere). This version avoids that entirely:
--
--   1. members.role (member vs staff) — unchanged from the first draft,
--      column only, nothing reads it yet.
--   2. members.auth_user_id — a new NULLABLE column, softly linking a
--      member row to an auth.users row instead of members.id being that
--      link. Existing rows keep their own id and just have
--      auth_user_id = null until something claims them.
--   3. Deletes nothing. All 5 existing member rows — Rosa included — are
--      untouched. members.id keeps its own default and is not altered.
--   4. No auto-provisioning trigger. Which member row a sign-in belongs to
--      is application logic now, not something a DB trigger decides:
--      src/lib/auth-db.ts's findLinkedMemberId() checks for an existing
--      link (read-only, never creates or claims anything — no sign-in
--      auto-claims Rosa's row or any other seeded row); if unlinked,
--      NewMemberFlow asks for a username and a home marina, then
--      createMemberProfile() creates a brand-new row for that signup.
--
-- Still explicitly NOT done here (deferred alongside staff gating):
--   - Row Level Security. Every table is exactly as open via the anon key
--     as it was before this migration.

-- ─────────────────────────────────────────────────────────────
-- 1. Role
-- ─────────────────────────────────────────────────────────────

alter table members
  add column if not exists role text not null default 'member'
    check (role in ('member', 'staff'));

-- ─────────────────────────────────────────────────────────────
-- 2. Soft link to auth.users — nullable, NOT the primary key.
--    unique so at most one member row can claim a given auth account;
--    multiple NULLs are fine (every unclaimed row has one).
--    on delete set null: if an auth.users row is ever removed, the member
--    row and their content survive, just unlinked.
-- ─────────────────────────────────────────────────────────────

alter table members
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;

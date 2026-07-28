-- Cleat — RLS: marina_memberships
-- Run in the Supabase SQL editor (Dashboard → SQL editor → New query).
-- Safe to re-run: policies are dropped and recreated, RLS enable is
-- idempotent.
--
-- More involved than the previous four tables (marinas, marina_hours,
-- amenities, contacts) because this table mixes member-owned data with
-- staff-facing fields on the *same row*. Two things worth calling out
-- before reading the policies:
--
--   1. This table's `role` column is NOT member/staff — it's
--      'home' | 'visiting' (enforced by the table's own CHECK constraint).
--      Member/staff status lives on members.role, a separate global
--      column (see 002_auth.sql, 003_rls_marinas.sql). There is no
--      per-marina staff scoping yet — CLAUDE.md flags moving role onto
--      marina_memberships as a *future* migration, not something that
--      exists today — so "staff" below means globally staff, same
--      limitation as every RLS migration so far.
--   2. Columns split two ways: member-writable (`role`, `visited_dates` —
--      exactly what switchMarina()/upsertMembership()/demoteHomeMembership()
--      in member-db.ts ever touch) vs. staff-only
--      (`slip`, `usage_type`, `verification_status`, `verification_detail`
--      — all commented "Staff-facing only" in 001_initial_schema.sql). The
--      member UPDATE policy blocks changing the staff-only columns via a
--      self-referential subquery that requires the new value to match
--      what's already on the row — a member can PATCH role/visited_dates
--      without touching the others (PostgREST partial updates leave
--      unspecified columns alone), but can't sneak a `verification_status:
--      'verified'` into the same request. Same restriction applies at
--      INSERT time (default 'pending'/null only) so a member can't
--      self-verify or self-assign a slip by including it in their first
--      join request instead of a later update.
--
-- No staff-INSERT policy: there's no staff-driven "add a membership for
-- this member" flow in the app yet, so it isn't added here. No DELETE
-- policy either — nothing in the app deletes a membership row.
--
-- Not addressed here (pre-existing, minor): a member's UPDATE isn't
-- blocked from repointing their own row's marina_id to a different marina
-- (only member_id is checked). The app never does this — switching
-- marinas goes through upsertMembership()'s (member_id, marina_id)
-- conflict target, which either inserts a new row or updates the existing
-- row for that exact pair — so this is a theoretical gap, not a live one.

alter table marina_memberships enable row level security;

-- ── select ───────────────────────────────────────────────────────────────

drop policy if exists "marina_memberships_select_own" on marina_memberships;
create policy "marina_memberships_select_own"
  on marina_memberships
  for select
  using (
    exists (
      select 1 from members
      where members.id = marina_memberships.member_id
        and members.auth_user_id = auth.uid()
    )
  );

drop policy if exists "marina_memberships_select_staff" on marina_memberships;
create policy "marina_memberships_select_staff"
  on marina_memberships
  for select
  using (
    exists (
      select 1 from members
      where members.auth_user_id = auth.uid()
        and members.role = 'staff'
    )
  );

-- ── insert (member only — own row, staff-only fields left at safe defaults) ─

drop policy if exists "marina_memberships_insert_own" on marina_memberships;
create policy "marina_memberships_insert_own"
  on marina_memberships
  for insert
  with check (
    exists (
      select 1 from members
      where members.id = marina_memberships.member_id
        and members.auth_user_id = auth.uid()
    )
    and verification_status = 'pending'
    and usage_type is null
    and verification_detail is null
    and slip is null
  );

-- ── update ───────────────────────────────────────────────────────────────

-- Member: own row only, and only role/visited_dates may actually change —
-- every other column (including the staff-only ones) must come back equal
-- to what's already stored, checked via a self-referential subquery.
drop policy if exists "marina_memberships_update_own_fields" on marina_memberships;
create policy "marina_memberships_update_own_fields"
  on marina_memberships
  for update
  using (
    exists (
      select 1 from members
      where members.id = marina_memberships.member_id
        and members.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from members
      where members.id = marina_memberships.member_id
        and members.auth_user_id = auth.uid()
    )
    and verification_status = (
      select m.verification_status from marina_memberships m where m.id = marina_memberships.id
    )
    and usage_type is not distinct from (
      select m.usage_type from marina_memberships m where m.id = marina_memberships.id
    )
    and verification_detail is not distinct from (
      select m.verification_detail from marina_memberships m where m.id = marina_memberships.id
    )
    and slip is not distinct from (
      select m.slip from marina_memberships m where m.id = marina_memberships.id
    )
  );

-- Staff: any row, any column — no restriction beyond being staff. This is
-- the only path that can change verification_status/verification_detail/
-- usage_type/slip, or role on someone else's row.
drop policy if exists "marina_memberships_update_staff" on marina_memberships;
create policy "marina_memberships_update_staff"
  on marina_memberships
  for update
  using (
    exists (
      select 1 from members
      where members.auth_user_id = auth.uid()
        and members.role = 'staff'
    )
  )
  with check (
    exists (
      select 1 from members
      where members.auth_user_id = auth.uid()
        and members.role = 'staff'
    )
  );

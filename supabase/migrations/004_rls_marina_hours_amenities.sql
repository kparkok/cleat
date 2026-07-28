-- Cleat — RLS: marina_hours + amenities
-- Run in the Supabase SQL editor (Dashboard → SQL editor → New query).
-- Safe to re-run: policies are dropped and recreated, RLS enable is
-- idempotent.
--
-- marina_hours: same public-read / staff-write pattern as marinas
-- (003_rls_marinas.sql) — staff isn't scoped per-marina yet (see that
-- migration's header comment), so any staff member can write hours for any
-- marina, not just "their" marina.
--
-- amenities: public read, same as marinas/marina_hours — required for
-- marina-db.ts's fetchMarinas(), which embeds both marina_hours and
-- amenities via a nested select (`marinas(*, marina_hours(*), amenities(*))`);
-- PostgREST applies each embedded table's own RLS, so without a public
-- SELECT policy here the embedded arrays would silently come back empty
-- rather than erroring.
--
-- Writes to amenities are split three ways, matching the app's
-- staff-verified (solid tile) vs. member-submitted (dashed tile) design:
--   - Any linked member (auth_user_id resolves to a members row, any role)
--     can INSERT a row with verified = false — a member-submitted
--     amenity suggestion.
--   - Only staff can INSERT a row with verified = true, or UPDATE the
--     verified flag on an existing row (verifying a member's suggestion,
--     or adding a staff-confirmed amenity directly).
-- Postgres OR's multiple permissive policies for the same command
-- together, so a staff member's INSERT is allowed regardless of the
-- verified value they set, on top of the separate member policy that only
-- allows verified = false.
--
-- No DELETE policy on either table — nothing in the app deletes hours or
-- amenities rows.

alter table marina_hours enable row level security;
alter table amenities enable row level security;

-- ── marina_hours ─────────────────────────────────────────────────────────

drop policy if exists "marina_hours_select_public" on marina_hours;
create policy "marina_hours_select_public"
  on marina_hours
  for select
  using (true);

drop policy if exists "marina_hours_insert_staff" on marina_hours;
create policy "marina_hours_insert_staff"
  on marina_hours
  for insert
  with check (
    exists (
      select 1 from members
      where members.auth_user_id = auth.uid()
        and members.role = 'staff'
    )
  );

drop policy if exists "marina_hours_update_staff" on marina_hours;
create policy "marina_hours_update_staff"
  on marina_hours
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

-- ── amenities ────────────────────────────────────────────────────────────

drop policy if exists "amenities_select_public" on amenities;
create policy "amenities_select_public"
  on amenities
  for select
  using (true);

drop policy if exists "amenities_insert_member" on amenities;
create policy "amenities_insert_member"
  on amenities
  for insert
  with check (
    verified = false
    and exists (
      select 1 from members
      where members.auth_user_id = auth.uid()
    )
  );

drop policy if exists "amenities_insert_staff" on amenities;
create policy "amenities_insert_staff"
  on amenities
  for insert
  with check (
    exists (
      select 1 from members
      where members.auth_user_id = auth.uid()
        and members.role = 'staff'
    )
  );

drop policy if exists "amenities_update_staff" on amenities;
create policy "amenities_update_staff"
  on amenities
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

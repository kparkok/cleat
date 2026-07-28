-- Cleat — RLS: marinas
-- Run in the Supabase SQL editor (Dashboard → SQL editor → New query).
-- Safe to re-run: policies are dropped and recreated, RLS enable is
-- idempotent.
--
-- First table under Row Level Security, deferred since Stage 1 pending
-- real auth (see CLAUDE.md — RLS is the top-priority next task now that
-- auth + staff role-gating both exist). marinas is the simplest case:
--
--   - SELECT: public. Marina info (name, hours, amenities, conditions,
--     office) is meant to be visible to anyone, signed in or not — the
--     app's onboarding/marina-switcher flows read this before a session
--     necessarily exists.
--   - UPDATE / INSERT: staff only. Staff isn't scoped per-marina yet —
--     members.role is a single global column (see 002_auth.sql), not a
--     per-marina flag on marina_memberships (that split is a later planned
--     migration, once RLS lands). So for now, any member with
--     role = 'staff' can write to any marina, not just "their" marina.
--   - DELETE: no policy added — deliberately left unreachable via the
--     anon/authenticated roles. Nothing in the app deletes a marina.
--
-- auth.uid() returns null for unauthenticated (anon-role) requests, and a
-- `members.auth_user_id = null` comparison is never true in SQL, so the
-- staff check below already excludes anonymous writes without needing a
-- separate anon-role restriction.

alter table marinas enable row level security;

drop policy if exists "marinas_select_public" on marinas;
create policy "marinas_select_public"
  on marinas
  for select
  using (true);

drop policy if exists "marinas_update_staff" on marinas;
create policy "marinas_update_staff"
  on marinas
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

drop policy if exists "marinas_insert_staff" on marinas;
create policy "marinas_insert_staff"
  on marinas
  for insert
  with check (
    exists (
      select 1 from members
      where members.auth_user_id = auth.uid()
        and members.role = 'staff'
    )
  );

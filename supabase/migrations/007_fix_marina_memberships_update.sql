-- Cleat — fix marina_memberships member UPDATE policy
-- Run in the Supabase SQL editor (Dashboard → SQL editor → New query).
-- Safe to re-run: policy/function/trigger are dropped and recreated.
--
-- 006_rls_marina_memberships.sql's "marina_memberships_update_own_fields"
-- policy blocked a member from changing verification_status/usage_type/
-- verification_detail/slip by comparing the proposed new value against the
-- existing one via a self-referential subquery:
--
--   verification_status = (
--     select m.verification_status from marina_memberships m where m.id = marina_memberships.id
--   )
--
-- That subquery is itself subject to marina_memberships' own RLS SELECT
-- policies — evaluated *during* the UPDATE, against the exact row being
-- updated. Self-referencing a table's own RLS from inside one of its
-- policies, on the row currently being written, is a known-fragile
-- pattern: if the subquery doesn't resolve a row (for whatever reason —
-- recursive policy evaluation is genuinely subtle here), it returns NULL,
-- `col = NULL` is neither true nor false, and Postgres treats that as a
-- check failure — rejecting even a fully legitimate update that never
-- touched those columns at all. That's what broke demoteHomeMembership():
-- it only ever sends {role, visited_dates}, so verification_status etc.
-- were never going to change regardless — the policy's own subquery was
-- the thing failing, not the actual data being written.
--
-- Fix: drop the subquery from RLS entirely and enforce the same rule with
-- a BEFORE UPDATE trigger instead. Triggers see OLD/NEW directly — no
-- subquery, no self-referential RLS evaluation, no recursion risk. For any
-- non-staff caller, the trigger force-resets the four staff-only columns
-- to their OLD values before RLS's WITH CHECK ever runs, so a member's
-- update can't change them no matter what's in the request body — and the
-- RLS policy itself goes back to a plain ownership check.

create or replace function marina_memberships_protect_staff_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from members
    where members.auth_user_id = auth.uid()
      and members.role = 'staff'
  ) then
    new.verification_status := old.verification_status;
    new.usage_type := old.usage_type;
    new.verification_detail := old.verification_detail;
    new.slip := old.slip;
  end if;
  return new;
end;
$$;

drop trigger if exists marina_memberships_protect_staff_fields_trg on marina_memberships;
create trigger marina_memberships_protect_staff_fields_trg
  before update on marina_memberships
  for each row
  execute function marina_memberships_protect_staff_fields();

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
  );

-- marina_memberships_update_staff (from 006) is untouched — it never had
-- the self-referential subquery, so it was never at risk from this bug.

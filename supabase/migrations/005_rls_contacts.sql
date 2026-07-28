-- Cleat — RLS: contacts
-- Run in the Supabase SQL editor (Dashboard → SQL editor → New query).
-- Safe to re-run: policies are dropped and recreated, RLS enable is
-- idempotent.
--
-- Same public-read / staff-write pattern as marinas (003_rls_marinas.sql)
-- and marina_hours (004_rls_marina_hours_amenities.sql): office and
-- emergency contacts need to be visible to any member viewing a marina,
-- signed in or not — marina-db.ts's fetchContacts() is called from the
-- Contacts screen with no auth requirement today. Staff isn't scoped
-- per-marina yet (see 003's header comment), so any staff member can write
-- contacts for any marina, not just "their" marina.
--
-- No DELETE policy — nothing in the app deletes a contact.

alter table contacts enable row level security;

drop policy if exists "contacts_select_public" on contacts;
create policy "contacts_select_public"
  on contacts
  for select
  using (true);

drop policy if exists "contacts_insert_staff" on contacts;
create policy "contacts_insert_staff"
  on contacts
  for insert
  with check (
    exists (
      select 1 from members
      where members.auth_user_id = auth.uid()
        and members.role = 'staff'
    )
  );

drop policy if exists "contacts_update_staff" on contacts;
create policy "contacts_update_staff"
  on contacts
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

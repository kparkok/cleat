-- Cleat — Phase 1 initial schema
-- Run in the Supabase SQL editor (Dashboard → SQL editor → New query).
-- Safe to re-run: every statement uses IF NOT EXISTS / OR REPLACE.

-- ─────────────────────────────────────────────────────────────
-- MEMBERS
-- Each row is one app user. id is a plain UUID for now; a later
-- migration will add `references auth.users(id)` once Supabase
-- Auth is wired in.
-- ─────────────────────────────────────────────────────────────

create table if not exists members (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  initials   text        not null,
  email      text        not null unique,
  username   text        not null unique,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- MARINAS
-- One row per marina. Conditions and office info are flat
-- columns; structured sub-data (hours, amenities, contacts)
-- live in their own tables.
-- ─────────────────────────────────────────────────────────────

create table if not exists marinas (
  id                    text        primary key,  -- human slug, e.g. "shilshole"
  name                  text        not null,
  location              text        not null,
  status                text        not null default 'community'
                          check (status in ('verified', 'community')),
  banner_image_url      text,

  -- Live conditions (updated by staff or an integration)
  conditions_tide       text,
  conditions_tide_trend text,
  conditions_water_temp text,
  conditions_wind       text,

  -- Office contact block
  office_hours          text,
  office_phone          text,
  office_location       text,

  -- Fuel dock hours live here because they differ from regular
  -- hours and don't need their own table row.
  fuel_dock_hours       text,

  created_at            timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- MARINA HOURS
-- Each row is one hours block (e.g. "Mon – Wed / 8am – 5pm").
-- isToday is NOT stored — the app layer derives it at render
-- time by comparing label to the current day of the week.
-- ─────────────────────────────────────────────────────────────

create table if not exists marina_hours (
  id         uuid primary key default gen_random_uuid(),
  marina_id  text not null references marinas(id) on delete cascade,
  label      text not null,   -- e.g. "Mon – Wed", "Fri – Sun"
  time       text not null,   -- e.g. "8:00 AM – 5:00 PM", "Closed"
  sort_order int  not null default 0
);

create index if not exists marina_hours_marina_id_idx on marina_hours(marina_id);

-- ─────────────────────────────────────────────────────────────
-- AMENITIES
-- Tiles on the marina profile screen. verified=true means
-- staff-confirmed (solid tile); false means member-submitted
-- (dashed tile).
-- ─────────────────────────────────────────────────────────────

create table if not exists amenities (
  id         uuid    primary key default gen_random_uuid(),
  marina_id  text    not null references marinas(id) on delete cascade,
  label      text    not null,
  icon       text    not null,  -- matches AmenityIconId in types.ts
  note       text,
  verified   boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists amenities_marina_id_idx on amenities(marina_id);

-- ─────────────────────────────────────────────────────────────
-- CONTACTS
-- Staff and emergency contacts shown on the Contacts screen.
-- ─────────────────────────────────────────────────────────────

create table if not exists contacts (
  id           uuid    primary key default gen_random_uuid(),
  marina_id    text    not null references marinas(id) on delete cascade,
  name         text    not null,
  role         text    not null,
  phone        text    not null,
  is_emergency boolean not null default false,
  sort_order   int     not null default 0
);

create index if not exists contacts_marina_id_idx on contacts(marina_id);

insert into contacts (marina_id, name, role, phone, is_emergency, sort_order) values
  ('shilshole',     'Marina office',                    'General inquiries',          '(206) 555-0148', false, 0),
  ('shilshole',     'Operations',                       'Dock & slip questions',      '(206) 555-0172', false, 1),
  ('shilshole',     'Harbor emergency line',            '24 hours',                   '(206) 555-0199', true,  2),
  ('fairhaven',     'Marina office',                    'General inquiries',          '(360) 555-0122', false, 0),
  ('fairhaven',     'Guest dock',                       'Slip & moorage questions',   '(360) 555-0123', false, 1),
  ('fairhaven',     'Coast Guard Sector Puget Sound',   '24-hour emergency',          '(206) 217-6001', true,  2),
  ('elliott-bay',   'Marina office',                    'General inquiries',          '(206) 555-0133', false, 0),
  ('elliott-bay',   'Dock master',                      'Slip & dock questions',      '(206) 555-0134', false, 1),
  ('elliott-bay',   'Harbor emergency line',            '24 hours',                   '(206) 555-0199', true,  2),
  ('port-townsend', 'Port Townsend harbormaster',       'General questions',          '(360) 555-0177', false, 0),
  ('port-townsend', 'Jefferson County Search & Rescue', 'Emergency',                  '(360) 385-2000', true,  1)
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────
-- PINNED POSTS
-- Rules and emergency-info cards pinned to the marina board.
-- ─────────────────────────────────────────────────────────────

create table if not exists pinned_posts (
  id         uuid primary key default gen_random_uuid(),
  marina_id  text not null references marinas(id) on delete cascade,
  title      text not null,
  meta       text,
  tone       text not null default 'default'
               check (tone in ('default', 'alert')),
  sort_order int  not null default 0
);

create index if not exists pinned_posts_marina_id_idx on pinned_posts(marina_id);

-- ─────────────────────────────────────────────────────────────
-- MARINA MEMBERSHIPS
-- Links members to marinas. Also carries the per-member,
-- per-marina data that mock code stored on the Marina shape
-- (slip assignment, verification, usage type).
-- ─────────────────────────────────────────────────────────────

create table if not exists marina_memberships (
  id                  uuid        primary key default gen_random_uuid(),
  member_id           uuid        not null references members(id) on delete cascade,
  marina_id           text        not null references marinas(id) on delete cascade,

  -- "home" = this is where the member's boat lives;
  -- "visiting" = short stay, home marina is preserved separately.
  role                text        not null check (role in ('home', 'visiting')),

  -- Member's assigned slip at this marina (home members only in practice).
  -- Kept here rather than on marinas because it is per-member, not per-marina.
  slip                text,

  -- Display string stamped when a membership becomes "visiting",
  -- e.g. "Jul 20–21". Derived from created_at in the real app; kept
  -- as text for Phase 1 parity with mock data.
  visited_dates       text,

  -- Staff-facing only
  usage_type          text,   -- "liveaboard", "weekend", "storage only", etc.
  verification_status text    not null default 'pending'
                        check (verification_status in ('verified', 'visiting', 'pending')),
  verification_detail text,   -- e.g. "Visiting · 1 night" or "Pending — ID upload"

  created_at          timestamptz not null default now(),

  unique (member_id, marina_id)
);

create index if not exists marina_memberships_member_id_idx on marina_memberships(member_id);
create index if not exists marina_memberships_marina_id_idx on marina_memberships(marina_id);

-- ──────────────────────────────────────────────────────────���──
-- ANNOUNCEMENTS  (staff portal)
-- published_at is null for drafts; set to a future timestamp
-- for scheduled announcements.
-- ─────────────────────────────────────────────────────────────

create table if not exists announcements (
  id           uuid        primary key default gen_random_uuid(),
  marina_id    text        not null references marinas(id) on delete cascade,
  title        text        not null,
  body         text        not null,
  category     text        not null
                 check (category in ('emergency', 'maintenance', 'community', 'general')),
  status       text        not null default 'draft'
                 check (status in ('sent', 'scheduled', 'draft')),
  published_at timestamptz,   -- null for drafts; future timestamp for scheduled
  created_at   timestamptz not null default now()
);

create index if not exists announcements_marina_id_idx on announcements(marina_id);

-- ─────────────────────────────────────────────────────────────
-- COMMUNITY POSTS
-- hearts is a denormalized count kept in sync by the trigger
-- below. Derive timeAgo and date display strings in the app
-- layer from created_at.
-- ─────────────────────────────────────────────────────────────

create table if not exists community_posts (
  id            uuid        primary key default gen_random_uuid(),
  marina_id     text        not null references marinas(id) on delete cascade,
  author_id     uuid        not null references members(id) on delete cascade,
  kind          text        not null check (kind in ('member', 'visiting')),
  visiting_from text,   -- home marina name, populated when kind = 'visiting'
  body          text        not null,
  hearts        int         not null default 0,  -- kept in sync by trigger
  created_at    timestamptz not null default now()
);

create index if not exists community_posts_marina_id_idx  on community_posts(marina_id);
create index if not exists community_posts_author_id_idx  on community_posts(author_id);
create index if not exists community_posts_created_at_idx on community_posts(created_at desc);

-- ─────────────────────────────────────────────────────────────
-- POST LIKES
-- Composite PK prevents double-likes. The trigger below keeps
-- community_posts.hearts in sync automatically.
-- ─────────────────────────────────────────────────────────────

create table if not exists post_likes (
  post_id    uuid        not null references community_posts(id) on delete cascade,
  member_id  uuid        not null references members(id)         on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, member_id)
);

create index if not exists post_likes_post_id_idx on post_likes(post_id);

-- Trigger: increment/decrement community_posts.hearts on like insert/delete
create or replace function sync_post_hearts()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update community_posts set hearts = hearts + 1 where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update community_posts set hearts = hearts - 1 where id = old.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists post_likes_hearts_sync on post_likes;
create trigger post_likes_hearts_sync
  after insert or delete on post_likes
  for each row execute function sync_post_hearts();

-- ─────────────────────────────────────────────────────────────
-- POST COMMENTS
-- Flat replies — no nested threading. Derive timeAgo from
-- created_at in the app layer.
-- ─────────────────────────────────────────────────────────────

create table if not exists post_comments (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references community_posts(id) on delete cascade,
  author_id  uuid        not null references members(id)         on delete cascade,
  body       text        not null,
  created_at timestamptz not null default now()
);

create index if not exists post_comments_post_id_idx    on post_comments(post_id);
create index if not exists post_comments_created_at_idx on post_comments(created_at asc);

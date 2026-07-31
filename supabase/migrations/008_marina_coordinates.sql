-- Cleat — add marina coordinates
-- Run in the Supabase SQL editor (Dashboard → SQL editor → New query).
-- Safe to re-run: ADD COLUMN uses IF NOT EXISTS, UPDATEs are idempotent.
--
-- marinas had no latitude/longitude columns. Adds plain double-precision
-- columns (no PostGIS — nothing in the app does geo queries or distance
-- sorting, and a marina map is explicitly out of scope for Phase 1 per
-- CLAUDE.md, so there's no reason for more than two nullable floats),
-- then populates them for the 4 seeded marinas with their real-world
-- coordinates (property/entrance level, from public map data — not
-- surveyed precision, but accurate to the actual marina).
--
-- Note: nothing in the app reads these yet (Marina type in types.ts,
-- marina-db.ts's fetchMarinas() select, etc. would all need updating to
-- surface them) — this migration only adds the data, it doesn't wire up a
-- consumer, since none exists.

alter table marinas
  add column if not exists latitude double precision
    check (latitude between -90 and 90);

alter table marinas
  add column if not exists longitude double precision
    check (longitude between -180 and 180);

update marinas set latitude = 47.6809, longitude = -122.4056 where id = 'shilshole';     -- Shilshole Bay Marina, Seattle, WA
update marinas set latitude = 48.7133, longitude = -122.5085 where id = 'fairhaven';     -- Fairhaven Marina, Bellingham, WA
update marinas set latitude = 47.6259, longitude = -122.3892 where id = 'elliott-bay';   -- Elliott Bay Marina, Seattle, WA
update marinas set latitude = 48.1170, longitude = -122.7790 where id = 'port-townsend'; -- Port Townsend Boat Haven, Port Townsend, WA

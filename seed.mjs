/**
 * One-off seed script — run with:
 *   node --env-file=.env.local seed.mjs
 *
 * Cleans existing seed rows first (by known IDs), then inserts
 * the full sample dataset from lib/data.ts into Supabase via the
 * PostgREST REST API (no WebSocket / no Supabase client needed).
 */

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL + "/rest/v1";
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const HEADERS = {
  "Content-Type": "application/json",
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  Prefer: "return=minimal,resolution=ignore-duplicates",
};

// ── helpers ────────────────────────────────────────────────────────────────

async function insert(table, rows) {
  if (!rows.length) return;
  const res = await fetch(`${BASE}/${table}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`POST ${table}: ${res.status} ${await res.text()}`);
  console.log(`  ✓ inserted ${rows.length} row(s) into ${table}`);
}

async function del(table, filter) {
  const res = await fetch(`${BASE}/${table}?${filter}`, {
    method: "DELETE",
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`DELETE ${table}: ${res.status} ${await res.text()}`);
}

// ── fixed seed IDs ─────────────────────────────────────────────────────────

const MEMBER = {
  ROSA:   "00000000-0000-0000-0000-000000000001",
  JORDAN: "00000000-0000-0000-0000-000000000002",
  ALEX:   "00000000-0000-0000-0000-000000000003",
  DAVE_K: "00000000-0000-0000-0000-000000000004",
  SAM_W:  "00000000-0000-0000-0000-000000000005",
};

const POST = {
  SHORE_POWER:    "10000000-0000-0000-0000-000000000001",
  FUEL_CARD:      "10000000-0000-0000-0000-000000000002",
  SEAL_SIGHTING:  "10000000-0000-0000-0000-000000000003",
  POWER_PEDESTAL: "10000000-0000-0000-0000-000000000004",
  RIGGER:         "10000000-0000-0000-0000-000000000005",
  FH_FUEL_CARD:   "10000000-0000-0000-0000-000000000006",
};

const MARINA_IDS = ["shilshole", "fairhaven", "elliott-bay", "port-townsend"];
const MEMBER_IDS = Object.values(MEMBER).map(id => `"${id}"`).join(",");

// ── cleanup ────────────────────────────────────────────────────────────────

console.log("\nCleaning up existing seed data...");
// Delete marinas first — cascades hours, amenities, contacts, pinned_posts,
// announcements, marina_memberships, community_posts → comments/likes.
await del("marinas", `id=in.(${MARINA_IDS.join(",")})`);
// Delete seed members — cascades any remaining memberships.
await del("members", `id=in.(${MEMBER_IDS})`);
console.log("  ✓ cleanup done\n");

// ── members ─────────────────────────────────────────────────────────────────

console.log("Seeding members...");
await insert("members", [
  { id: MEMBER.ROSA,   name: "Rosa T.",   initials: "RT", email: "rosa.t@email.com",   username: "rosa_t"   },
  { id: MEMBER.JORDAN, name: "Jordan M.", initials: "JM", email: "jordan.m@email.com", username: "jordan_m" },
  { id: MEMBER.ALEX,   name: "Alex R.",   initials: "AR", email: "alex.r@email.com",   username: "alex_r"   },
  { id: MEMBER.DAVE_K, name: "Dave K.",   initials: "DK", email: "dave.k@email.com",   username: "dave_k"   },
  { id: MEMBER.SAM_W,  name: "Sam W.",    initials: "SW", email: "sam.w@email.com",    username: "sam_w"    },
]);

// ── marinas ─────────────────────────────────────────────────────────────────

console.log("Seeding marinas...");
await insert("marinas", [
  {
    id: "shilshole",
    name: "Shilshole Bay Marina",
    location: "Seattle, WA",
    status: "verified",
    conditions_tide: "6.2 ft",
    conditions_tide_trend: "rising",
    conditions_water_temp: "62°F",
    conditions_wind: "14 kt NW",
    fuel_dock_hours: "7:00 AM – 7:00 PM",
    office_hours: "Open today, 8am – 5pm",
    office_phone: "(206) 555-0148",
    office_location: "Dock A, Building 1",
  },
  {
    id: "fairhaven",
    name: "Fairhaven Marina",
    location: "Bellingham, WA",
    status: "verified",
    conditions_tide: "4.8 ft",
    conditions_tide_trend: "falling",
    conditions_water_temp: "58°F",
    conditions_wind: "9 kt SW",
    fuel_dock_hours: "8:00 AM – 6:00 PM",
    office_hours: "Open today, 7am – 6pm",
    office_phone: "(360) 555-0122",
    office_location: "Harbor building",
  },
  {
    id: "elliott-bay",
    name: "Elliott Bay Marina",
    location: "Seattle, WA",
    status: "verified",
    conditions_tide: "5.5 ft",
    conditions_tide_trend: "rising",
    conditions_water_temp: "61°F",
    conditions_wind: "11 kt N",
    fuel_dock_hours: "7:00 AM – 6:00 PM",
    office_hours: "Open today, 8am – 5pm",
    office_phone: "(206) 555-0133",
    office_location: "Marina office, Pier D",
  },
  {
    id: "port-townsend",
    name: "Port Townsend Boat Haven",
    location: "Port Townsend, WA",
    status: "community",
    conditions_tide: "3.9 ft",
    conditions_tide_trend: "rising",
    conditions_water_temp: "56°F",
    conditions_wind: "13 kt W",
    fuel_dock_hours: "Not available",
    office_hours: "Unstaffed — community-run",
    office_phone: "(360) 555-0177",
    office_location: "N/A",
  },
]);

// ── marina hours ─────────────────────────────────────────────────────────────
// Labels are plain day ranges ("Thu", "Fri – Sun", etc.) — NOT "Today (...)".
// The app layer prepends "Today (...)" dynamically based on the current weekday.

console.log("Seeding marina_hours...");
await insert("marina_hours", [
  // Shilshole
  { marina_id: "shilshole",    label: "Thu",      time: "8:00 AM – 5:00 PM", sort_order: 0 },
  { marina_id: "shilshole",    label: "Fri – Sun", time: "8:00 AM – 6:00 PM", sort_order: 1 },
  { marina_id: "shilshole",    label: "Mon – Wed", time: "8:00 AM – 5:00 PM", sort_order: 2 },
  // Fairhaven
  { marina_id: "fairhaven",    label: "Thu",      time: "7:00 AM – 6:00 PM", sort_order: 0 },
  { marina_id: "fairhaven",    label: "Fri – Sun", time: "7:00 AM – 7:00 PM", sort_order: 1 },
  { marina_id: "fairhaven",    label: "Mon – Wed", time: "7:00 AM – 6:00 PM", sort_order: 2 },
  // Elliott Bay
  { marina_id: "elliott-bay",  label: "Thu",      time: "8:00 AM – 5:00 PM", sort_order: 0 },
  { marina_id: "elliott-bay",  label: "Fri – Sun", time: "8:00 AM – 6:00 PM", sort_order: 1 },
  { marina_id: "elliott-bay",  label: "Mon – Wed", time: "8:00 AM – 5:00 PM", sort_order: 2 },
  // Port Townsend (community-run, unstaffed — label stores day range, time stores status)
  { marina_id: "port-townsend", label: "Thu",      time: "Unstaffed", sort_order: 0 },
  { marina_id: "port-townsend", label: "Fri – Sun", time: "Unstaffed", sort_order: 1 },
  { marina_id: "port-townsend", label: "Mon – Wed", time: "Unstaffed", sort_order: 2 },
]);

// ── amenities ────────────────────────────────────────────────────────────────

console.log("Seeding amenities...");
await insert("amenities", [
  // Shilshole — staff-verified
  { marina_id: "shilshole", label: "Fuel dock",   icon: "fuel",       note: "Gas & diesel",   verified: true  },
  { marina_id: "shilshole", label: "Pump-out",    icon: "pumpOut",    note: "24 hours",        verified: true  },
  { marina_id: "shilshole", label: "Showers",     icon: "showers",    note: "Building 2",      verified: true  },
  { marina_id: "shilshole", label: "WiFi",        icon: "wifi",       note: "Guest network",   verified: true  },
  { marina_id: "shilshole", label: "EV charging", icon: "evCharging", note: "2 stations",      verified: true  },
  { marina_id: "shilshole", label: "Laundry",     icon: "laundry",    note: "Coin-op",         verified: true  },
  // Shilshole — member-submitted
  { marina_id: "shilshole", label: "Ice machine", icon: "ice",        note: "Near Dock C",     verified: false },
  { marina_id: "shilshole", label: "Dog area",    icon: "dogArea",    note: "By the pavilion", verified: false },
  // Fairhaven — staff-verified
  { marina_id: "fairhaven", label: "Fuel dock",   icon: "fuel",       note: "Gas & diesel",        verified: true },
  { marina_id: "fairhaven", label: "Pump-out",    icon: "pumpOut",    note: "24 hours",             verified: true },
  { marina_id: "fairhaven", label: "Guest dock",  icon: "guestDock",  note: "Short & long stay",    verified: true },
  { marina_id: "fairhaven", label: "WiFi",        icon: "wifi",       note: "Guest network",        verified: true },
  // Elliott Bay — staff-verified
  { marina_id: "elliott-bay", label: "Fuel dock",   icon: "fuel",       note: "Gas & diesel", verified: true },
  { marina_id: "elliott-bay", label: "Pump-out",    icon: "pumpOut",    note: "24 hours",      verified: true },
  { marina_id: "elliott-bay", label: "Laundry",     icon: "laundry",    note: "Coin-op",       verified: true },
  { marina_id: "elliott-bay", label: "EV charging", icon: "evCharging", note: "4 stations",    verified: true },
  // Port Townsend — all member-submitted (community-run)
  { marina_id: "port-townsend", label: "Guest dock", icon: "guestDock", note: "First come, first served", verified: false },
  { marina_id: "port-townsend", label: "Showers",    icon: "showers",   note: "Near the boat launch",     verified: false },
]);

// ── contacts ─────────────────────────────────────────────────────────────────

console.log("Seeding contacts...");
await insert("contacts", [
  { marina_id: "shilshole", name: "Marina office",       role: "General inquiries",    phone: "(206) 555-0148", is_emergency: false, sort_order: 0 },
  { marina_id: "shilshole", name: "Operations",          role: "Dock & slip questions", phone: "(206) 555-0172", is_emergency: false, sort_order: 1 },
  { marina_id: "shilshole", name: "Harbor emergency line", role: "24 hours",            phone: "(206) 555-0199", is_emergency: true,  sort_order: 2 },
]);

// ── pinned posts ─────────────────────────────────────────────────────────────

console.log("Seeding pinned_posts...");
await insert("pinned_posts", [
  { marina_id: "shilshole", title: "Marina rules & regulations", meta: "Updated Jun 2026", tone: "default", sort_order: 0 },
  { marina_id: "shilshole", title: "Emergency procedures",       meta: "Updated May 2026", tone: "alert",   sort_order: 1 },
]);

// ── announcements ─────────────────────────────────────────────────────────────

console.log("Seeding announcements...");
await insert("announcements", [
  { marina_id: "shilshole", title: "Fuel dock closed Thursday",       body: "Scheduled pump maintenance from 8am to 2pm. Fairwater fuel dock will remain open.", category: "maintenance", status: "sent",      published_at: "2026-07-19T12:00:00Z" },
  { marina_id: "shilshole", title: "Summer boater potluck — Aug 2",   body: "Guest dock pavilion, 5:30pm. Sign up at the office to bring a dish.",              category: "community",  status: "sent",      published_at: "2026-07-17T12:00:00Z" },
  { marina_id: "shilshole", title: "New pump-out station opens on E dock", body: "Second pump-out station now operational, reducing weekend wait times.",       category: "general",    status: "sent",      published_at: "2026-07-14T12:00:00Z" },
  { marina_id: "shilshole", title: "Q3 dock inspection notice",        body: "Staff will inspect dock cleats and power pedestals on all docks the week of Jul 24. No action needed unless you're contacted directly.", category: "general", status: "scheduled", published_at: "2026-07-24T12:00:00Z" },
  { marina_id: "shilshole", title: "Winter storage sign-up opens",    body: "Reserve your winter haul-out and storage slot for the 2026–27 season.",           category: "general",    status: "draft",     published_at: null },
]);

// ── marina memberships ────────────────────────────────────────────────────────

console.log("Seeding marina_memberships...");
await insert("marina_memberships", [
  // Rosa — home at Shilshole, visited Fairhaven
  { member_id: MEMBER.ROSA,   marina_id: "shilshole", role: "home",     slip: "Dock G · Slip 14", usage_type: "Liveaboard",              verification_status: "verified",  verification_detail: null,                  visited_dates: null },
  { member_id: MEMBER.ROSA,   marina_id: "fairhaven", role: "visiting", slip: "Guest dock 2",     usage_type: "Visiting",                verification_status: "visiting",  verification_detail: null,                  visited_dates: "Jul 20–21" },
  // Shilshole staff members
  { member_id: MEMBER.JORDAN, marina_id: "shilshole", role: "home",     slip: "F08",              usage_type: "Weekend & seasonal",      verification_status: "verified",  verification_detail: null,                  visited_dates: null },
  { member_id: MEMBER.ALEX,   marina_id: "shilshole", role: "visiting", slip: "Guest dock 3",     usage_type: "Visiting from Fairhaven", verification_status: "visiting",  verification_detail: "Visiting · 1 night",  visited_dates: null },
  { member_id: MEMBER.DAVE_K, marina_id: "shilshole", role: "home",     slip: "E22",              usage_type: "Storage only",            verification_status: "pending",   verification_detail: "Pending — ID upload", visited_dates: null },
  { member_id: MEMBER.SAM_W,  marina_id: "shilshole", role: "home",     slip: null,               usage_type: "Member",                  verification_status: "verified",  verification_detail: null,                  visited_dates: null },
]);

// ── community posts ───────────────────────────────────────────────────────────
// hearts is set directly here (historical likes pre-DB). The post_likes trigger
// will handle increments/decrements for new real-user likes going forward.

console.log("Seeding community_posts...");
await insert("community_posts", [
  { id: POST.SHORE_POWER,    marina_id: "shilshole", author_id: MEMBER.JORDAN, kind: "member",   visiting_from: null,         body: "Anyone have a spare 30-amp shore power adapter I could borrow this weekend?", hearts: 6,  created_at: "2026-07-26T10:00:00Z" },
  { id: POST.FUEL_CARD,      marina_id: "shilshole", author_id: MEMBER.ALEX,   kind: "visiting", visiting_from: "Fairhaven",  body: "Beautiful marina! Does the fuel dock take card after 6pm?",                   hearts: 2,  created_at: "2026-07-26T09:00:00Z" },
  { id: POST.SEAL_SIGHTING,  marina_id: "shilshole", author_id: MEMBER.ROSA,   kind: "member",   visiting_from: null,         body: "Heads up — saw a seal hauled out near the guest dock this morning. Give it space, it'll move on its own.", hearts: 14, created_at: "2026-07-20T12:00:00Z" },
  { id: POST.POWER_PEDESTAL, marina_id: "shilshole", author_id: MEMBER.ROSA,   kind: "member",   visiting_from: null,         body: "Anyone else notice the guest dock power pedestal on the north end is flaky?", hearts: 3,  created_at: "2026-07-12T12:00:00Z" },
  { id: POST.RIGGER,         marina_id: "shilshole", author_id: MEMBER.ROSA,   kind: "member",   visiting_from: null,         body: "Does anyone have a good rigger they'd recommend near the marina?",           hearts: 5,  created_at: "2026-06-07T12:00:00Z" },
  { id: POST.FH_FUEL_CARD,   marina_id: "fairhaven", author_id: MEMBER.ROSA,   kind: "visiting", visiting_from: "Shilshole",  body: "Does the fuel dock take cards after 6pm, or is it cash only after hours?",   hearts: 2,  created_at: "2026-07-22T12:00:00Z" },
]);

// ── post comments ─────────────────────────────────────────────────────────────

console.log("Seeding post_comments...");
await insert("post_comments", [
  { post_id: POST.SHORE_POWER,    author_id: MEMBER.ROSA,   body: "I have one — I'm on Dock G. Stop by or reply here.",                                   created_at: "2026-07-26T11:00:00Z" },
  { post_id: POST.SHORE_POWER,    author_id: MEMBER.SAM_W,  body: "Got one too if Rosa's tied up.",                                                        created_at: "2026-07-26T11:15:00Z" },
  { post_id: POST.FUEL_CARD,      author_id: MEMBER.ROSA,   body: "Yes — they switched to 24/7 card readers last spring. Chip or tap.",                    created_at: "2026-07-26T10:00:00Z" },
  { post_id: POST.SEAL_SIGHTING,  author_id: MEMBER.JORDAN, body: "Still there as of noon — gave it a wide berth. Thanks for the heads up!",               created_at: "2026-07-21T12:00:00Z" },
  { post_id: POST.POWER_PEDESTAL, author_id: MEMBER.JORDAN, body: "Yep, been flaky for weeks. Logged it with the office Monday.",                          created_at: "2026-07-12T13:00:00Z" },
  { post_id: POST.POWER_PEDESTAL, author_id: MEMBER.DAVE_K, body: "Marina emailed — it's on the maintenance list for this week.",                          created_at: "2026-07-19T12:00:00Z" },
  { post_id: POST.RIGGER,         author_id: MEMBER.SAM_W,  body: "Pacific Rigging on Shilshole Ave — ask for Dave. Done our boat twice, really thorough.", created_at: "2026-06-07T13:00:00Z" },
  { post_id: POST.FH_FUEL_CARD,   author_id: MEMBER.ALEX,   body: "Card works right up to close. After-hours it's chip-only at the pump.",                 created_at: "2026-07-22T13:00:00Z" },
]);

console.log("\n✓ Seed complete");

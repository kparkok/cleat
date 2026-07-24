// Mock data for Phase 1 — sample marina is Shilshole Bay Marina, matching the
// design mockup. Swap this module for real data fetching once the DB is wired.

import type {
  Announcement,
  CommunityPost,
  Contact,
  DashboardStat,
  Marina,
  MemberMarinaMembership,
  PinnedPost,
  StaffMember,
} from "./types";

/**
 * Every marina a member could have open — their home marina plus anything
 * findable in the marina switcher. All share the same full `Marina` shape,
 * so switching is just pointing at a different entry here (see
 * MarinaProvider), not fetching differently-shaped data.
 */
export const sampleMarinas: Marina[] = [
  {
    id: "shilshole",
    name: "Shilshole Bay Marina",
    location: "Seattle, WA",
    slip: "Dock G · Slip 14",
    // No marina has uploaded a custom banner yet — every marina defaults to
    // the gradient banner until staff upload one.
    bannerImageUrl: undefined,
    status: "verified",
    conditions: {
      tide: "6.2 ft",
      tideTrend: "rising",
      waterTemp: "62°F",
      wind: "14 kt NW",
    },
    hours: {
      rows: [
        { label: "Today (Thu)", time: "8:00 AM – 5:00 PM", isToday: true },
        { label: "Fri – Sun", time: "8:00 AM – 6:00 PM" },
        { label: "Mon – Wed", time: "8:00 AM – 5:00 PM" },
      ],
      fuelDock: "7:00 AM – 7:00 PM",
    },
    amenities: [
      { id: "fuel", label: "Fuel dock", icon: "fuel", note: "Gas & diesel", verified: true },
      { id: "pump-out", label: "Pump-out", icon: "pumpOut", note: "24 hours", verified: true },
      { id: "showers", label: "Showers", icon: "showers", note: "Building 2", verified: true },
      { id: "wifi", label: "WiFi", icon: "wifi", note: "Guest network", verified: true },
      { id: "ev-charging", label: "EV charging", icon: "evCharging", note: "2 stations", verified: true },
      { id: "laundry", label: "Laundry", icon: "laundry", note: "Coin-op", verified: true },
      { id: "ice", label: "Ice machine", icon: "ice", note: "Near Dock C", verified: false },
      { id: "dog-area", label: "Dog area", icon: "dogArea", note: "By the pavilion", verified: false },
    ],
    office: {
      hours: "Open today, 8am – 5pm",
      phone: "(206) 555-0148",
      location: "Dock A, Building 1",
    },
  },
  {
    id: "fairhaven",
    name: "Fairhaven Marina",
    location: "Bellingham, WA",
    slip: "Guest dock 2",
    bannerImageUrl: undefined,
    status: "verified",
    conditions: {
      tide: "4.8 ft",
      tideTrend: "falling",
      waterTemp: "58°F",
      wind: "9 kt SW",
    },
    hours: {
      rows: [
        { label: "Today (Thu)", time: "7:00 AM – 6:00 PM", isToday: true },
        { label: "Fri – Sun", time: "7:00 AM – 7:00 PM" },
        { label: "Mon – Wed", time: "7:00 AM – 6:00 PM" },
      ],
      fuelDock: "8:00 AM – 6:00 PM",
    },
    amenities: [
      { id: "fuel", label: "Fuel dock", icon: "fuel", note: "Gas & diesel", verified: true },
      { id: "pump-out", label: "Pump-out", icon: "pumpOut", note: "24 hours", verified: true },
      { id: "guest-dock", label: "Guest dock", icon: "guestDock", note: "Short & long stay", verified: true },
      { id: "wifi", label: "WiFi", icon: "wifi", note: "Guest network", verified: true },
    ],
    office: {
      hours: "Open today, 7am – 6pm",
      phone: "(360) 555-0122",
      location: "Harbor building",
    },
  },
  {
    id: "elliott-bay",
    name: "Elliott Bay Marina",
    location: "Seattle, WA",
    slip: "Guest dock 5",
    bannerImageUrl: undefined,
    status: "verified",
    conditions: {
      tide: "5.5 ft",
      tideTrend: "rising",
      waterTemp: "61°F",
      wind: "11 kt N",
    },
    hours: {
      rows: [
        { label: "Today (Thu)", time: "8:00 AM – 5:00 PM", isToday: true },
        { label: "Fri – Sun", time: "8:00 AM – 6:00 PM" },
        { label: "Mon – Wed", time: "8:00 AM – 5:00 PM" },
      ],
      fuelDock: "7:00 AM – 6:00 PM",
    },
    amenities: [
      { id: "fuel", label: "Fuel dock", icon: "fuel", note: "Gas & diesel", verified: true },
      { id: "pump-out", label: "Pump-out", icon: "pumpOut", note: "24 hours", verified: true },
      { id: "laundry", label: "Laundry", icon: "laundry", note: "Coin-op", verified: true },
      { id: "ev-charging", label: "EV charging", icon: "evCharging", note: "4 stations", verified: true },
    ],
    office: {
      hours: "Open today, 8am – 5pm",
      phone: "(206) 555-0133",
      location: "Marina office, Pier D",
    },
  },
  {
    id: "port-townsend",
    name: "Port Townsend Boat Haven",
    location: "Port Townsend, WA",
    slip: "Guest dock 1",
    bannerImageUrl: undefined,
    // Community-run, unclaimed by staff — nobody's around to confirm
    // amenities, so everything here is member-submitted.
    status: "community",
    conditions: {
      tide: "3.9 ft",
      tideTrend: "rising",
      waterTemp: "56°F",
      wind: "13 kt W",
    },
    hours: {
      rows: [
        { label: "Today (Thu)", time: "Unstaffed", isToday: true },
        { label: "Fri – Sun", time: "Unstaffed" },
        { label: "Mon – Wed", time: "Unstaffed" },
      ],
      fuelDock: "Not available",
    },
    amenities: [
      { id: "guest-dock", label: "Guest dock", icon: "guestDock", note: "First come, first served", verified: false },
      { id: "showers", label: "Showers", icon: "showers", note: "Near the boat launch", verified: false },
    ],
    office: {
      hours: "Unstaffed — community-run",
      phone: "(360) 555-0177",
      location: "N/A",
    },
  },
];

/** Seed membership: every new member starts with just their home marina. */
export const defaultMemberMarinas: MemberMarinaMembership[] = [
  { marinaId: "shilshole", role: "home" },
];

/**
 * The marina this staff portal manages. Staff sessions are separate from a
 * member's marina-switching state — a staff account always manages its own
 * marina, so this is a fixed lookup, not reactive state.
 */
export const staffManagedMarina =
  sampleMarinas.find((m) => m.id === "shilshole") ?? sampleMarinas[0];

export const pinnedPosts: PinnedPost[] = [
  {
    id: "rules",
    title: "Marina rules & regulations",
    meta: "Updated Jun 2026",
    tone: "default",
  },
  {
    id: "emergency",
    title: "Emergency procedures",
    meta: "Updated May 2026",
    tone: "alert",
  },
];

export const announcements: Announcement[] = [
  {
    id: "fuel-dock",
    title: "Fuel dock closed Thursday",
    body: "Scheduled pump maintenance from 8am to 2pm. Fairwater fuel dock will remain open.",
    category: "maintenance",
    status: "sent",
    date: "Jul 19",
  },
  {
    id: "potluck",
    title: "Summer boater potluck — Aug 2",
    body: "Guest dock pavilion, 5:30pm. Sign up at the office to bring a dish.",
    category: "community",
    status: "sent",
    date: "Jul 17",
  },
  {
    id: "pump-out",
    title: "New pump-out station opens on E dock",
    body: "Second pump-out station now operational, reducing weekend wait times.",
    category: "general",
    status: "sent",
    date: "Jul 14",
  },
  {
    id: "inspection",
    title: "Q3 dock inspection notice",
    body: "Staff will inspect dock cleats and power pedestals on all docks the week of Jul 24. No action needed unless you're contacted directly.",
    category: "general",
    status: "scheduled",
    date: "Jul 24",
  },
  {
    id: "winter-storage",
    title: "Winter storage sign-up opens",
    body: "Reserve your winter haul-out and storage slot for the 2026–27 season.",
    category: "general",
    status: "draft",
    date: "",
  },
];

export const communityPosts: CommunityPost[] = [
  {
    id: "shore-power",
    authorName: "Jordan M.",
    initials: "JM",
    kind: "member",
    usageBadge: "Weekend",
    body: "Anyone have a spare 30-amp shore power adapter I could borrow this weekend?",
    hearts: 6,
    replies: 3,
    timeAgo: "2h ago",
  },
  {
    id: "fuel-card",
    authorName: "Alex R.",
    initials: "AR",
    kind: "visiting",
    visitingFrom: "Fairhaven",
    body: "Beautiful marina! Does the fuel dock take card after 6pm?",
    hearts: 2,
    replies: 2,
    timeAgo: "3h ago",
  },
];

export const contacts: Contact[] = [
  {
    id: "office",
    name: "Marina office",
    role: "General inquiries",
    phone: "(206) 555-0148",
  },
  {
    id: "operations",
    name: "Operations",
    role: "Dock & slip questions",
    phone: "(206) 555-0172",
  },
  {
    id: "harbor-emergency",
    name: "Harbor emergency line",
    role: "24 hours",
    phone: "(206) 555-0199",
    emergency: true,
  },
];

// ---- Staff side ----

const ACTIVE_MEMBERS = 142;
const VISITORS_THIS_WEEK = 5;
const POSTED_THIS_MONTH = 6;
const SIGNUP_RATE = "89%";
const PENDING_VERIFICATION = 3;

export const dashboardStats: DashboardStat[] = [
  { label: "Active members", value: String(ACTIVE_MEMBERS) },
  { label: "Visitors this week", value: String(VISITORS_THIS_WEEK), accent: true },
  { label: "Posted this month", value: String(POSTED_THIS_MONTH) },
  { label: "Member sign-up rate", value: SIGNUP_RATE },
];

/** Marina-wide member counts shown in the Members page header. */
export const memberSummary = {
  active: ACTIVE_MEMBERS,
  visitingThisWeek: VISITORS_THIS_WEEK,
  pendingVerification: PENDING_VERIFICATION,
};

export const staffMembers: StaffMember[] = [
  {
    id: "rosa",
    name: "Rosa T.",
    initials: "RT",
    usage: "Liveaboard",
    slip: "G14",
    verification: { kind: "verified" },
  },
  {
    id: "jordan",
    name: "Jordan M.",
    initials: "JM",
    usage: "Weekend & seasonal",
    slip: "F08",
    verification: { kind: "verified" },
  },
  {
    id: "alex",
    name: "Alex R.",
    initials: "AR",
    usage: "Visiting from Fairhaven",
    slip: "Guest dock 3",
    verification: { kind: "visiting", detail: "Visiting · 1 night" },
  },
  {
    id: "dave",
    name: "Dave K.",
    initials: "DK",
    usage: "Storage only",
    slip: "E22",
    verification: { kind: "pending", detail: "Pending — ID upload" },
  },
];

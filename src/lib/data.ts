// Mock data for Phase 1 — sample marina is Shilshole Bay Marina, matching the
// design mockup. Swap this module for real data fetching once the DB is wired.

import type {
  Announcement,
  CommunityPost,
  Contact,
  CurrentMarina,
  DashboardStat,
  MarinaSearchResult,
  PinnedPost,
  StaffMember,
} from "./types";

export const currentMarina: CurrentMarina = {
  id: "shilshole",
  name: "Shilshole Bay Marina",
  location: "Seattle, WA",
  slip: "Dock G · Slip 14",
  // No marina has uploaded a custom banner yet — every marina defaults to the
  // gradient banner until staff upload one.
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
};

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

export const marinaSearchResults: MarinaSearchResult[] = [
  {
    id: "fairhaven",
    name: "Fairhaven Marina",
    location: "Bellingham, WA",
    status: "verified",
    amenities: ["Fuel dock", "Pump-out", "Guest dock", "WiFi"],
  },
  {
    id: "elliott-bay",
    name: "Elliott Bay Marina",
    location: "Seattle, WA",
    status: "verified",
    amenities: ["Fuel dock", "Pump-out", "Laundry", "EV charging"],
  },
  {
    id: "port-townsend",
    name: "Port Townsend Boat Haven",
    location: "Port Townsend, WA",
    status: "community",
    amenities: ["Guest dock", "Showers"],
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

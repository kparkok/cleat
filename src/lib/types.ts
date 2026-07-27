// Domain types for Cleat Phase 1. No backend yet — these describe the shape
// of the mock data in data.ts and will map to DB models later.

export type AnnouncementCategory =
  | "emergency"
  | "maintenance"
  | "community"
  | "general";

export const ANNOUNCEMENT_CATEGORY_LABELS: Record<AnnouncementCategory, string> = {
  emergency: "Emergency",
  maintenance: "Maintenance",
  community: "Community",
  general: "General",
};

export type AnnouncementStatus = "sent" | "scheduled" | "draft";

export const ANNOUNCEMENT_STATUS_LABELS: Record<AnnouncementStatus, string> = {
  sent: "Sent",
  scheduled: "Scheduled",
  draft: "Draft",
};

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  status: AnnouncementStatus;
  /** Display date, e.g. "Jul 19". Empty for drafts. */
  date: string;
}

/** Rules / emergency info live as pinned posts on the marina board. */
export interface PinnedPost {
  id: string;
  title: string;
  meta: string;
  tone: "default" | "alert";
}

export interface PostComment {
  id: string;
  authorName: string;
  initials: string;
  /** True when this comment was written by the signed-in member. */
  authorIsMe?: boolean;
  body: string;
  timeAgo: string;
}

export interface CommunityPost {
  id: string;
  /** Which marina's community board this post lives on. */
  marinaId: string;
  authorName: string;
  initials: string;
  /** True for the signed-in member's own posts — drives the You tab's per-marina post lists. */
  authorIsMe?: boolean;
  /** A member of this marina, or someone visiting from elsewhere. */
  kind: "member" | "visiting";
  /** Home marina name, when kind === "visiting". */
  visitingFrom?: string;
  body: string;
  /** Total like count (all members including the current one). */
  hearts: number;
  /** Whether the signed-in member has liked this post. */
  likedByMe: boolean;
  /** Flat reply list — no nested threading. */
  comments: PostComment[];
  timeAgo: string;
  /** Display date, e.g. "Jul 18" — used on the You tab's nested post lists. */
  date: string;
}

/** The signed-in member, shown on the You tab's profile header. */
export interface MemberProfile {
  name: string;
  initials: string;
  email: string;
  username: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  emergency?: boolean;
}

/** Live tide/wind/water conditions shown in the home screen's sounding strip. */
export interface MarinaConditions {
  tide: string;
  tideTrend: string;
  waterTemp: string;
  wind: string;
}

/** One row of the marina profile's hours card, e.g. "Fri – Sun" / "8:00 AM – 6:00 PM". */
export interface MarinaHoursRow {
  label: string;
  time: string;
  isToday?: boolean;
}

export interface MarinaHours {
  rows: MarinaHoursRow[];
  /** Shown as its own row — fuel dock hours often differ from office hours. */
  fuelDock: string;
}

/** Icon keys for amenity tiles on the marina profile screen. */
export type AmenityIconId =
  | "fuel"
  | "pumpOut"
  | "showers"
  | "wifi"
  | "evCharging"
  | "laundry"
  | "ice"
  | "dogArea"
  | "guestDock";

export interface Amenity {
  id: string;
  label: string;
  icon: AmenityIconId;
  note: string;
  /** true = staff-confirmed; false = member-submitted, shown with a dashed border. */
  verified: boolean;
}

/**
 * A marina's full profile — used both as "the marina a member currently has
 * open" and as an entry in the searchable marina directory. Every marina in
 * `sampleMarinas` has this full shape, so switching marinas is just picking
 * a different one of these, not fetching a differently-shaped record.
 */
export interface Marina {
  id: string;
  name: string;
  location: string;
  /** This member's slip/dock assignment at this marina. */
  slip: string;
  /** Custom banner uploaded by marina staff. Falls back to the default gradient banner when unset. */
  bannerImageUrl?: string;
  status: "verified" | "community";
  conditions: MarinaConditions;
  hours: MarinaHours;
  amenities: Amenity[];
  office: {
    hours: string;
    phone: string;
    location: string;
  };
}

/**
 * One marina a member belongs to — their single "home" marina (where their
 * boat lives) plus any number of marinas they're just visiting.
 */
export interface MemberMarinaMembership {
  marinaId: string;
  role: "home" | "visiting";
  /** When this became a "visiting" membership, e.g. "Jul 20" — unused for "home". */
  visitedDates?: string;
}

// ---- Staff side ----

export type MemberVerification =
  | { kind: "verified" }
  | { kind: "visiting"; detail: string }
  | { kind: "pending"; detail: string };

export interface StaffMember {
  id: string;
  name: string;
  initials: string;
  usage: string;
  slip: string;
  verification: MemberVerification;
}

export interface DashboardStat {
  label: string;
  value: string;
  accent?: boolean;
}

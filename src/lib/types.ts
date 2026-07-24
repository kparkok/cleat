// Domain types for Cleat Phase 1. No backend yet — these describe the shape
// of the mock data in data.ts and will map to DB models later.

export type UsageType = "liveaboard" | "weekend" | "storage";

export const USAGE_LABELS: Record<UsageType, string> = {
  liveaboard: "Liveaboard",
  weekend: "Weekend & seasonal",
  storage: "Storage only",
};

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

export interface CommunityPost {
  id: string;
  authorName: string;
  initials: string;
  /** A member of this marina, or someone visiting from elsewhere. */
  kind: "member" | "visiting";
  /** Home marina name, when kind === "visiting". */
  visitingFrom?: string;
  /** Usage label shown for members, e.g. "Weekend". */
  usageBadge?: string;
  body: string;
  hearts: number;
  replies: number;
  timeAgo: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  emergency?: boolean;
}

export interface MarinaSearchResult {
  id: string;
  name: string;
  location: string;
  status: "verified" | "community";
  /** Short amenity labels previewed as chips under the result card. */
  amenities: string[];
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
  | "dogArea";

export interface Amenity {
  id: string;
  label: string;
  icon: AmenityIconId;
  note: string;
  /** true = staff-confirmed; false = member-submitted, shown with a dashed border. */
  verified: boolean;
}

export interface CurrentMarina {
  id: string;
  name: string;
  location: string;
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

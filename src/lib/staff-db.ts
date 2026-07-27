import { supabase } from "./supabase";
import { toAnnouncement, type DbAnnouncementRow } from "./news-db";
import type { Announcement, DashboardStat, MemberVerification, StaffMember } from "./types";

/**
 * Staff auth doesn't exist yet ("that comes once real auth is finished
 * later today") — every staff session manages this one fixed marina, the
 * same implied-current-user pattern the member side used before it had real
 * auth. Swap for a real staff-account → marina lookup once staff auth lands.
 */
const STAFF_MARINA_ID = "shilshole";

function countQuery(table: "marina_memberships" | "community_posts") {
  return supabase.from(table).select("*", { count: "exact", head: true });
}

function sevenDaysAgoIso(): string {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

// Shared by the dashboard and the members page so the two screens can never
// disagree about what "active members" or "visitors this week" means.

async function countActiveMembers(): Promise<number> {
  const { count, error } = await countQuery("marina_memberships")
    .eq("marina_id", STAFF_MARINA_ID)
    .eq("role", "home");
  if (error) throw error;
  return count ?? 0;
}

async function countVisitorsThisWeek(): Promise<number> {
  const { count, error } = await countQuery("marina_memberships")
    .eq("marina_id", STAFF_MARINA_ID)
    .eq("role", "visiting")
    .gte("created_at", sevenDaysAgoIso());
  if (error) throw error;
  return count ?? 0;
}

async function countPendingVerification(): Promise<number> {
  const { count, error } = await countQuery("marina_memberships")
    .eq("marina_id", STAFF_MARINA_ID)
    .eq("verification_status", "pending");
  if (error) throw error;
  return count ?? 0;
}

// ── dashboard ────────────────────────────────────────────────────────────────

export async function fetchDashboardData(): Promise<{
  marinaName: string;
  stats: DashboardStat[];
  announcements: Announcement[];
}> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    marinaResult,
    activeCount,
    visitorsCount,
    totalMembershipsResult,
    verifiedMembershipsResult,
    postsThisMonthResult,
    announcementsResult,
  ] = await Promise.all([
    supabase.from("marinas").select("name").eq("id", STAFF_MARINA_ID).single(),
    countActiveMembers(),
    countVisitorsThisWeek(),
    countQuery("marina_memberships").eq("marina_id", STAFF_MARINA_ID),
    countQuery("marina_memberships")
      .eq("marina_id", STAFF_MARINA_ID)
      .eq("verification_status", "verified"),
    countQuery("community_posts").eq("marina_id", STAFF_MARINA_ID).gte("created_at", startOfMonth),
    supabase
      .from("announcements")
      .select("*")
      .eq("marina_id", STAFF_MARINA_ID)
      .order("created_at", { ascending: false }),
  ]);

  for (const result of [
    marinaResult,
    totalMembershipsResult,
    verifiedMembershipsResult,
    postsThisMonthResult,
    announcementsResult,
  ]) {
    if (result.error) throw result.error;
  }

  const totalMemberships = totalMembershipsResult.count ?? 0;
  const verifiedMemberships = verifiedMembershipsResult.count ?? 0;
  // Defined as "% of this marina's memberships (home + visiting) that are
  // fully verified" — the closest honest proxy the schema supports. There's
  // no independent "prospective members" denominator to compute a true
  // conversion rate against.
  const signUpRate =
    totalMemberships > 0 ? `${Math.round((verifiedMemberships / totalMemberships) * 100)}%` : "—";

  const stats: DashboardStat[] = [
    { label: "Active members", value: String(activeCount) },
    { label: "Visitors this week", value: String(visitorsCount), accent: true },
    { label: "Posted this month", value: String(postsThisMonthResult.count ?? 0) },
    { label: "Member sign-up rate", value: signUpRate },
  ];

  const announcements = (announcementsResult.data as DbAnnouncementRow[]).map(toAnnouncement);

  return {
    marinaName: (marinaResult.data as { name: string }).name,
    stats,
    announcements,
  };
}

// ── members list ─────────────────────────────────────────────────────────────

export interface StaffMemberSummary {
  active: number;
  visitingThisWeek: number;
  pendingVerification: number;
}

interface DbMembershipRow {
  member_id: string;
  slip: string | null;
  usage_type: string | null;
  verification_status: "verified" | "visiting" | "pending";
  verification_detail: string | null;
  members: { name: string; initials: string } | null;
}

function toVerification(
  status: DbMembershipRow["verification_status"],
  detail: string | null,
): MemberVerification {
  if (status === "verified") return { kind: "verified" };
  if (status === "visiting") return { kind: "visiting", detail: detail ?? "Visiting" };
  return { kind: "pending", detail: detail ?? "Pending" };
}

export async function fetchMembersData(): Promise<{
  summary: StaffMemberSummary;
  members: StaffMember[];
}> {
  const [active, visitingThisWeek, pendingVerification, membershipsResult] = await Promise.all([
    countActiveMembers(),
    countVisitorsThisWeek(),
    countPendingVerification(),
    supabase
      .from("marina_memberships")
      .select(
        "member_id, slip, usage_type, verification_status, verification_detail, members(name, initials)",
      )
      .eq("marina_id", STAFF_MARINA_ID)
      .order("created_at", { ascending: true }),
  ]);

  if (membershipsResult.error) throw membershipsResult.error;
  const rows = membershipsResult.data as unknown as DbMembershipRow[];

  const members: StaffMember[] = rows.map((row) => ({
    id: row.member_id,
    name: row.members?.name ?? "Unknown",
    initials: row.members?.initials ?? "?",
    // Staff-authored free text — e.g. "Liveaboard", "Storage only", or
    // "Visiting from Fairhaven" for a visiting member. Already display-ready.
    usage: row.usage_type ?? "—",
    slip: row.slip ?? "—",
    verification: toVerification(row.verification_status, row.verification_detail),
  }));

  return {
    summary: { active, visitingThisWeek, pendingVerification },
    members,
  };
}

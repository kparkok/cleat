import { supabase } from "./supabase";
import type { MemberMarinaMembership, MemberProfile } from "./types";

// Rosa's fixed UUID — replaced by real auth once Supabase Auth is wired in.
// Shared with news-db.ts so both modules stay in sync.
export const CURRENT_MEMBER_ID = "00000000-0000-0000-0000-000000000001";

/** Fetches member profile and marina memberships in a single request. */
export async function fetchMemberData(): Promise<{
  member: MemberProfile;
  memberships: MemberMarinaMembership[];
}> {
  const { data, error } = await supabase
    .from("members")
    .select("name, initials, email, username, marina_memberships(marina_id, role, visited_dates, created_at)")
    .eq("id", CURRENT_MEMBER_ID)
    .single();

  if (error) throw error;

  const row = data as {
    name: string;
    initials: string;
    email: string;
    username: string;
    marina_memberships: { marina_id: string; role: "home" | "visiting"; visited_dates: string | null; created_at: string }[];
  };

  return {
    member: { name: row.name, initials: row.initials, email: row.email, username: row.username },
    memberships: (row.marina_memberships ?? [])
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((m) => ({
        marinaId: m.marina_id,
        role: m.role,
        visitedDates: m.visited_dates ?? undefined,
      })),
  };
}

// Demotes the current home marina to "visiting" in DB when a new home is chosen.
export async function demoteHomeMembership(today: string): Promise<void> {
  const { error } = await supabase
    .from("marina_memberships")
    .update({ role: "visiting", visited_dates: today })
    .eq("member_id", CURRENT_MEMBER_ID)
    .eq("role", "home");

  if (error) throw error;
}

// Upserts a membership row. Only touches role and visited_dates — leaves
// staff-managed fields (slip, verification_status, etc.) untouched on update.
export async function upsertMembership(
  marinaId: string,
  role: "home" | "visiting",
  visitedDates?: string,
): Promise<void> {
  const { error } = await supabase.from("marina_memberships").upsert(
    {
      member_id: CURRENT_MEMBER_ID,
      marina_id: marinaId,
      role,
      visited_dates: role === "visiting" ? (visitedDates ?? null) : null,
    },
    { onConflict: "member_id,marina_id" },
  );

  if (error) throw error;
}

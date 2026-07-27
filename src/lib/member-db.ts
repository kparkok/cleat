import { supabase } from "./supabase";
import { describeError } from "./errors";
import type { MemberMarinaMembership, MemberProfile } from "./types";

/**
 * The signed-in member's `members.id` — NOT the same value as their
 * auth.users id. members.id is its own independent UUID; auth_user_id is
 * just a soft link onto it (see 002_auth.sql), so every query that filters
 * by member/author id needs the real members.id, resolved here.
 * Throws if called with nobody signed in, or if this auth account hasn't
 * been linked to a member row yet — every caller in this app only runs
 * once MarinaProvider has mounted, which AuthGate guarantees happens after
 * both authentication AND linking (see AuthProvider's handleSession).
 */
export async function getCurrentMemberId(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("members")
    .select("id")
    .eq("auth_user_id", session.user.id)
    .single();
  if (error) {
    console.error("[member-db] getCurrentMemberId query failed:", describeError(error));
    throw error;
  }
  return (data as { id: string }).id;
}

/** Fetches member profile and marina memberships in a single request. */
export async function fetchMemberData(): Promise<{
  member: MemberProfile;
  memberships: MemberMarinaMembership[];
}> {
  const memberId = await getCurrentMemberId();
  const { data, error } = await supabase
    .from("members")
    .select("name, initials, email, username, marina_memberships(marina_id, role, visited_dates, created_at)")
    .eq("id", memberId)
    .single();

  if (error) {
    console.error("[member-db] fetchMemberData query failed:", describeError(error));
    throw error;
  }

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
  const memberId = await getCurrentMemberId();
  const { error } = await supabase
    .from("marina_memberships")
    .update({ role: "visiting", visited_dates: today })
    .eq("member_id", memberId)
    .eq("role", "home");

  if (error) {
    console.error("[member-db] demoteHomeMembership failed:", describeError(error));
    throw error;
  }
}

// Upserts a membership row. Only touches role and visited_dates — leaves
// staff-managed fields (slip, verification_status, etc.) untouched on update.
export async function upsertMembership(
  marinaId: string,
  role: "home" | "visiting",
  visitedDates?: string,
): Promise<void> {
  const memberId = await getCurrentMemberId();
  const { error } = await supabase.from("marina_memberships").upsert(
    {
      member_id: memberId,
      marina_id: marinaId,
      role,
      visited_dates: role === "visiting" ? (visitedDates ?? null) : null,
    },
    { onConflict: "member_id,marina_id" },
  );

  if (error) {
    console.error("[member-db] upsertMembership failed:", describeError(error), {
      memberId,
      marinaId,
      role,
    });
    throw error;
  }
}

import { supabase } from "./supabase";
import { describeError } from "./errors";

/**
 * Sends a passwordless sign-in link to the given email. Supabase creates the
 * auth.users row the first time someone actually completes the link —
 * sending the email doesn't create an account by itself. Whether that
 * account has a matching `members` row is resolved separately (see
 * findLinkedMemberId / createMemberProfile below).
 */
export async function sendMagicLink(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/onboarding` },
  });
  if (error) {
    console.error("[auth-db] sendMagicLink failed:", describeError(error));
    throw error;
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[auth-db] signOut failed:", describeError(error));
    throw error;
  }
}

export type MemberRole = "member" | "staff";

export interface LinkedMember {
  id: string;
  role: MemberRole;
}

/**
 * Does this auth account already have a linked `members` row? Read-only —
 * never creates or claims anything. Returns the member id + role if linked,
 * else null (meaning: this is a first-time sign-in and needs the new-member
 * flow — see NewMemberFlow).
 */
export async function findLinkedMember(userId: string): Promise<LinkedMember | null> {
  // TEMPORARY DEBUG LOGGING — remove once the stuck-loading bug is found.
  console.log("[auth-db] findLinkedMember: querying members where auth_user_id =", userId);
  const { data, error } = await supabase
    .from("members")
    .select("id, role")
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("[auth-db] findLinkedMember query failed:", describeError(error));
    throw error;
  }
  console.log("[auth-db] findLinkedMember: query settled", { data });
  return data as LinkedMember | null;
}

/**
 * Creates a brand-new member row for a first-time sign-in, once they've
 * chosen a username (their home marina is a separate step — see
 * NewMemberFlow, which calls upsertMembership() right after this).
 *
 * This never touches or claims Rosa's row or any of the other seeded rows —
 * every sign-in that reaches this point gets its own fresh row. The 5
 * seeded members exist purely as demo/test data and are never linked to a
 * real auth account by app code.
 */
export async function createMemberProfile(params: {
  userId: string;
  email: string;
  username: string;
}): Promise<string> {
  const { userId, email, username } = params;
  const name = username.charAt(0).toUpperCase() + username.slice(1);
  const initials = username.charAt(0).toUpperCase();

  const { data, error } = await supabase
    .from("members")
    .insert({ auth_user_id: userId, name, initials, email, username })
    .select("id")
    .single();

  if (error) {
    console.error("[auth-db] createMemberProfile insert failed:", describeError(error), {
      userId,
      email,
      username,
    });
    if (error.code === "23505") {
      throw new Error("That username is already taken — try another.");
    }
    throw error;
  }
  return (data as { id: string }).id;
}

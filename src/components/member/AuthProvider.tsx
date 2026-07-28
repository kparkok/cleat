"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { findLinkedMember, type MemberRole } from "@/lib/auth-db";
import { describeError } from "@/lib/errors";

// Must match MarinaProvider's STORAGE_KEY — cleared on sign-out so the next
// person to sign in on this device/browser doesn't inherit a stale active
// marina from whoever was signed in before them.
const MARINA_STORAGE_KEY = "cleat:member-marinas";

interface AuthContextValue {
  user: User | null;
  memberId: string | null;
  role: MemberRole | null;
  setMemberId: (id: string, role?: MemberRole) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [role, setRole] = useState<MemberRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let resolvedOnce = false;

    // TEMPORARY DEBUG LOGGING — remove once the stuck-loading bug is found.
    async function handleSession(session: Session | null, source: string) {
      console.log(`[AuthProvider] handleSession() called — source: "${source}"`, {
        hasSession: !!session,
        userId: session?.user?.id ?? null,
        email: session?.user?.email ?? null,
        expiresAt: session?.expires_at ?? null,
      });

      const nextUser = session?.user ?? null;
      let nextMemberId: string | null = null;
      let nextRole: MemberRole | null = null;

      if (nextUser) {
        console.log("[AuthProvider] → calling findLinkedMember(", nextUser.id, ")");
        try {
          const linked = await findLinkedMember(nextUser.id);
          nextMemberId = linked?.id ?? null;
          nextRole = linked?.role ?? null;
          console.log("[AuthProvider] ← findLinkedMember resolved:", linked);
        } catch (err) {
          console.error("[AuthProvider] ← findLinkedMember THREW:", describeError(err));
        }
      } else {
        console.log("[AuthProvider] no user on this session — skipping findLinkedMember");
      }

      console.log("[AuthProvider] setUser(", nextUser?.id ?? null, ")");
      setUser(nextUser);
      console.log("[AuthProvider] setMemberId(", nextMemberId, ") setRole(", nextRole, ")");
      setMemberId(nextMemberId);
      setRole(nextRole);

      if (!resolvedOnce) {
        resolvedOnce = true;
        console.log(`[AuthProvider] setLoading(false) — FIRST resolution, triggered by "${source}"`);
        setLoading(false);
      } else {
        console.log(
          `[AuthProvider] loading already resolved once — NOT calling setLoading again (source: "${source}")`,
        );
      }
    }

    console.log("[AuthProvider] mount — calling supabase.auth.getSession()");
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        console.log("[AuthProvider] getSession() resolved", { hasSession: !!session, error });
        handleSession(session, "getSession()");
      })
      .catch((err) => {
        console.error("[AuthProvider] getSession() itself THREW (unexpected):", err);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[AuthProvider] onAuthStateChange fired — event: "${event}"`, {
        hasSession: !!session,
        userId: session?.user?.id ?? null,
      });
      handleSession(session, `onAuthStateChange:${event}`);
      if (event === "SIGNED_OUT") {
        try {
          window.localStorage.removeItem(MARINA_STORAGE_KEY);
        } catch {
          // Storage unavailable — nothing to clean up.
        }
      }
    });

    return () => {
      console.log("[AuthProvider] effect cleanup — unsubscribing");
      subscription.unsubscribe();
    };
  }, []);

  console.log(
    "[AuthProvider] render — loading:",
    loading,
    "user:",
    user?.id ?? null,
    "memberId:",
    memberId,
    "role:",
    role,
  );

  // Used by NewMemberFlow right after createMemberProfile() — brand-new
  // profiles always start with the DB default role ('member'), so the role
  // param is optional and only meaningful for callers that already know
  // otherwise (none yet).
  function setMemberIdAndRole(id: string, nextRole: MemberRole = "member") {
    setMemberId(id);
    setRole(nextRole);
  }

  return (
    <AuthContext.Provider value={{ user, memberId, role, setMemberId: setMemberIdAndRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

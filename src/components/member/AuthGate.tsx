"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/components/member/AuthProvider";
import { SignInScreen } from "@/components/member/SignInScreen";
import { NewMemberFlow } from "@/components/member/NewMemberFlow";
import { MarinaProvider } from "@/components/member/MarinaProvider";

/**
 * The real entry point to the member app: nothing behind this renders until
 * someone is signed in AND linked to a member row. MarinaProvider only ever
 * mounts once memberId exists, so its data-fetching effects can assume a
 * resolvable member row — no internal auth-gating needed there.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, memberId, loading } = useAuth();

  // TEMPORARY DEBUG LOGGING — remove once the stuck-loading bug is found.
  console.log("[AuthGate] render — loading:", loading, "user:", user?.id ?? null, "memberId:", memberId);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-navy">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-dock border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <SignInScreen />;
  }

  if (!memberId) {
    return <NewMemberFlow />;
  }

  return <MarinaProvider>{children}</MarinaProvider>;
}

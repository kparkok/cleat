"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/member/AuthProvider";
import { SignInScreen } from "@/components/member/SignInScreen";

/**
 * The real entry point to the staff portal, mirroring AuthGate on the
 * member side: nothing behind this renders until someone is signed in AND
 * their linked member row has role = 'staff'. A signed-in non-staff member
 * (or an authenticated-but-unlinked account) is bounced to the member app,
 * where the member-side AuthGate takes over and decides what they see next
 * (including NewMemberFlow, if they're not linked to a member row at all).
 */
export function StaffGate({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const isStaff = role === "staff";
  const shouldRedirect = !loading && !!user && !isStaff;

  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/home");
    }
  }, [shouldRedirect, router]);

  if (loading || shouldRedirect) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    // SignInScreen expects a flex parent to stretch into (it's normally
    // nested inside the member layout's phone-frame column) — reproduce
    // that here since the staff shell has no equivalent wrapper.
    return (
      <div className="flex min-h-dvh flex-col bg-navy">
        <SignInScreen />
      </div>
    );
  }

  return <>{children}</>;
}

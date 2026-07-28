import type { ReactNode } from "react";
import { AuthProvider } from "@/components/member/AuthProvider";
import { StaffGate } from "@/components/staff/StaffGate";
import Sidebar from "@/components/staff/Sidebar";

/**
 * Staff app shell. AuthProvider + StaffGate wrap everything here, mirroring
 * the member layout's AuthProvider + AuthGate — no staff route renders
 * unless the signed-in member's role is 'staff'. This is a separate
 * AuthProvider instance from the member layout's (different route group,
 * different subtree); both read the same Supabase session independently.
 */
export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <StaffGate>
        <div className="flex min-h-dvh bg-paper">
          <Sidebar />
          <main className="flex-1 overflow-y-auto px-[30px] py-[26px]">
            {children}
          </main>
        </div>
      </StaffGate>
    </AuthProvider>
  );
}

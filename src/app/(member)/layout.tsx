import type { ReactNode } from "react";
import { AuthProvider } from "@/components/member/AuthProvider";
import { AuthGate } from "@/components/member/AuthGate";

/**
 * Member app shell. Mobile-first: fills the screen on phones, and on wider
 * viewports caps to a phone-width column centered on the deep-navy background
 * (a nod to the mockup's device frame). Child layouts add the tab bar.
 *
 * AuthProvider + AuthGate wrap everything here — no member route (including
 * onboarding) renders until someone is signed in. Once authenticated,
 * AuthGate mounts MarinaProvider, which the rest of the member app reads
 * marina/membership/post state from.
 */
export default function MemberLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center bg-navy-deep">
      <div className="relative flex min-h-dvh w-full max-w-[440px] flex-col overflow-hidden bg-paper shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
        <AuthProvider>
          <AuthGate>{children}</AuthGate>
        </AuthProvider>
      </div>
    </div>
  );
}

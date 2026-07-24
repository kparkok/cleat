import type { ReactNode } from "react";
import { MarinaProvider } from "@/components/member/MarinaProvider";

/**
 * Member app shell. Mobile-first: fills the screen on phones, and on wider
 * viewports caps to a phone-width column centered on the deep-navy background
 * (a nod to the mockup's device frame). Child layouts add the tab bar.
 *
 * MarinaProvider wraps everything here (onboarding, the marina switcher, and
 * the tabbed screens) since all of them read or write which marina is active.
 */
export default function MemberLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center bg-navy-deep">
      <div className="relative flex min-h-dvh w-full max-w-[440px] flex-col overflow-hidden bg-paper shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
        <MarinaProvider>{children}</MarinaProvider>
      </div>
    </div>
  );
}

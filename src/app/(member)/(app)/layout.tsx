import type { ReactNode } from "react";
import TabBar from "@/components/member/TabBar";

/**
 * Layout for the tab-bar screens (Home / News / You / Contacts). Onboarding and
 * the marina switcher sit outside this group so they render full-bleed with no
 * tab bar, matching the mockup.
 */
export default function TabbedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="no-scrollbar flex-1 overflow-y-auto">{children}</div>
      <TabBar />
    </>
  );
}

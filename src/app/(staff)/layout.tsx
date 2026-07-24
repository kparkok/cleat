import type { ReactNode } from "react";
import Sidebar from "@/components/staff/Sidebar";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-paper">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-[30px] py-[26px]">
        {children}
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, NewsIcon, UserIcon } from "@/components/icons";

const TABS = [
  { href: "/home", label: "Home", Icon: HomeIcon, match: ["/home"] },
  { href: "/news", label: "News", Icon: NewsIcon, match: ["/news"] },
  // Contacts lives under the "You" area, so it keeps this tab active too.
  { href: "/you", label: "You", Icon: UserIcon, match: ["/you", "/contacts"] },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="flex h-15 shrink-0 items-center justify-around border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
      {TABS.map(({ href, label, Icon, match }) => {
        const active = match.some(
          (m) => pathname === m || pathname.startsWith(`${m}/`),
        );
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 ${
              active ? "text-navy" : "text-ink-soft"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="u-mono text-[8.5px] tracking-[0.03em]">
              {label.toUpperCase()}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

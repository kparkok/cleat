"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, IssuesIcon, NewsIcon, UserIcon } from "@/components/icons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", Icon: HomeIcon },
  { href: "/announcements", label: "Announcements", Icon: NewsIcon },
  { href: "/members", label: "Members", Icon: UserIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex w-[190px] shrink-0 flex-col bg-navy py-5">
      <div className="mb-3.5 border-b border-paper/12 px-5 pb-5 font-serif text-base font-semibold text-paper">
        Cleat
      </div>
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href === "/announcements" ? "/announcements/new" : href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 px-5 py-[11px] text-[12.5px] ${
              active
                ? "border-r-2 border-dock bg-dock/14 text-dock"
                : "text-paper/55"
            }`}
          >
            <Icon className="h-[15px] w-[15px]" />
            {label}
          </Link>
        );
      })}
      <div className="flex items-center gap-2.5 px-5 py-[11px] text-[12.5px] text-paper/55 opacity-40">
        <IssuesIcon className="h-[15px] w-[15px]" />
        Issues (Phase 2)
      </div>
    </nav>
  );
}

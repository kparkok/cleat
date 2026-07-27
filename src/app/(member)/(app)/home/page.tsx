"use client";

import { useState } from "react";
import Link from "next/link";
import { HeroBanner } from "@/components/member/HeroBanner";
import { ConditionsStrip } from "@/components/member/ConditionsStrip";
import { MarinaSwitcherSheet } from "@/components/member/MarinaSwitcherSheet";
import { useMarina } from "@/components/member/MarinaProvider";
import { ChevronRightIcon, NewsIcon, UserIcon } from "@/components/icons";
import { announcements } from "@/lib/data";

const QUICK_ACTIONS = [
  { href: "/news", label: "Announcements", Icon: NewsIcon },
  { href: "/contacts", label: "Contacts", Icon: UserIcon },
];

export default function HomePage() {
  const { activeMarina } = useMarina();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const latest = announcements.find((a) => a.status === "sent") ?? announcements[0];

  return (
    <div className="relative flex flex-1 flex-col">
      <HeroBanner
        name={activeMarina.name}
        subtitle={activeMarina.location}
        imageUrl={activeMarina.bannerImageUrl}
        onNameClick={() => setShowSwitcher(true)}
      />
      <ConditionsStrip conditions={activeMarina.conditions} />

      <Link
        href="/news"
        className="mx-5 mt-4 flex items-start gap-2.5 rounded-xl border border-line bg-white p-3.5 transition-colors hover:border-dock"
      >
        <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-coral" />
        <span>
          <span className="block text-[13.5px] font-semibold text-navy">
            {latest.title}
          </span>
          <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-soft">
            {latest.body}
          </span>
        </span>
      </Link>

      <div className="grid grid-cols-2 gap-2.5 px-5 pb-1.5 pt-4">
        {QUICK_ACTIONS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-2 rounded-xl border border-line bg-white p-3.5 transition-colors hover:border-dock"
          >
            <span className="grid h-[26px] w-[26px] place-items-center rounded-[7px] bg-navy">
              <Icon className="h-[13px] w-[13px] text-dock" />
            </span>
            <span className="text-[12.5px] font-semibold text-navy">{label}</span>
          </Link>
        ))}
      </div>

      <Link
        href="/marina"
        className="mx-5 mb-4 mt-1.5 flex items-center justify-between rounded-[10px] bg-paper-dim p-[12px_14px] transition-opacity hover:opacity-80"
      >
        <span>
          <span className="block text-xs font-semibold text-navy">
            Marina office
          </span>
          <span className="u-mono mt-0.5 block text-[9.5px] text-ink-soft">
            {activeMarina.office.hours}
          </span>
        </span>
        <ChevronRightIcon className="h-3.5 w-3.5 text-ink-soft" />
      </Link>

      {showSwitcher && <MarinaSwitcherSheet onClose={() => setShowSwitcher(false)} />}
    </div>
  );
}

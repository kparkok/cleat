"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeroBanner } from "@/components/member/HeroBanner";
import { ConditionsStrip } from "@/components/member/ConditionsStrip";
import { MarinaSwitcherSheet } from "@/components/member/MarinaSwitcherSheet";
import { useMarina } from "@/components/member/MarinaProvider";
import { ChevronRightIcon, NewsIcon, UserIcon } from "@/components/icons";
import { describeError } from "@/lib/errors";
import type { LiveConditions } from "@/lib/types";

const QUICK_ACTIONS = [
  { href: "/news", label: "Announcements", Icon: NewsIcon },
  { href: "/contacts", label: "Contacts", Icon: UserIcon },
];

const LOADING_CONDITIONS: LiveConditions = {
  tide: { status: "loading" },
  wind: { status: "loading" },
};
const UNAVAILABLE_CONDITIONS: LiveConditions = {
  tide: { status: "unavailable" },
  wind: { status: "unavailable" },
};

export default function HomePage() {
  const { activeMarina, boardAnnouncements } = useMarina();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [liveConditions, setLiveConditions] = useState<LiveConditions>(LOADING_CONDITIONS);
  // fetchMarinaBoardData already filters to status "sent" and orders newest
  // first, so the first entry is the latest published announcement.
  const latest = boardAnnouncements[0];

  useEffect(() => {
    const { latitude, longitude } = activeMarina;
    if (latitude == null || longitude == null) {
      setLiveConditions(UNAVAILABLE_CONDITIONS);
      return;
    }

    let cancelled = false;
    setLiveConditions(LOADING_CONDITIONS);

    fetch(`/api/conditions?lat=${latitude}&lng=${longitude}`)
      .then((res) => {
        if (!res.ok) throw new Error(`/api/conditions responded ${res.status}`);
        return res.json() as Promise<LiveConditions>;
      })
      .then((data) => {
        if (!cancelled) setLiveConditions(data);
      })
      .catch((err) => {
        console.error("[HomePage] live conditions fetch failed:", describeError(err));
        if (!cancelled) setLiveConditions(UNAVAILABLE_CONDITIONS);
      });

    return () => {
      cancelled = true;
    };
  }, [activeMarina]);

  return (
    <div className="relative flex flex-1 flex-col">
      <HeroBanner
        name={activeMarina.name}
        subtitle={activeMarina.location}
        imageUrl={activeMarina.bannerImageUrl}
        onNameClick={() => setShowSwitcher(true)}
      />
      <ConditionsStrip live={liveConditions} />

      {latest && (
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
      )}

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

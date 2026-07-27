"use client";

import { useState } from "react";
import Link from "next/link";
import { useMarina } from "@/components/member/MarinaProvider";
import { MarinaSwitcherSheet } from "@/components/member/MarinaSwitcherSheet";
import { ChevronRightIcon, MarinaIcon } from "@/components/icons";

const BOTTOM_LINKS = ["Notification settings", "Sign out"];

export default function YouPage() {
  const { member, marinas, memberMarinas, myPosts } = useMarina();
  const [showSwitcher, setShowSwitcher] = useState(false);

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="flex items-center gap-3.5 bg-navy px-5 pb-5 pt-[calc(env(safe-area-inset-top)+18px)] text-paper">
        <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-dock font-serif text-[19px] font-semibold text-navy">
          {member.initials}
        </span>
        <div>
          <div className="font-serif text-[19px] font-semibold">{member.name}</div>
          {/* Not u-mono — that forces uppercase, which garbles an email address. */}
          <div className="mt-[3px] font-mono text-[10px] text-paper/50">
            @{member.username}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pb-2 pt-4">
        <span className="u-mono text-[10px] tracking-[0.1em] text-ink-soft">
          Your marinas
        </span>
        <button
          type="button"
          onClick={() => setShowSwitcher(true)}
          className="text-[10.5px] font-semibold text-seaglass transition-opacity hover:opacity-80"
        >
          Switch marina
        </button>
      </div>

      {memberMarinas.map((membership) => {
        const marina = marinas.find((m) => m.id === membership.marinaId);
        if (!marina) return null;

        const marinaPosts = myPosts.filter((p) => p.marinaId === marina.id);
        const shown = marinaPosts.slice(0, 2);
        const isHome = membership.role === "home";

        return (
          <div
            key={marina.id}
            className={`mx-5 mb-3 rounded-xl border bg-white p-3.5 ${
              isHome ? "border-dock" : "border-line"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] bg-paper-dim">
                <MarinaIcon className="h-4 w-4 text-navy" />
              </span>
              <div>
                <div className="text-[13px] font-semibold text-navy">{marina.name}</div>
                <div className="u-mono mt-0.5 text-[9px] text-ink-soft">
                  {isHome
                    ? marina.location
                    : `Visited ${membership.visitedDates ?? marina.location}`}
                </div>
              </div>
              <span
                className={`u-mono ml-auto shrink-0 rounded-full px-[7px] py-[2px] text-[7.5px] font-bold tracking-[0.05em] ${
                  isHome ? "bg-dock/22 text-[#8A6A2E]" : "bg-seaglass/12 text-seaglass"
                }`}
              >
                {isHome ? "Home" : "Past visit"}
              </span>
            </div>

            {shown.length > 0 && (
              <div className="mt-3 border-t border-line pt-3">
                {shown.map((post) => (
                  <div key={post.id} className="mb-2.5 last:mb-0">
                    <div className="text-[11.5px] leading-snug text-ink">{post.body}</div>
                    <div className="u-mono mt-[3px] text-[9px] text-ink-soft">
                      {post.date} · {post.hearts} reactions · {post.comments.length}{" "}
                      {post.comments.length === 1 ? "reply" : "replies"}
                    </div>
                  </div>
                ))}
                {marinaPosts.length > 2 && (
                  <Link
                    href={`/my-posts/${marina.id}`}
                    className="mt-1 block text-[11px] font-semibold text-seaglass"
                  >
                    See all {marinaPosts.length} posts →
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="mx-5 mb-4">
        {BOTTOM_LINKS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`flex w-full items-center justify-between py-3.5 text-left ${
              i < BOTTOM_LINKS.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <span className="text-[12.5px] font-semibold text-navy">{label}</span>
            <ChevronRightIcon className="h-3.5 w-3.5 text-ink-soft" />
          </button>
        ))}
      </div>

      {showSwitcher && <MarinaSwitcherSheet onClose={() => setShowSwitcher(false)} />}
    </div>
  );
}

"use client";

import { useState } from "react";
import { AppHeader } from "@/components/member/ui";
import { SegmentedToggle } from "@/components/member/SegmentedToggle";
import {
  AlertIcon,
  FileIcon,
  HeartIcon,
  MarinaIcon,
  PlusIcon,
  ReplyIcon,
} from "@/components/icons";
import { announcements, communityPosts, currentMarina, pinnedPosts } from "@/lib/data";
import { ANNOUNCEMENT_CATEGORY_LABELS, type AnnouncementCategory } from "@/lib/types";

type Board = "marina" | "community";

const BOARD_OPTIONS: { value: Board; label: string }[] = [
  { value: "marina", label: "Marina board" },
  { value: "community", label: "Community" },
];

const CATEGORY_CLASSNAMES: Record<AnnouncementCategory, string> = {
  emergency: "text-coral",
  maintenance: "text-[#8A6A2E]",
  community: "text-navy",
  general: "text-navy",
};

export default function NewsPage() {
  const [board, setBoard] = useState<Board>("marina");
  const posted = announcements.filter((a) => a.status === "sent");

  return (
    <div className="relative flex flex-1 flex-col">
      <AppHeader title="Announcements" subtitle={currentMarina.name} />
      <SegmentedToggle value={board} onChange={setBoard} options={BOARD_OPTIONS} />

      {board === "marina" ? (
        <div className="pb-4">
          <div className="u-mono px-5 pb-2 pt-3.5 text-[10px] tracking-[0.1em] text-ink-soft">
            Pinned
          </div>
          {pinnedPosts.map((post) => (
            <div
              key={post.id}
              className="mx-5 mb-2.5 flex items-center gap-[11px] rounded-xl border border-dock bg-white p-[11px_13px]"
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                  post.tone === "alert" ? "bg-coral/12" : "bg-navy"
                }`}
              >
                {post.tone === "alert" ? (
                  <AlertIcon className="h-[15px] w-[15px] text-coral" />
                ) : (
                  <FileIcon className="h-[15px] w-[15px] text-dock" />
                )}
              </span>
              <div>
                <div className="text-[12.5px] font-semibold text-navy">
                  {post.title}
                </div>
                <div className="u-mono mt-0.5 text-[9px] text-ink-soft">
                  {post.meta}
                </div>
              </div>
            </div>
          ))}

          <div className="u-mono px-5 pb-2 pt-4 text-[10px] tracking-[0.1em] text-ink-soft">
            Recent
          </div>
          {posted.map((item, i) => (
            <div
              key={item.id}
              className={`mx-5 pb-3 ${
                i < posted.length - 1 ? "mb-3 border-b border-line" : ""
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span
                  className={`u-mono text-[8.5px] font-bold ${CATEGORY_CLASSNAMES[item.category]}`}
                >
                  {ANNOUNCEMENT_CATEGORY_LABELS[item.category]}
                </span>
                <span className="u-mono text-[9.5px] text-ink-soft">
                  {item.date}
                </span>
              </div>
              <div className="mb-0.5 text-[13.5px] font-semibold text-navy">
                {item.title}
              </div>
              <div className="text-[11.5px] leading-relaxed text-ink-soft">
                {item.body}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative flex-1 pb-4">
          <div className="mx-5 mb-3 mt-3.5 rounded-[10px] border border-seaglass/25 bg-seaglass/8 p-2.5 text-[10.5px] leading-relaxed text-ink-soft">
            <b className="text-seaglass">Member-run.</b> Posts here come from
            other marina members, not staff.
          </div>

          {communityPosts.map((post) => (
            <div
              key={post.id}
              className="mx-5 mb-3 rounded-xl border border-line bg-white p-[13px_14px]"
            >
              <div className="mb-2 flex items-center gap-[9px]">
                <span className="u-mono grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-paper-dim text-[9.5px] font-bold text-navy">
                  {post.initials}
                </span>
                <div>
                  <div className="text-xs font-semibold text-navy">
                    {post.authorName}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    {post.kind === "member" ? (
                      <>
                        <span className="u-mono rounded-full bg-seaglass/12 px-[7px] py-[2px] text-[7.5px] font-bold text-seaglass">
                          Member
                        </span>
                        {post.usageBadge && (
                          <span className="u-mono rounded-full bg-paper-dim px-[7px] py-[2px] text-[7.5px] font-bold text-ink-soft">
                            {post.usageBadge}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="u-mono inline-flex items-center gap-[3px] rounded-full bg-dock/22 px-[7px] py-[2px] text-[7.5px] font-bold text-[#8A6A2E]">
                        <MarinaIcon className="h-2 w-2" strokeWidth={2.5} />
                        Visiting from {post.visitingFrom}
                      </span>
                    )}
                  </div>
                </div>
                <span className="u-mono ml-auto shrink-0 text-[9px] text-ink-soft">
                  {post.timeAgo}
                </span>
              </div>
              <div className="text-[11.5px] leading-relaxed text-ink">
                {post.body}
              </div>
              <div className="mt-2.5 flex gap-3.5 border-t border-line pt-2">
                <span className="flex items-center gap-[5px] text-[10.5px] text-ink-soft">
                  <HeartIcon className="h-3 w-3" />
                  {post.hearts}
                </span>
                <span className="flex items-center gap-[5px] text-[10.5px] text-ink-soft">
                  <ReplyIcon className="h-3 w-3" />
                  {post.replies} replies
                </span>
              </div>
            </div>
          ))}

          <button
            type="button"
            aria-label="New community post"
            className="fixed bottom-[calc(60px+env(safe-area-inset-bottom)+18px)] right-[max(16px,calc((100vw-440px)/2+16px))] grid h-11 w-11 place-items-center rounded-full bg-coral shadow-[0_8px_20px_rgba(224,96,47,0.4)] transition-opacity hover:opacity-90"
          >
            <PlusIcon className="h-[18px] w-[18px] text-white" strokeWidth={2.2} />
          </button>
        </div>
      )}
    </div>
  );
}

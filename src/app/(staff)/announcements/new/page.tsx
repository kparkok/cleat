"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ANNOUNCEMENT_CATEGORY_LABELS, type AnnouncementCategory } from "@/lib/types";

const CATEGORIES = Object.keys(ANNOUNCEMENT_CATEGORY_LABELS) as AnnouncementCategory[];

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [category, setCategory] = useState<AnnouncementCategory>("maintenance");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  function submit() {
    // No backend yet — this just returns to the dashboard as a stand-in for
    // "announcement created."
    router.push("/dashboard");
  }

  return (
    <>
      <h1 className="font-serif text-[22px] font-semibold text-navy">
        New announcement
      </h1>
      <div className="u-mono mb-[22px] mt-1 text-[11px] text-ink-soft">
        Posts to the marina board, separate from the community board
      </div>

      <div className="max-w-[560px] rounded-[10px] border border-line bg-white p-[22px]">
        <div className="mb-4">
          <div className="u-mono mb-[7px] text-[10px] tracking-[0.06em] text-ink-soft">
            Category
          </div>
          <div className="flex gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3 py-[7px] text-[11.5px] ${
                  category === c
                    ? "border-navy bg-navy text-paper"
                    : "border-line bg-paper text-ink-soft"
                }`}
              >
                {ANNOUNCEMENT_CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="u-mono mb-[7px] block text-[10px] tracking-[0.06em] text-ink-soft">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Q3 dock inspection notice"
            className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-[13px] text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>

        <div className="mb-4">
          <label className="u-mono mb-[7px] block text-[10px] tracking-[0.06em] text-ink-soft">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Staff will inspect dock cleats and power pedestals on all docks the week of Jul 24. No action needed unless you're contacted directly."
            className="min-h-20 w-full resize-y rounded-lg border border-line bg-paper px-3 py-2.5 text-[13px] text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={submit}
            className="rounded-lg bg-coral px-5 py-[11px] text-[13px] font-bold text-white transition-opacity hover:opacity-90"
          >
            Publish
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-lg border border-line px-5 py-[11px] text-[13px] font-semibold text-ink-soft transition-colors hover:bg-paper"
          >
            Save as draft
          </button>
        </div>
      </div>
    </>
  );
}

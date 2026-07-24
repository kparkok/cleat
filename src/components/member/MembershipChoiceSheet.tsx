"use client";

import { useState } from "react";
import type { Marina } from "@/lib/types";

export type MembershipChoice = "member" | "visiting";

/**
 * Bottom-sheet "is this your home marina, or are you visiting?" choice —
 * the one place this question is asked. Used identically by the marina
 * switcher and by onboarding's marina-selection step.
 */
export function MembershipChoiceSheet({
  marina,
  initialChoice = "visiting",
  onConfirm,
  onDismiss,
}: {
  marina: Marina;
  initialChoice?: MembershipChoice;
  onConfirm: (choice: MembershipChoice) => void;
  onDismiss: () => void;
}) {
  const [choice, setChoice] = useState<MembershipChoice>(initialChoice);

  return (
    <div
      className="absolute inset-0 z-40 flex items-end bg-navy-deep/55"
      onClick={onDismiss}
    >
      <div
        className="w-full rounded-t-[20px] bg-paper p-5 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-[15px] h-1 w-[34px] rounded-full bg-line" />
        <div className="font-serif text-[18px] font-semibold text-navy">
          {marina.name}
        </div>
        <div className="u-mono mb-4 text-[10px] text-ink-soft">
          {marina.location.toUpperCase()}
        </div>

        <button
          type="button"
          onClick={() => setChoice("member")}
          className={`mb-2.5 flex w-full items-start gap-[11px] rounded-xl border-[1.5px] p-[13px] text-left ${
            choice === "member" ? "border-navy bg-navy/3" : "border-line"
          }`}
        >
          <span
            className={`mt-px grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full border-2 ${
              choice === "member" ? "border-navy" : "border-line"
            }`}
          >
            {choice === "member" && <span className="h-2 w-2 rounded-full bg-navy" />}
          </span>
          <span>
            <span className="mb-0.5 block text-[13px] font-semibold text-navy">
              I&apos;m a member here
            </span>
            <span className="block text-[11px] leading-snug text-ink-soft">
              My boat is kept at this marina.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setChoice("visiting")}
          className={`mb-1.5 flex w-full items-start gap-[11px] rounded-xl border-[1.5px] p-[13px] text-left ${
            choice === "visiting" ? "border-navy bg-navy/3" : "border-line"
          }`}
        >
          <span
            className={`mt-px grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full border-2 ${
              choice === "visiting" ? "border-navy" : "border-line"
            }`}
          >
            {choice === "visiting" && <span className="h-2 w-2 rounded-full bg-navy" />}
          </span>
          <span>
            <span className="mb-0.5 block text-[13px] font-semibold text-navy">
              I&apos;m visiting
            </span>
            <span className="block text-[11px] leading-snug text-ink-soft">
              Short stay. You&apos;ll keep your home marina too.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onConfirm(choice)}
          className="mt-1.5 w-full rounded-[10px] bg-coral py-3 text-center text-[13px] font-bold text-white transition-opacity hover:opacity-90"
        >
          Continue as {choice === "member" ? "member" : "visitor"}
        </button>
      </div>
    </div>
  );
}

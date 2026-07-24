"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons";
import { useMarina } from "@/components/member/MarinaProvider";
import type { UsageType } from "@/lib/types";

const OPTIONS: { value: UsageType; title: string; sub: string }[] = [
  {
    value: "liveaboard",
    title: "I live aboard",
    sub: "My boat is my primary residence",
  },
  {
    value: "weekend",
    title: "Weekend & seasonal use",
    sub: "I keep my boat here and visit regularly",
  },
  {
    value: "storage",
    title: "Storage or occasional use",
    sub: "My boat stays here but I visit rarely",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { activeMarina } = useMarina();
  const [selected, setSelected] = useState<UsageType>("weekend");

  return (
    <div className="flex flex-1 flex-col justify-center bg-navy px-[26px] pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="mb-5 grid h-7 w-7 place-items-center rounded-lg bg-paper/10 text-paper transition-colors hover:bg-paper/20"
      >
        <ChevronLeftIcon className="h-[13px] w-[13px]" />
      </button>

      <h2 className="mb-2 font-serif text-[21px] font-semibold leading-[1.18] text-paper">
        How do you use
        <br />
        {activeMarina.name}?
      </h2>
      <p className="mb-5 text-xs leading-relaxed text-paper/60">
        No wrong answer — you can change this anytime.
      </p>

      <div role="radiogroup" aria-label="How you use the marina">
        {OPTIONS.map((opt) => {
          const on = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setSelected(opt.value)}
              className={`mb-[9px] flex w-full items-start gap-[11px] rounded-xl border-[1.5px] p-[13px] text-left transition-colors ${
                on ? "border-dock bg-dock/[0.08]" : "border-paper/20"
              }`}
            >
              <span
                className={`mt-px grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full border-2 ${
                  on ? "border-dock" : "border-paper/30"
                }`}
              >
                {on && <span className="h-2 w-2 rounded-full bg-dock" />}
              </span>
              <span>
                <span className="mb-0.5 block text-[13px] font-semibold text-paper">
                  {opt.title}
                </span>
                <span className="block text-[11px] leading-snug text-paper/60">
                  {opt.sub}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => router.push("/home")}
        className="mt-3.5 rounded-[10px] bg-dock py-[13px] text-center text-[13.5px] font-bold text-navy transition-opacity hover:opacity-90"
      >
        Continue
      </button>
    </div>
  );
}

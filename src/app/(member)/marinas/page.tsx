"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, MarinaIcon, SearchIcon } from "@/components/icons";
import { useMarina } from "@/components/member/MarinaProvider";
import { sampleMarinas } from "@/lib/data";
import type { Marina } from "@/lib/types";

type Membership = "member" | "visiting";

export default function MarinasPage() {
  const router = useRouter();
  const { activeMarina, memberMarinas, switchMarina } = useMarina();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Marina | null>(null);
  const [membership, setMembership] = useState<Membership>("visiting");

  const membershipByMarinaId = new Map(memberMarinas.map((m) => [m.marinaId, m.role]));

  // Only the marina you're currently on is hidden — everything else stays
  // selectable, including marinas you already belong to, so switching back
  // to a marina you've moved away from (e.g. your original home) still works.
  const candidates = sampleMarinas.filter((m) => m.id !== activeMarina.id);
  const results = candidates.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()),
  );

  function openMarina(marina: Marina) {
    setSelected(marina);
    // Default to whatever relationship you already have with this marina,
    // rather than always assuming "visiting" for a marina you're a member of.
    setMembership(membershipByMarinaId.get(marina.id) === "home" ? "member" : "visiting");
  }

  function confirm() {
    if (selected) {
      switchMarina(selected.id, membership);
    }
    setSelected(null);
    router.push("/home");
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="bg-navy px-5 pb-3.5 pt-[calc(env(safe-area-inset-top)+10px)]">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="mb-3 grid h-7 w-7 place-items-center rounded-lg bg-paper/10 text-paper transition-colors hover:bg-paper/20"
        >
          <ChevronLeftIcon className="h-[13px] w-[13px]" />
        </button>
        <div className="mb-[11px] font-serif text-[18px] font-semibold text-paper">
          Find a marina
        </div>
        <div className="flex items-center gap-[9px] rounded-[10px] border border-paper/18 bg-paper/8 px-[13px] py-2.5">
          <SearchIcon className="h-3.5 w-3.5 shrink-0 text-paper/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search marinas"
            className="u-mono w-full bg-transparent text-[11.5px] text-paper placeholder:text-paper/45 focus:outline-none"
          />
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto pt-3.5">
        {results.map((marina) => (
          <button
            key={marina.id}
            type="button"
            onClick={() => openMarina(marina)}
            className="mx-5 mb-2.5 flex w-[calc(100%-40px)] flex-col rounded-xl border border-line bg-white p-3 text-left transition-colors hover:border-dock"
          >
            <div className="flex items-center gap-[11px]">
              <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] bg-paper-dim">
                <MarinaIcon className="h-4 w-4 text-navy" />
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12.5px] font-semibold text-navy">
                    {marina.name}
                  </span>
                  {membershipByMarinaId.get(marina.id) && (
                    <span className="u-mono rounded-full bg-dock/20 px-[6px] py-[1px] text-[7.5px] font-bold tracking-[0.03em] text-[#8A6A2E]">
                      {membershipByMarinaId.get(marina.id) === "home" ? "Home" : "Visiting"}
                    </span>
                  )}
                </div>
                <div className="u-mono mt-[3px] flex items-center gap-1.5 text-[9px] text-ink-soft">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      marina.status === "verified" ? "bg-seaglass" : "bg-dock"
                    }`}
                  />
                  {marina.status === "verified" ? "Verified" : "Community"} ·{" "}
                  {marina.location}
                </div>
              </div>
            </div>
            {marina.amenities.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-line pt-2.5">
                {marina.amenities.slice(0, 4).map((amenity) => (
                  <span
                    key={amenity.id}
                    className="u-mono rounded-lg bg-paper-dim px-2 py-1 text-[8.5px] text-ink-soft"
                  >
                    {amenity.label}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
        {results.length === 0 && (
          <div className="u-mono px-5 pt-2 text-[11px] text-ink-soft">
            No marinas match &ldquo;{query}&rdquo;.
          </div>
        )}
      </div>

      {selected && (
        <div
          className="absolute inset-0 z-40 flex items-end bg-navy-deep/55"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full rounded-t-[20px] bg-paper p-5 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-[15px] h-1 w-[34px] rounded-full bg-line" />
            <div className="font-serif text-[18px] font-semibold text-navy">
              {selected.name}
            </div>
            <div className="u-mono mb-4 text-[10px] text-ink-soft">
              {selected.location.toUpperCase()}
            </div>

            <button
              type="button"
              onClick={() => setMembership("member")}
              className={`mb-2.5 flex w-full items-start gap-[11px] rounded-xl border-[1.5px] p-[13px] text-left ${
                membership === "member" ? "border-navy bg-navy/3" : "border-line"
              }`}
            >
              <span
                className={`mt-px grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full border-2 ${
                  membership === "member" ? "border-navy" : "border-line"
                }`}
              >
                {membership === "member" && (
                  <span className="h-2 w-2 rounded-full bg-navy" />
                )}
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
              onClick={() => setMembership("visiting")}
              className={`mb-1.5 flex w-full items-start gap-[11px] rounded-xl border-[1.5px] p-[13px] text-left ${
                membership === "visiting" ? "border-navy bg-navy/3" : "border-line"
              }`}
            >
              <span
                className={`mt-px grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full border-2 ${
                  membership === "visiting" ? "border-navy" : "border-line"
                }`}
              >
                {membership === "visiting" && (
                  <span className="h-2 w-2 rounded-full bg-navy" />
                )}
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
              onClick={confirm}
              className="mt-1.5 w-full rounded-[10px] bg-coral py-3 text-center text-[13px] font-bold text-white transition-opacity hover:opacity-90"
            >
              Continue as {membership === "member" ? "member" : "visitor"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

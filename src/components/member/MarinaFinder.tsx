"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, MarinaIcon, SearchIcon } from "@/components/icons";
import type { Marina } from "@/lib/types";

/**
 * Search header + results list for finding a marina. Used both by the
 * marina switcher and onboarding's marina-selection step — same component,
 * just given a different candidate list by the caller.
 */
export function MarinaFinder({
  marinas,
  membershipByMarinaId,
  onSelect,
}: {
  marinas: Marina[];
  membershipByMarinaId: Map<string, "home" | "visiting">;
  onSelect: (marina: Marina) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const results = marinas.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
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
            onClick={() => onSelect(marina)}
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
    </>
  );
}

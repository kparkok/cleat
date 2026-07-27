"use client";

import { useRouter } from "next/navigation";
import { CheckIcon, MarinaIcon, PlusIcon } from "@/components/icons";
import { useMarina } from "@/components/member/MarinaProvider";

/**
 * Bottom sheet showing all marinas this member belongs to, with a checkmark
 * on whichever is currently active. Tapping a marina calls viewMarina() —
 * no membership change. "+ Add a marina" routes to the full search/join flow.
 */
export function MarinaSwitcherSheet({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { marinas, memberMarinas, activeMarina, viewMarina } = useMarina();

  function handleSelect(marinaId: string) {
    viewMarina(marinaId);
    onClose();
  }

  function handleAdd() {
    onClose();
    router.push("/marinas");
  }

  return (
    <div
      className="absolute inset-0 z-50 flex items-end bg-navy-deep/55"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-[20px] bg-paper pb-[calc(env(safe-area-inset-bottom)+20px)] pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-[34px] rounded-full bg-line" />
        <div className="mb-2 px-5 font-serif text-[17px] font-semibold text-navy">
          Your marinas
        </div>

        <div className="px-3">
          {memberMarinas.map((membership) => {
            const marina = marinas.find((m) => m.id === membership.marinaId);
            if (!marina) return null;
            const isActive = activeMarina.id === marina.id;
            const isHome = membership.role === "home";

            return (
              <button
                key={marina.id}
                type="button"
                onClick={() => handleSelect(marina.id)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                  isActive ? "bg-navy/5" : "hover:bg-paper-dim"
                }`}
              >
                <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] bg-paper-dim">
                  <MarinaIcon className="h-4 w-4 text-navy" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-navy">{marina.name}</div>
                  <div className="u-mono mt-0.5 text-[9px] text-ink-soft">
                    {isHome
                      ? marina.location
                      : `Visited ${membership.visitedDates ?? marina.location}`}
                  </div>
                </div>
                <span
                  className={`u-mono shrink-0 rounded-full px-[7px] py-[2px] text-[7.5px] font-bold ${
                    isHome ? "bg-dock/22 text-[#8A6A2E]" : "bg-seaglass/12 text-seaglass"
                  }`}
                >
                  {isHome ? "Home" : "Past visit"}
                </span>
                {isActive ? (
                  <CheckIcon className="h-4 w-4 shrink-0 text-seaglass" />
                ) : (
                  <span className="h-4 w-4 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mx-3 mt-1 border-t border-line pt-1">
          <button
            type="button"
            onClick={handleAdd}
            className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-paper-dim"
          >
            <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] border-[1.5px] border-dashed border-line">
              <PlusIcon className="h-3.5 w-3.5 text-ink-soft" />
            </span>
            <span className="text-[13px] font-semibold text-ink-soft">Add a marina</span>
          </button>
        </div>
      </div>
    </div>
  );
}

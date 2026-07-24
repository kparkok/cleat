"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons";

const DARK_OVERLAY =
  "linear-gradient(180deg, rgba(8,24,38,0.15) 0%, rgba(8,24,38,0.8) 100%)";
const SEA_GRADIENT =
  "linear-gradient(180deg, #4A7A8C 0%, #6B9CAA 45%, #B7CDCA 100%)";

/**
 * Compact hero for the marina profile screen — shorter than the Home hero
 * and with a back button, since this is a screen you navigate *into* rather
 * than land on. No dock-silhouette illustration; just the gradient.
 */
export function ProfileHero({ name, location }: { name: string; location: string }) {
  const router = useRouter();

  return (
    <div
      className="relative h-[130px] shrink-0 overflow-hidden"
      style={{ backgroundImage: `${DARK_OVERLAY}, ${SEA_GRADIENT}` }}
    >
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="absolute left-3.5 top-3.5 z-10 grid h-[30px] w-[30px] place-items-center rounded-lg bg-navy-deep/40 text-paper transition-colors hover:bg-navy-deep/60"
      >
        <ChevronLeftIcon className="h-3.5 w-3.5" />
      </button>
      <div className="absolute bottom-3.5 left-5">
        <div className="font-serif text-[19px] font-semibold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]">
          {name}
        </div>
        <div className="u-mono mt-0.5 text-[10px] tracking-[0.06em] text-dock">
          {location.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

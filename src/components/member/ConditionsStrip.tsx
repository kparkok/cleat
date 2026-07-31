import type { LiveConditions } from "@/lib/types";

function tideDisplay(live: LiveConditions["tide"]): { value: string; label: string } {
  if (live.status === "loading") return { value: "…", label: "Tide" };
  if (live.status === "unavailable") return { value: "—", label: "Tide unavailable" };
  return { value: live.height ?? "—", label: `Tide, ${live.trend}` };
}

function windDisplay(live: LiveConditions["wind"]): { value: string; label: string } {
  if (live.status === "loading") return { value: "…", label: "Wind" };
  if (live.status === "unavailable") return { value: "—", label: "Wind unavailable" };
  return { value: `${live.speed ?? "—"}${live.direction ? ` ${live.direction}` : ""}`, label: "Wind" };
}

export function ConditionsStrip({ live }: { live: LiveConditions }) {
  const tide = tideDisplay(live.tide);
  const wind = windDisplay(live.wind);

  const items = [
    { value: tide.value, label: tide.label },
    { value: wind.value, label: wind.label },
  ];

  return (
    <div className="bg-navy px-5 py-3">
      <div className="flex justify-between">
        {items.map((item) => (
          <div key={item.label}>
            <div className="u-mono text-sm font-bold normal-case tracking-normal text-paper">
              {item.value}
            </div>
            <div className="u-mono mt-0.5 text-[8.5px] tracking-[0.06em] text-paper/50">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

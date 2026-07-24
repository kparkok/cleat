import type { MarinaConditions } from "@/lib/types";

export function ConditionsStrip({ conditions }: { conditions: MarinaConditions }) {
  const items = [
    { value: conditions.tide, label: `Tide, ${conditions.tideTrend}` },
    { value: conditions.waterTemp, label: "Water temp", accent: true },
    { value: conditions.wind, label: "Wind" },
  ];

  return (
    <div className="bg-navy px-5 py-3">
      <div className="flex justify-between">
        {items.map((item) => (
          <div key={item.label}>
            <div
              className={`u-mono text-sm font-bold normal-case tracking-normal ${
                item.accent ? "text-dock" : "text-paper"
              }`}
            >
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

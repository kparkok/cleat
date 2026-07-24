"use client";

interface Option<T extends string> {
  value: T;
  label: string;
}

export function SegmentedToggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
}) {
  return (
    <div className="bg-navy px-5 pt-3.5">
      <div className="flex rounded-[10px] bg-paper/10 p-[3px]">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`u-mono flex-1 rounded-lg py-2 text-center text-[10.5px] font-bold tracking-[0.04em] transition-colors ${
                active ? "bg-dock text-navy" : "text-paper/55"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <div className="h-3.5" />
    </div>
  );
}

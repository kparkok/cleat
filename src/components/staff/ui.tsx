import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex-1 rounded-[10px] border border-line bg-white p-4">
      <div
        className={`u-mono text-2xl font-bold normal-case tracking-normal ${
          accent ? "text-coral" : "text-navy"
        }`}
      >
        {value}
      </div>
      <div className="u-mono mt-1 text-[10px] tracking-[0.05em] text-ink-soft">
        {label}
      </div>
    </div>
  );
}

const PILL_TONES = {
  seaglass: "bg-seaglass/15 text-seaglass",
  amber: "bg-dock/20 text-[#8A6A2E]",
  coral: "bg-coral/12 text-coral",
} as const;

export function Pill({
  tone,
  children,
}: {
  tone: keyof typeof PILL_TONES;
  children: ReactNode;
}) {
  return (
    <span
      className={`u-mono inline-block rounded-full px-[9px] py-1 text-[9.5px] font-bold normal-case tracking-normal ${PILL_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return (
    <th className="u-mono border-b border-line px-3 pb-2.5 text-left text-[10px] tracking-[0.06em] text-ink-soft">
      {children}
    </th>
  );
}

export function Td({ children }: { children: ReactNode }) {
  return (
    <td className="border-b border-line p-3 text-[12.5px] text-ink">
      {children}
    </td>
  );
}

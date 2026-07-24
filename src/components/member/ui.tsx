import type { ReactNode } from "react";

/** Navy app header with marina name + mono subtitle. */
export function AppHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header className="bg-navy px-5 pb-3.5 pt-[calc(env(safe-area-inset-top)+10px)] text-paper">
      <div className="font-serif text-[18px] font-semibold leading-tight">
        {title}
      </div>
      <div className="u-mono mt-0.5 text-[9.5px] tracking-[0.08em] text-dock">
        {subtitle}
      </div>
    </header>
  );
}

/** Small mono uppercase section label. */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="u-mono px-5 pb-2 pt-4 text-[10px] tracking-[0.1em] text-ink-soft">
      {children}
    </div>
  );
}

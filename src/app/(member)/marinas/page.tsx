"use client";

import { useMarina } from "@/components/member/MarinaProvider";
import { MarinaSwitchFlow } from "@/components/member/MarinaSwitchFlow";

export default function MarinasPage() {
  const { activeMarina, marinas } = useMarina();

  // Only the marina you're currently on is hidden — everything else stays
  // selectable, including marinas you already belong to, so switching back
  // to a marina you've moved away from (e.g. your original home) still works.
  const candidates = marinas.filter((m) => m.id !== activeMarina.id);

  return <MarinaSwitchFlow marinas={candidates} />;
}

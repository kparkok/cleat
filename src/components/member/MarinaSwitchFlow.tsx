"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMarina } from "@/components/member/MarinaProvider";
import { MarinaFinder } from "@/components/member/MarinaFinder";
import { MembershipChoiceSheet } from "@/components/member/MembershipChoiceSheet";
import type { Marina } from "@/lib/types";

/**
 * Full "find a marina, then say whether it's home or you're just visiting"
 * flow — search + the membership choice sheet + wiring the result into
 * MarinaProvider. Used by both the marina switcher (Contacts → "Switch or
 * add a marina") and onboarding's marina-selection step, so there's exactly
 * one implementation of "pick your marina" in the app.
 */
export function MarinaSwitchFlow({ marinas }: { marinas: Marina[] }) {
  const router = useRouter();
  const { memberMarinas, switchMarina } = useMarina();
  const [selected, setSelected] = useState<Marina | null>(null);

  const membershipByMarinaId = new Map(memberMarinas.map((m) => [m.marinaId, m.role]));

  function confirm(choice: "member" | "visiting") {
    if (selected) {
      switchMarina(selected.id, choice);
    }
    setSelected(null);
    router.push("/home");
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <MarinaFinder
        marinas={marinas}
        membershipByMarinaId={membershipByMarinaId}
        onSelect={setSelected}
      />
      {selected && (
        <MembershipChoiceSheet
          marina={selected}
          initialChoice={membershipByMarinaId.get(selected.id) === "home" ? "member" : "visiting"}
          onConfirm={confirm}
          onDismiss={() => setSelected(null)}
        />
      )}
    </div>
  );
}

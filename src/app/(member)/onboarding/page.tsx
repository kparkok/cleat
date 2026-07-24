"use client";

import { MarinaSwitchFlow } from "@/components/member/MarinaSwitchFlow";
import { sampleMarinas } from "@/lib/data";

/**
 * First-run flow: find your marina, then say whether it's home or you're
 * just visiting. Reuses the exact same search + choice components as the
 * marina switcher — this is just that flow shown with the full marina list.
 */
export default function OnboardingPage() {
  return <MarinaSwitchFlow marinas={sampleMarinas} />;
}

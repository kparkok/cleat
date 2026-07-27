"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/member/AuthProvider";
import { MarinaFinder } from "@/components/member/MarinaFinder";
import { MembershipChoiceSheet, type MembershipChoice } from "@/components/member/MembershipChoiceSheet";
import { createMemberProfile } from "@/lib/auth-db";
import { upsertMembership } from "@/lib/member-db";
import { fetchMarinas } from "@/lib/marina-db";
import { describeError } from "@/lib/errors";
import type { Marina } from "@/lib/types";

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

/**
 * First-time sign-in flow: choose a username, then your home marina —
 * reusing the exact same marina-picker components as the switcher
 * (MarinaFinder + MembershipChoiceSheet), just composed locally instead of
 * through MarinaSwitchFlow, since that depends on MarinaProvider/useMarina()
 * and neither exists yet at this point — there's no member row to hold that
 * state until this flow creates one. Only after both steps are done does
 * any row get written.
 */
export function NewMemberFlow() {
  const { user, setMemberId } = useAuth();
  const [step, setStep] = useState<"username" | "marina">("username");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [marinas, setMarinas] = useState<Marina[]>([]);
  const [selected, setSelected] = useState<Marina | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetchMarinas()
      .then(setMarinas)
      .catch(() => {});
  }, []);

  function handleUsernameSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = username.trim().toLowerCase();
    if (!USERNAME_PATTERN.test(trimmed)) {
      setUsernameError("3–20 characters: lowercase letters, numbers, underscore.");
      return;
    }
    setUsername(trimmed);
    setUsernameError("");
    setStep("marina");
  }

  async function handleMarinaConfirm(choice: MembershipChoice) {
    if (!selected || !user?.email) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const newMemberId = await createMemberProfile({
        userId: user.id,
        email: user.email,
        username,
      });
      await upsertMembership(selected.id, choice === "member" ? "home" : "visiting");
      setMemberId(newMemberId);
    } catch (err) {
      console.error("[NewMemberFlow] handleMarinaConfirm failed:", describeError(err));
      // PostgrestError isn't an Error instance, so it needs its own check —
      // otherwise this always fell through to the generic message, even in
      // the UI, not just the console.
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err && "message" in err
            ? String((err as { message: unknown }).message)
            : "Something went wrong. Try again.";
      if (message.includes("username is already taken")) {
        setSelected(null);
        setStep("username");
        setUsernameError(message);
      } else {
        setSubmitError(message);
      }
      setSubmitting(false);
    }
  }

  if (step === "username") {
    return (
      <div className="flex flex-1 flex-col justify-center bg-navy px-[26px]">
        <div className="mb-8 text-center">
          <div className="font-serif text-[21px] font-semibold text-paper">
            Choose a username
          </div>
          <p className="mt-2 text-xs leading-relaxed text-paper/60">
            This is how you&apos;ll show up on posts and comments.
          </p>
        </div>

        <form onSubmit={handleUsernameSubmit}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="dockside_dan"
            autoFocus
            autoComplete="off"
            className="mb-3 w-full rounded-xl border-[1.5px] border-paper/20 bg-transparent px-4 py-3 text-[14px] text-paper placeholder:text-paper/30 focus:border-dock focus:outline-none"
          />
          {usernameError && <p className="mb-3 text-[12px] text-coral">{usernameError}</p>}
          <button
            type="submit"
            className="w-full rounded-[10px] bg-dock py-[13px] text-center text-[13.5px] font-bold text-navy transition-opacity hover:opacity-90"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <MarinaFinder marinas={marinas} membershipByMarinaId={new Map()} onSelect={setSelected} />

      {selected && (
        <MembershipChoiceSheet
          marina={selected}
          initialChoice="member"
          onConfirm={handleMarinaConfirm}
          onDismiss={() => setSelected(null)}
        />
      )}

      {submitting && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-navy-deep/55">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-dock border-t-transparent" />
        </div>
      )}

      {submitError && (
        <div className="absolute inset-x-5 bottom-5 z-50 rounded-lg bg-coral/90 p-3 text-center text-[12px] text-white">
          {submitError}
        </div>
      )}
    </div>
  );
}

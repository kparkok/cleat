"use client";

import { useState, type FormEvent } from "react";
import { sendMagicLink } from "@/lib/auth-db";

type Status = "idle" | "sending" | "sent" | "error";

export function SignInScreen() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus("sending");
    try {
      await sendMagicLink(trimmed);
      setStatus("sent");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-navy px-8 text-center">
        <div className="font-serif text-[21px] font-semibold text-paper">Check your email</div>
        <p className="text-[13px] leading-relaxed text-paper/60">
          We sent a sign-in link to <span className="text-dock">{email.trim()}</span>. Open it
          on this device to continue.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 text-[12px] font-semibold text-dock transition-opacity hover:opacity-80"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col justify-center bg-navy px-[26px]">
      <div className="mb-8 text-center">
        <div className="font-serif text-[26px] font-semibold text-paper">Cleat</div>
        <p className="mt-2 text-xs leading-relaxed text-paper/60">
          Sign in with your email — no password needed.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email" className="u-mono mb-2 block text-[10px] tracking-[0.1em] text-paper/50">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mb-3 w-full rounded-xl border-[1.5px] border-paper/20 bg-transparent px-4 py-3 text-[14px] text-paper placeholder:text-paper/30 focus:border-dock focus:outline-none"
        />
        {status === "error" && <p className="mb-3 text-[12px] text-coral">{errorMessage}</p>}
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-[10px] bg-dock py-[13px] text-center text-[13.5px] font-bold text-navy transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send magic link"}
        </button>
      </form>
    </div>
  );
}

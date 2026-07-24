"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { defaultMemberMarinas, sampleMarinas } from "@/lib/data";
import type { MemberMarinaMembership } from "@/lib/types";

interface MarinaContextValue {
  /** The marina whose data Home/News/Contacts/etc. are currently showing. */
  activeMarina: (typeof sampleMarinas)[number];
  /** Marinas this member belongs to — one "home", any number "visiting". */
  memberMarinas: MemberMarinaMembership[];
  /** Switch the active marina, recording it in the member's marina list. */
  switchMarina: (marinaId: string, role: "member" | "visiting") => void;
}

const MarinaContext = createContext<MarinaContextValue | null>(null);

const STORAGE_KEY = "cleat:member-marinas";
const DEFAULT_ACTIVE_ID =
  defaultMemberMarinas.find((m) => m.role === "home")?.marinaId ?? sampleMarinas[0].id;

interface StoredState {
  activeMarinaId: string;
  memberMarinas: MemberMarinaMembership[];
}

function isStoredState(value: unknown): value is StoredState {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.activeMarinaId === "string" &&
    Array.isArray(v.memberMarinas) &&
    v.memberMarinas.every(
      (m) =>
        m &&
        typeof m === "object" &&
        typeof (m as MemberMarinaMembership).marinaId === "string" &&
        ((m as MemberMarinaMembership).role === "home" ||
          (m as MemberMarinaMembership).role === "visiting"),
    )
  );
}

export function MarinaProvider({ children }: { children: ReactNode }) {
  // Initial render always uses the deterministic seed — on both server and
  // client — so hydration matches. Any persisted choice is applied right
  // after mount, in the effect below.
  const [memberMarinas, setMemberMarinas] = useState<MemberMarinaMembership[]>(
    defaultMemberMarinas,
  );
  const [activeMarinaId, setActiveMarinaId] = useState(DEFAULT_ACTIVE_ID);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isStoredState(parsed) && sampleMarinas.some((m) => m.id === parsed.activeMarinaId)) {
          setMemberMarinas(parsed.memberMarinas);
          setActiveMarinaId(parsed.activeMarinaId);
        }
      }
    } catch {
      // Corrupt or inaccessible storage — fall back to the seeded default.
    } finally {
      hydrated.current = true;
    }
  }, []);

  useEffect(() => {
    // Skip the write on first mount so we don't clobber storage with the
    // seed default before the read above has had a chance to run.
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ activeMarinaId, memberMarinas }),
      );
    } catch {
      // Storage unavailable (private browsing, quota) — state still works
      // for this session, it just won't survive a reload.
    }
  }, [activeMarinaId, memberMarinas]);

  function switchMarina(marinaId: string, role: "member" | "visiting") {
    const membershipRole: MemberMarinaMembership["role"] =
      role === "member" ? "home" : "visiting";

    setMemberMarinas((prev) => {
      // Only one home marina at a time — designating a new one demotes the old.
      const demoted =
        membershipRole === "home"
          ? prev.map((m) => (m.role === "home" ? { ...m, role: "visiting" as const } : m))
          : prev;

      const alreadyMember = demoted.some((m) => m.marinaId === marinaId);
      return alreadyMember
        ? demoted.map((m) => (m.marinaId === marinaId ? { ...m, role: membershipRole } : m))
        : [...demoted, { marinaId, role: membershipRole }];
    });

    setActiveMarinaId(marinaId);
  }

  const activeMarina = useMemo(
    () => sampleMarinas.find((m) => m.id === activeMarinaId) ?? sampleMarinas[0],
    [activeMarinaId],
  );

  const value = useMemo(
    () => ({ activeMarina, memberMarinas, switchMarina }),
    [activeMarina, memberMarinas],
  );

  return <MarinaContext.Provider value={value}>{children}</MarinaContext.Provider>;
}

export function useMarina() {
  const ctx = useContext(MarinaContext);
  if (!ctx) {
    throw new Error("useMarina must be used within a MarinaProvider");
  }
  return ctx;
}

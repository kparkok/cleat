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
import { communityPosts, currentMember, defaultMemberMarinas, sampleMarinas } from "@/lib/data";
import type { CommunityPost, MemberMarinaMembership, PostComment } from "@/lib/types";

interface MarinaContextValue {
  /** The marina whose data Home/News/Contacts/etc. are currently showing. */
  activeMarina: (typeof sampleMarinas)[number];
  /** Marinas this member belongs to — one "home", any number "visiting". */
  memberMarinas: MemberMarinaMembership[];
  /** Switch the active marina, recording it in the member's marina list. */
  switchMarina: (marinaId: string, role: "member" | "visiting") => void;
  /** All community posts across marinas — seeded data plus any created this session. */
  posts: CommunityPost[];
  /** Add a post to the active marina's community board as the current member. */
  addPost: (body: string) => void;
  /** Toggle the current member's like on a post, updating the heart count. */
  toggleLike: (postId: string) => void;
  /** Append a reply to a post's comment thread as the current member. */
  addComment: (postId: string, body: string) => void;
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
  const [posts, setPosts] = useState<CommunityPost[]>(communityPosts);
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
    // Stamped whenever a membership becomes "visiting" — either this marina
    // directly, or the previous home marina getting demoted to one.
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

    setMemberMarinas((prev) => {
      // Only one home marina at a time — designating a new one demotes the old.
      const demoted =
        membershipRole === "home"
          ? prev.map((m) =>
              m.role === "home" ? { ...m, role: "visiting" as const, visitedDates: today } : m,
            )
          : prev;

      const alreadyMember = demoted.some((m) => m.marinaId === marinaId);
      const patch: Partial<MemberMarinaMembership> =
        membershipRole === "visiting" ? { role: membershipRole, visitedDates: today } : { role: membershipRole };

      return alreadyMember
        ? demoted.map((m) => (m.marinaId === marinaId ? { ...m, ...patch } : m))
        : [...demoted, { marinaId, role: membershipRole, ...patch }];
    });

    setActiveMarinaId(marinaId);
  }

  function addPost(body: string) {
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const isHome = memberMarinas.find((m) => m.marinaId === activeMarinaId)?.role === "home";
    const homeMarinaId = memberMarinas.find((m) => m.role === "home")?.marinaId;
    const visitingFrom =
      !isHome && homeMarinaId
        ? sampleMarinas.find((m) => m.id === homeMarinaId)?.name
        : undefined;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      marinaId: activeMarinaId,
      authorName: `@${currentMember.username}`,
      initials: currentMember.initials,
      authorIsMe: true,
      kind: isHome ? "member" : "visiting",
      visitingFrom,
      body,
      hearts: 0,
      likedByMe: false,
      comments: [],
      timeAgo: "Just now",
      date: today,
    };

    setPosts((prev) => [newPost, ...prev]);
  }

  function toggleLike(postId: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id !== postId
          ? p
          : { ...p, likedByMe: !p.likedByMe, hearts: p.likedByMe ? p.hearts - 1 : p.hearts + 1 },
      ),
    );
  }

  function addComment(postId: string, body: string) {
    const newComment: PostComment = {
      id: `comment-${Date.now()}`,
      authorName: `@${currentMember.username}`,
      initials: currentMember.initials,
      authorIsMe: true,
      body,
      timeAgo: "Just now",
    };
    setPosts((prev) =>
      prev.map((p) =>
        p.id !== postId ? p : { ...p, comments: [...p.comments, newComment] },
      ),
    );
  }

  const activeMarina = useMemo(
    () => sampleMarinas.find((m) => m.id === activeMarinaId) ?? sampleMarinas[0],
    [activeMarinaId],
  );

  const value = useMemo(
    () => ({ activeMarina, memberMarinas, switchMarina, posts, addPost, toggleLike, addComment }),
    [activeMarina, memberMarinas, posts],
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

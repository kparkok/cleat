"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { communityPosts, currentMember, defaultMemberMarinas, sampleMarinas } from "@/lib/data";
import { describeError } from "@/lib/errors";
import {
  demoteHomeMembership,
  fetchMemberData,
  upsertMembership,
} from "@/lib/member-db";
import { fetchContacts, fetchMarinas } from "@/lib/marina-db";
import {
  dbDeleteComment,
  dbDeletePost,
  dbInsertComment,
  dbInsertPost,
  dbUpdateComment,
  dbUpdatePost,
  deleteLike,
  fetchCommunityPosts,
  fetchMarinaBoardData,
  fetchMyPosts,
  upsertLike,
} from "@/lib/news-db";
import type {
  Announcement,
  Contact,
  CommunityPost,
  Marina,
  MemberMarinaMembership,
  MemberProfile,
  PinnedPost,
  PostComment,
} from "@/lib/types";

interface MarinaContextValue {
  member: MemberProfile;
  marinas: Marina[];
  activeMarina: Marina;
  memberMarinas: MemberMarinaMembership[];
  switchMarina: (marinaId: string, role: "member" | "visiting") => void;
  viewMarina: (marinaId: string) => void;
  /** Active marina's community posts — filtered to activeMarina.id. */
  posts: CommunityPost[];
  /** Current member's own posts across all their marinas — for You tab + My Posts screen. */
  myPosts: CommunityPost[];
  /** True while community posts for the active marina are loading. */
  postsLoading: boolean;
  /** Cached marina board announcements for the active marina. */
  boardAnnouncements: Announcement[];
  /** Cached pinned posts for the active marina. */
  boardPinned: PinnedPost[];
  /** Contacts for the active marina (staff + emergency), scoped per marina. */
  contacts: Contact[];
  /** True while contacts for the active marina are loading. */
  contactsLoading: boolean;
  addPost: (body: string) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, body: string) => void;
  editPost: (postId: string, body: string) => void;
  deletePost: (postId: string) => void;
  editComment: (postId: string, commentId: string, body: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
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
  const [member, setMember] = useState<MemberProfile>(currentMember);
  const [marinas, setMarinas] = useState<Marina[]>(sampleMarinas);
  const [memberMarinas, setMemberMarinas] = useState<MemberMarinaMembership[]>(defaultMemberMarinas);
  const [activeMarinaId, setActiveMarinaId] = useState(DEFAULT_ACTIVE_ID);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [myPosts, setMyPosts] = useState<CommunityPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [boardAnnouncements, setBoardAnnouncements] = useState<Announcement[]>([]);
  const [boardPinned, setBoardPinned] = useState<PinnedPost[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  // Becomes true after localStorage is read so marina-scoped fetches use the
  // correct activeMarinaId instead of the seed default.
  const [hydrated, setHydrated] = useState(false);

  // Marina list and member data are independent of active marina — start immediately.
  useEffect(() => {
    fetchMarinas()
      .then(setMarinas)
      .catch((err) => {
        console.error("[MarinaProvider] fetchMarinas failed — falling back to seed marinas:", describeError(err));
      });
  }, []);

  useEffect(() => {
    fetchMemberData()
      .then(({ member: m, memberships }) => {
        setMember(m);
        setMemberMarinas(memberships);
      })
      .catch((err) => {
        console.error("[MarinaProvider] fetchMemberData failed — falling back to seed member/memberships:", describeError(err));
      });
  }, []);

  // Member's own posts don't change when the active marina changes.
  useEffect(() => {
    fetchMyPosts()
      .then(setMyPosts)
      .catch((err) => {
        console.error("[MarinaProvider] fetchMyPosts failed — falling back to seed posts:", describeError(err));
        setMyPosts(communityPosts.filter((p) => p.authorIsMe));
      });
  }, []);

  // Restore localStorage before firing marina-scoped fetches so we use the
  // correct marina ID from the first request.
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
      // Corrupt or inaccessible — fall back to seed default.
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist active marina to localStorage (skip the initial write before restore).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ activeMarinaId, memberMarinas }),
      );
    } catch {
      // Storage unavailable — state works for this session only.
    }
  }, [hydrated, activeMarinaId, memberMarinas]);

  // Community posts and marina board are marina-scoped. Wait for hydration so
  // we fetch the correct marina on the first request (not the seed default).
  useEffect(() => {
    if (!hydrated) return;
    setPostsLoading(true);
    fetchCommunityPosts(activeMarinaId)
      .then((data) => {
        setPosts(data);
        setPostsLoading(false);
      })
      .catch((err) => {
        console.error("[MarinaProvider] fetchCommunityPosts failed — falling back to seed posts:", describeError(err), { activeMarinaId });
        setPosts(communityPosts.filter((p) => p.marinaId === activeMarinaId));
        setPostsLoading(false);
      });
  }, [hydrated, activeMarinaId]);

  useEffect(() => {
    if (!hydrated) return;
    fetchMarinaBoardData(activeMarinaId)
      .then(({ announcements, pinnedPosts }) => {
        setBoardAnnouncements(announcements);
        setBoardPinned(pinnedPosts);
      })
      .catch((err) => {
        console.error("[MarinaProvider] fetchMarinaBoardData failed:", describeError(err), { activeMarinaId });
      });
  }, [hydrated, activeMarinaId]);

  useEffect(() => {
    if (!hydrated) return;
    setContactsLoading(true);
    fetchContacts(activeMarinaId)
      .then((data) => {
        setContacts(data);
        setContactsLoading(false);
      })
      .catch((err) => {
        console.error("[MarinaProvider] fetchContacts failed:", describeError(err), { activeMarinaId });
        setContactsLoading(false);
      });
  }, [hydrated, activeMarinaId]);

  function viewMarina(marinaId: string) {
    setActiveMarinaId(marinaId);
  }

  function switchMarina(marinaId: string, role: "member" | "visiting") {
    const membershipRole: MemberMarinaMembership["role"] =
      role === "member" ? "home" : "visiting";
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

    // Capture state before optimistic update so we can revert on DB failure.
    const prevMemberMarinas = memberMarinas;
    const prevActiveMarinaId = activeMarinaId;

    setMemberMarinas((prev) => {
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

    const doDbWrite = async () => {
      if (membershipRole === "home") {
        await demoteHomeMembership(today);
      }
      await upsertMembership(marinaId, membershipRole, today);
    };
    doDbWrite().catch(() => {
      setMemberMarinas(prevMemberMarinas);
      setActiveMarinaId(prevActiveMarinaId);
    });
  }

  function addPost(body: string) {
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const isHome = memberMarinas.find((m) => m.marinaId === activeMarinaId)?.role === "home";
    const homeMarinaId = memberMarinas.find((m) => m.role === "home")?.marinaId;
    const visitingFrom =
      !isHome && homeMarinaId
        ? marinas.find((m) => m.id === homeMarinaId)?.name
        : undefined;
    const kind: CommunityPost["kind"] = isHome ? "member" : "visiting";
    const tempId = `post-${Date.now()}`;

    const newPost: CommunityPost = {
      id: tempId,
      marinaId: activeMarinaId,
      authorName: `@${member.username}`,
      initials: member.initials,
      authorIsMe: true,
      kind,
      visitingFrom,
      body,
      hearts: 0,
      likedByMe: false,
      comments: [],
      timeAgo: "Just now",
      date: today,
    };

    setPosts((prev) => [newPost, ...prev]);
    setMyPosts((prev) => [newPost, ...prev]);

    dbInsertPost(activeMarinaId, body, kind, visitingFrom)
      .then((realId) => {
        const swap = (p: CommunityPost) => (p.id === tempId ? { ...p, id: realId } : p);
        setPosts((prev) => prev.map(swap));
        setMyPosts((prev) => prev.map(swap));
      })
      .catch(() => {});
  }

  function toggleLike(postId: string) {
    const wasLiked = posts.find((p) => p.id === postId)?.likedByMe ?? false;

    const applyLike = (p: CommunityPost) =>
      p.id !== postId
        ? p
        : { ...p, likedByMe: !wasLiked, hearts: wasLiked ? p.hearts - 1 : p.hearts + 1 };
    const revertLike = (p: CommunityPost) =>
      p.id !== postId
        ? p
        : { ...p, likedByMe: wasLiked, hearts: wasLiked ? p.hearts + 1 : p.hearts - 1 };

    setPosts((prev) => prev.map(applyLike));
    setMyPosts((prev) => prev.map(applyLike));

    (wasLiked ? deleteLike(postId) : upsertLike(postId)).catch(() => {
      setPosts((prev) => prev.map(revertLike));
      setMyPosts((prev) => prev.map(revertLike));
    });
  }

  function addComment(postId: string, body: string) {
    const tempId = `comment-${Date.now()}`;
    const newComment: PostComment = {
      id: tempId,
      authorName: `@${member.username}`,
      initials: member.initials,
      authorIsMe: true,
      body,
      timeAgo: "Just now",
    };

    const appendComment = (p: CommunityPost) =>
      p.id !== postId ? p : { ...p, comments: [...p.comments, newComment] };

    setPosts((prev) => prev.map(appendComment));
    setMyPosts((prev) => prev.map(appendComment));

    dbInsertComment(postId, body)
      .then((realId) => {
        const swapComment = (p: CommunityPost) =>
          p.id !== postId
            ? p
            : {
                ...p,
                comments: p.comments.map((c) => (c.id === tempId ? { ...c, id: realId } : c)),
              };
        setPosts((prev) => prev.map(swapComment));
        setMyPosts((prev) => prev.map(swapComment));
      })
      .catch(() => {});
  }

  function editPost(postId: string, body: string) {
    const old = posts.find((p) => p.id === postId);

    const applyEdit = (p: CommunityPost) => (p.id === postId ? { ...p, body } : p);
    setPosts((prev) => prev.map(applyEdit));
    setMyPosts((prev) => prev.map(applyEdit));

    dbUpdatePost(postId, body).catch(() => {
      if (old) {
        const revert = (p: CommunityPost) => (p.id === postId ? { ...p, body: old.body } : p);
        setPosts((prev) => prev.map(revert));
        setMyPosts((prev) => prev.map(revert));
      }
    });
  }

  function deletePost(postId: string) {
    const removed = posts.find((p) => p.id === postId);

    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setMyPosts((prev) => prev.filter((p) => p.id !== postId));

    dbDeletePost(postId).catch(() => {
      if (removed) {
        setPosts((prev) => [removed, ...prev.filter((p) => p.id !== postId)]);
        setMyPosts((prev) => [removed, ...prev.filter((p) => p.id !== postId)]);
      }
    });
  }

  function editComment(postId: string, commentId: string, body: string) {
    const old = posts.find((p) => p.id === postId)?.comments.find((c) => c.id === commentId);

    const applyEdit = (p: CommunityPost) =>
      p.id !== postId
        ? p
        : { ...p, comments: p.comments.map((c) => (c.id === commentId ? { ...c, body } : c)) };
    setPosts((prev) => prev.map(applyEdit));

    dbUpdateComment(commentId, body).catch(() => {
      if (old) {
        const revert = (p: CommunityPost) =>
          p.id !== postId
            ? p
            : {
                ...p,
                comments: p.comments.map((c) =>
                  c.id === commentId ? { ...c, body: old.body } : c,
                ),
              };
        setPosts((prev) => prev.map(revert));
      }
    });
  }

  function deleteComment(postId: string, commentId: string) {
    const removed = posts.find((p) => p.id === postId)?.comments.find((c) => c.id === commentId);

    const filterComment = (p: CommunityPost) =>
      p.id !== postId
        ? p
        : { ...p, comments: p.comments.filter((c) => c.id !== commentId) };
    setPosts((prev) => prev.map(filterComment));
    setMyPosts((prev) => prev.map(filterComment));

    dbDeleteComment(commentId).catch(() => {
      if (removed) {
        const restore = (p: CommunityPost) =>
          p.id !== postId ? p : { ...p, comments: [...p.comments, removed] };
        setPosts((prev) => prev.map(restore));
        setMyPosts((prev) => prev.map(restore));
      }
    });
  }

  const activeMarina = useMemo(
    () => marinas.find((m) => m.id === activeMarinaId) ?? marinas[0],
    [activeMarinaId, marinas],
  );

  const value = useMemo(
    () => ({
      member,
      marinas,
      activeMarina,
      memberMarinas,
      switchMarina,
      viewMarina,
      posts,
      myPosts,
      postsLoading,
      boardAnnouncements,
      boardPinned,
      contacts,
      contactsLoading,
      addPost,
      toggleLike,
      addComment,
      editPost,
      deletePost,
      editComment,
      deleteComment,
    }),
    [member, marinas, activeMarina, memberMarinas, posts, myPosts, postsLoading, boardAnnouncements, boardPinned, contacts, contactsLoading],
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

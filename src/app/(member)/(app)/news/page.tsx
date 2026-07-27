"use client";

import { useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/member/ui";
import { SegmentedToggle } from "@/components/member/SegmentedToggle";
import { AlertIcon, FileIcon, PlusIcon } from "@/components/icons";
import { CommunityPostCard } from "@/components/member/CommunityPostCard";
import { useMarina } from "@/components/member/MarinaProvider";
import { PostComposerSheet } from "@/components/member/PostComposerSheet";
import { ANNOUNCEMENT_CATEGORY_LABELS, type AnnouncementCategory } from "@/lib/types";

type Board = "marina" | "community";

const BOARD_OPTIONS: { value: Board; label: string }[] = [
  { value: "marina", label: "Marina board" },
  { value: "community", label: "Community" },
];

const CATEGORY_CLASSNAMES: Record<AnnouncementCategory, string> = {
  emergency: "text-coral",
  maintenance: "text-[#8A6A2E]",
  community: "text-navy",
  general: "text-navy",
};

export default function NewsPage() {
  const {
    activeMarina,
    posts,
    postsLoading,
    boardAnnouncements,
    boardPinned,
    addPost,
    toggleLike,
    addComment,
    editPost,
    deletePost,
    editComment,
    deleteComment,
  } = useMarina();
  const [board, setBoard] = useState<Board>("marina");
  const [composing, setComposing] = useState(false);
  const [editingPost, setEditingPost] = useState<(typeof posts)[number] | null>(null);
  const [pendingHighlightId, setPendingHighlightId] = useState<string | null>(null);
  const [flashedPostId, setFlashedPostId] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boardPosts = posts.filter((p) => p.marinaId === activeMarina.id);

  // Read navigation intent from sessionStorage (set by My Posts screen).
  useEffect(() => {
    const postId = sessionStorage.getItem("cleat:highlight-post");
    if (!postId) return;
    sessionStorage.removeItem("cleat:highlight-post");
    setBoard("community");
    setPendingHighlightId(postId);
  }, []);

  // Once the community board is visible and a highlight target is set, scroll + flash.
  useEffect(() => {
    if (!pendingHighlightId || board !== "community") return;
    setPendingHighlightId(null);
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-post-id="${pendingHighlightId}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlashedPostId(pendingHighlightId);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlashedPostId(null), 1500);
    });
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, [pendingHighlightId, board]);

  return (
    <div className="relative flex flex-1 flex-col">
      <AppHeader title="Announcements" subtitle={activeMarina.name} />
      <SegmentedToggle value={board} onChange={setBoard} options={BOARD_OPTIONS} />

      {board === "marina" ? (
        <div className="pb-4">
          <div className="u-mono px-5 pb-2 pt-3.5 text-[10px] tracking-[0.1em] text-ink-soft">
            Pinned
          </div>
          {boardPinned.length === 0 ? (
            <div className="mx-5 mb-2.5 space-y-2">
              {[0, 1].map((i) => (
                <div key={i} className="h-[54px] animate-pulse rounded-xl bg-paper-dim" />
              ))}
            </div>
          ) : (
            boardPinned.map((post) => (
              <div
                key={post.id}
                className="mx-5 mb-2.5 flex items-center gap-[11px] rounded-xl border border-dock bg-white p-[11px_13px]"
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                    post.tone === "alert" ? "bg-coral/12" : "bg-navy"
                  }`}
                >
                  {post.tone === "alert" ? (
                    <AlertIcon className="h-[15px] w-[15px] text-coral" />
                  ) : (
                    <FileIcon className="h-[15px] w-[15px] text-dock" />
                  )}
                </span>
                <div>
                  <div className="text-[12.5px] font-semibold text-navy">{post.title}</div>
                  <div className="u-mono mt-0.5 text-[9px] text-ink-soft">{post.meta}</div>
                </div>
              </div>
            ))
          )}

          <div className="u-mono px-5 pb-2 pt-4 text-[10px] tracking-[0.1em] text-ink-soft">
            Recent
          </div>
          {boardAnnouncements.length === 0 ? (
            <div className="mx-5 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[72px] animate-pulse rounded-xl bg-paper-dim" />
              ))}
            </div>
          ) : (
            boardAnnouncements.map((item, i) => (
              <div
                key={item.id}
                className={`mx-5 pb-3 ${
                  i < boardAnnouncements.length - 1 ? "mb-3 border-b border-line" : ""
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span
                    className={`u-mono text-[8.5px] font-bold ${CATEGORY_CLASSNAMES[item.category]}`}
                  >
                    {ANNOUNCEMENT_CATEGORY_LABELS[item.category]}
                  </span>
                  <span className="u-mono text-[9.5px] text-ink-soft">{item.date}</span>
                </div>
                <div className="mb-0.5 text-[13.5px] font-semibold text-navy">{item.title}</div>
                <div className="text-[11.5px] leading-relaxed text-ink-soft">{item.body}</div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="relative flex-1 pb-4">
          {composing && (
            <PostComposerSheet
              marinaName={activeMarina.name}
              onPost={(body) => {
                addPost(body);
                setComposing(false);
              }}
              onDismiss={() => setComposing(false)}
            />
          )}
          {editingPost && (
            <PostComposerSheet
              marinaName={activeMarina.name}
              initialBody={editingPost.body}
              title="Edit post"
              submitLabel="Save"
              onPost={(body) => {
                editPost(editingPost.id, body);
                setEditingPost(null);
              }}
              onDismiss={() => setEditingPost(null)}
            />
          )}
          <div className="mx-5 mb-3 mt-3.5 rounded-[10px] border border-seaglass/25 bg-seaglass/8 p-2.5 text-[10.5px] leading-relaxed text-ink-soft">
            <b className="text-seaglass">Member-run.</b> Posts here come from
            other marina members, not staff.
          </div>

          {postsLoading ? (
            <div className="space-y-3 px-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[100px] animate-pulse rounded-xl bg-paper-dim" />
              ))}
            </div>
          ) : (
            boardPosts.map((post) => (
              <div key={post.id} data-post-id={post.id}>
                <CommunityPostCard
                  post={post}
                  highlighted={flashedPostId === post.id}
                  onToggleLike={() => toggleLike(post.id)}
                  onAddComment={(body) => addComment(post.id, body)}
                  onEditPost={post.authorIsMe ? () => setEditingPost(post) : undefined}
                  onDeletePost={post.authorIsMe ? () => deletePost(post.id) : undefined}
                  onEditComment={(cid, body) => editComment(post.id, cid, body)}
                  onDeleteComment={(cid) => deleteComment(post.id, cid)}
                />
              </div>
            ))
          )}

          <button
            type="button"
            aria-label="New community post"
            onClick={() => setComposing(true)}
            className="fixed bottom-[calc(60px+env(safe-area-inset-bottom)+18px)] right-[max(16px,calc((100vw-440px)/2+16px))] grid h-11 w-11 place-items-center rounded-full bg-coral shadow-[0_8px_20px_rgba(224,96,47,0.4)] transition-opacity hover:opacity-90"
          >
            <PlusIcon className="h-[18px] w-[18px] text-white" strokeWidth={2.2} />
          </button>
        </div>
      )}
    </div>
  );
}

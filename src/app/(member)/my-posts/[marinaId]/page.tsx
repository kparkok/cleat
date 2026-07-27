"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMarina } from "@/components/member/MarinaProvider";
import { PostComposerSheet } from "@/components/member/PostComposerSheet";
import { OverflowMenu } from "@/components/member/OverflowMenu";
import { ChevronLeftIcon, MarinaIcon } from "@/components/icons";
import type { CommunityPost } from "@/lib/types";

export default function MyPostsPage({
  params,
}: {
  params: Promise<{ marinaId: string }>;
}) {
  const { marinaId } = use(params);
  const router = useRouter();
  const { marinas, myPosts, viewMarina, editPost, deletePost } = useMarina();

  const marina = marinas.find((m) => m.id === marinaId);
  const marinaPosts = myPosts.filter((p) => p.marinaId === marinaId);

  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);

  function openInFeed(postId: string) {
    sessionStorage.setItem("cleat:highlight-post", postId);
    viewMarina(marinaId);
    router.push("/news");
  }

  function handleSaveEdit(body: string) {
    if (editingPost) editPost(editingPost.id, body);
    setEditingPost(null);
  }

  return (
    <div className="relative flex flex-1 flex-col">
      {/* Header */}
      <div className="bg-navy px-5 pb-3.5 pt-[calc(env(safe-area-inset-top)+10px)]">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="mb-3 grid h-7 w-7 place-items-center rounded-lg bg-paper/10 text-paper transition-colors hover:bg-paper/20"
        >
          <ChevronLeftIcon className="h-[13px] w-[13px]" />
        </button>
        <div className="font-serif text-[18px] font-semibold text-paper">My posts</div>
        <div className="u-mono mt-[3px] text-[10px] text-paper/55">
          {marina?.name ?? marinaId}
        </div>
      </div>

      {/* Post list */}
      <div className="no-scrollbar flex-1 overflow-y-auto pb-6 pt-3.5">
        {marinaPosts.length === 0 ? (
          <div className="u-mono px-5 pt-2 text-[11px] text-ink-soft">
            No posts here yet.
          </div>
        ) : (
          marinaPosts.map((post) => (
            <div key={post.id} className="mx-5 mb-3 rounded-xl border border-line bg-white">
              {/* Non-tappable header: badge + timestamp + overflow menu */}
              <div className="flex items-center gap-2 px-[14px] pt-[13px]">
                {post.kind === "visiting" && post.visitingFrom ? (
                  <span className="u-mono inline-flex items-center gap-[3px] rounded-full bg-dock/22 px-[7px] py-[2px] text-[7.5px] font-bold text-[#8A6A2E]">
                    <MarinaIcon className="h-2 w-2" strokeWidth={2.5} />
                    Visiting from {post.visitingFrom}
                  </span>
                ) : (
                  <span className="u-mono rounded-full bg-seaglass/12 px-[7px] py-[2px] text-[7.5px] font-bold text-seaglass">
                    Member
                  </span>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <span className="u-mono shrink-0 text-[9px] text-ink-soft">{post.timeAgo}</span>
                  <OverflowMenu
                    onEdit={() => setEditingPost(post)}
                    onDelete={() => deletePost(post.id)}
                  />
                </div>
              </div>

              {/* Tappable body — navigates to post in feed */}
              <button
                type="button"
                onClick={() => openInFeed(post.id)}
                className="w-full px-[14px] pb-[13px] pt-[9px] text-left transition-colors hover:bg-paper-dim/50 active:bg-paper-dim"
              >
                <div className="text-[11.5px] leading-relaxed text-ink">{post.body}</div>
                <div className="u-mono mt-2 text-[9px] text-ink-soft">
                  {post.date} · {post.hearts}{" "}
                  {post.hearts === 1 ? "reaction" : "reactions"} ·{" "}
                  {post.comments.length}{" "}
                  {post.comments.length === 1 ? "reply" : "replies"}
                </div>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Edit sheet */}
      {editingPost && (
        <PostComposerSheet
          marinaName={marina?.name ?? marinaId}
          initialBody={editingPost.body}
          title="Edit post"
          submitLabel="Save"
          onPost={handleSaveEdit}
          onDismiss={() => setEditingPost(null)}
        />
      )}
    </div>
  );
}

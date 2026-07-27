"use client";

import { useRef, useState } from "react";
import { HeartIcon, MarinaIcon, ReplyIcon } from "@/components/icons";
import { OverflowMenu } from "@/components/member/OverflowMenu";
import type { CommunityPost } from "@/lib/types";

export function CommunityPostCard({
  post,
  highlighted,
  onToggleLike,
  onAddComment,
  onEditPost,
  onDeletePost,
  onEditComment,
  onDeleteComment,
}: {
  post: CommunityPost;
  highlighted?: boolean;
  onToggleLike: () => void;
  onAddComment: (body: string) => void;
  onEditPost?: () => void;
  onDeletePost?: () => void;
  onEditComment?: (commentId: string, body: string) => void;
  onDeleteComment?: (commentId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentBody, setEditingCommentBody] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const commentCount = post.comments.length;

  function handleToggleExpanded() {
    setExpanded((prev) => {
      if (!prev) setTimeout(() => inputRef.current?.focus(), 0);
      return !prev;
    });
  }

  function handlePost() {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    onAddComment(trimmed);
    setReplyText("");
    inputRef.current?.focus();
  }

  function startEditComment(commentId: string, currentBody: string) {
    setEditingCommentId(commentId);
    setEditingCommentBody(currentBody);
  }

  function saveEditComment(commentId: string) {
    const trimmed = editingCommentBody.trim();
    if (trimmed && trimmed !== post.comments.find((c) => c.id === commentId)?.body) {
      onEditComment?.(commentId, trimmed);
    }
    setEditingCommentId(null);
  }

  function cancelEditComment() {
    setEditingCommentId(null);
    setEditingCommentBody("");
  }

  return (
    <div
      className={`mx-5 mb-3 rounded-xl border p-[13px_14px] transition-colors duration-700 ${
        highlighted ? "border-dock bg-dock/8" : "border-line bg-white"
      }`}
    >
      {/* Header */}
      <div className="mb-2 flex items-center gap-[9px]">
        <span className="u-mono grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-paper-dim text-[9.5px] font-bold text-navy">
          {post.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-navy">{post.authorName}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            {post.kind === "member" ? (
              <span className="u-mono rounded-full bg-seaglass/12 px-[7px] py-[2px] text-[7.5px] font-bold text-seaglass">
                Member
              </span>
            ) : (
              <span className="u-mono inline-flex items-center gap-[3px] rounded-full bg-dock/22 px-[7px] py-[2px] text-[7.5px] font-bold text-[#8A6A2E]">
                <MarinaIcon className="h-2 w-2" strokeWidth={2.5} />
                Visiting from {post.visitingFrom}
              </span>
            )}
          </div>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <span className="u-mono text-[9px] text-ink-soft">{post.timeAgo}</span>
          {post.authorIsMe && onEditPost && onDeletePost && (
            <OverflowMenu onEdit={onEditPost} onDelete={onDeletePost} />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="text-[11.5px] leading-relaxed text-ink">{post.body}</div>

      {/* Expanded comments + reply input */}
      {expanded && (
        <div className="mt-2.5 border-t border-line pt-2.5">
          {post.comments.length > 0 && (
            <div className="mb-3 space-y-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2">
                  <span className="u-mono mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-paper-dim text-[8px] font-bold text-navy">
                    {comment.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    {editingCommentId === comment.id ? (
                      <div className="flex gap-2">
                        <input
                          autoFocus
                          value={editingCommentBody}
                          onChange={(e) => setEditingCommentBody(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              saveEditComment(comment.id);
                            }
                            if (e.key === "Escape") cancelEditComment();
                          }}
                          className="min-w-0 flex-1 rounded-lg border border-navy px-2.5 py-1 text-[11.5px] text-navy focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={cancelEditComment}
                          className="shrink-0 text-[10px] text-ink-soft transition-colors hover:text-navy"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEditComment(comment.id)}
                          className="shrink-0 text-[10px] font-semibold text-seaglass transition-colors hover:opacity-80"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-navy">
                            {comment.authorName}
                          </span>
                          <span className="u-mono text-[8.5px] text-ink-soft">
                            {comment.timeAgo}
                          </span>
                          {comment.authorIsMe && onEditComment && onDeleteComment && (
                            <div className="ml-auto">
                              <OverflowMenu
                                onEdit={() => startEditComment(comment.id, comment.body)}
                                onDelete={() => onDeleteComment(comment.id)}
                              />
                            </div>
                          )}
                        </div>
                        <div className="mt-[2px] text-[11px] leading-snug text-ink">
                          {comment.body}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handlePost();
                }
              }}
              placeholder="Add a reply…"
              className="min-w-0 flex-1 rounded-lg border border-line bg-paper-dim px-2.5 py-1.5 text-[11.5px] text-navy placeholder:text-ink-soft/50 focus:border-navy focus:outline-none"
            />
            <button
              type="button"
              onClick={handlePost}
              disabled={!replyText.trim()}
              className="rounded-lg bg-coral px-3 py-1.5 text-[11px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Post
            </button>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="mt-2.5 flex gap-3.5 border-t border-line pt-2">
        <button
          type="button"
          onClick={onToggleLike}
          className={`flex items-center gap-[5px] text-[10.5px] transition-colors ${
            post.likedByMe ? "text-coral" : "text-ink-soft hover:text-coral"
          }`}
        >
          <HeartIcon className="h-3 w-3" filled={post.likedByMe} />
          {post.hearts}
        </button>
        <button
          type="button"
          onClick={handleToggleExpanded}
          className={`flex items-center gap-[5px] text-[10.5px] transition-colors ${
            expanded ? "text-navy" : "text-ink-soft hover:text-navy"
          }`}
        >
          <ReplyIcon className="h-3 w-3" />
          {commentCount === 0
            ? "Reply"
            : `${commentCount} ${commentCount === 1 ? "reply" : "replies"}`}
        </button>
      </div>
    </div>
  );
}

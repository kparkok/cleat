"use client";

import { useRef, useState } from "react";

export function PostComposerSheet({
  marinaName,
  initialBody = "",
  title = "New post",
  submitLabel = "Post",
  onPost,
  onDismiss,
}: {
  marinaName: string;
  initialBody?: string;
  title?: string;
  submitLabel?: string;
  onPost: (body: string) => void;
  onDismiss: () => void;
}) {
  const [body, setBody] = useState(initialBody);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handlePost() {
    const trimmed = body.trim();
    if (!trimmed) return;
    onPost(trimmed);
  }

  return (
    <div
      className="absolute inset-0 z-40 flex items-end bg-navy-deep/55"
      onClick={onDismiss}
    >
      <div
        className="w-full rounded-t-[20px] bg-paper p-5 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-[15px] h-1 w-[34px] rounded-full bg-line" />
        <div className="font-serif text-[17px] font-semibold text-navy">{title}</div>
        <div className="u-mono mb-3.5 mt-[3px] text-[9.5px] text-ink-soft">
          {marinaName} · community board
        </div>
        <textarea
          ref={textareaRef}
          autoFocus
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What's on your mind?"
          rows={4}
          className="w-full resize-none rounded-xl border border-line bg-white p-3 text-[12.5px] leading-relaxed text-navy placeholder:text-ink-soft/50 focus:border-navy focus:outline-none"
        />
        <div className="mt-3 flex gap-2.5">
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 rounded-[10px] border border-line py-2.5 text-[12.5px] font-semibold text-ink transition-colors hover:border-navy"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePost}
            disabled={!body.trim()}
            className="flex-1 rounded-[10px] bg-coral py-2.5 text-[12.5px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

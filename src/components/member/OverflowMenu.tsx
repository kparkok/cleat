"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVerticalIcon } from "@/components/icons";

export function OverflowMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirming(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setOpen((prev) => {
      if (prev) setConfirming(false);
      return !prev;
    });
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setOpen(false);
    setConfirming(false);
    onEdit();
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirming(true);
  }

  function handleConfirmDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setOpen(false);
    setConfirming(false);
    onDelete();
  }

  function handleCancelDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirming(false);
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="More options"
        className="grid h-6 w-6 place-items-center rounded text-ink-soft/50 transition-colors hover:text-ink"
      >
        <MoreVerticalIcon className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-7 z-50 min-w-[128px] rounded-xl border border-line bg-white py-1 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
          onClick={(e) => e.stopPropagation()}
        >
          {confirming ? (
            <div className="px-3 py-2.5">
              <div className="mb-2.5 text-[10.5px] text-ink-soft">Delete this?</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="flex-1 rounded-lg border border-line py-1.5 text-[10.5px] font-semibold text-ink-soft transition-colors hover:border-navy"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 rounded-lg bg-coral py-1.5 text-[10.5px] font-bold text-white transition-opacity hover:opacity-90"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleEdit}
                className="w-full px-3.5 py-2 text-left text-[11.5px] font-semibold text-navy transition-colors hover:bg-paper-dim"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDeleteClick}
                className="w-full px-3.5 py-2 text-left text-[11.5px] font-semibold text-coral transition-colors hover:bg-paper-dim"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

import { supabase } from "./supabase";
import { getCurrentMemberId } from "./member-db";
import type {
  Announcement,
  AnnouncementCategory,
  AnnouncementStatus,
  CommunityPost,
  PinnedPost,
  PostComment,
} from "./types";

// ── display helpers ────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 8) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── DB row shapes ──────────────────────────────────────────────────────────

interface DbMember {
  name: string;
  initials: string;
  username: string;
}

interface DbCommentRow {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
  author: DbMember | null;
}

interface DbPostRow {
  id: string;
  marina_id: string;
  author_id: string;
  kind: "member" | "visiting";
  visiting_from: string | null;
  body: string;
  hearts: number;
  created_at: string;
  author: DbMember | null;
  post_comments: DbCommentRow[];
  post_likes: { member_id: string }[];
}

// ── transform ────────────────────────────────────────────────────────────────

function toPost(row: DbPostRow, myId: string): CommunityPost {
  const isMe = row.author_id === myId;
  const authorName = isMe
    ? `@${row.author?.username ?? "me"}`
    : (row.author?.name ?? "Unknown");

  const comments: PostComment[] = (row.post_comments ?? [])
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((c) => {
      const commentIsMe = c.author_id === myId;
      return {
        id: c.id,
        authorName: commentIsMe
          ? `@${c.author?.username ?? "me"}`
          : (c.author?.name ?? "Unknown"),
        initials: c.author?.initials ?? "?",
        authorIsMe: commentIsMe || undefined,
        body: c.body,
        timeAgo: timeAgo(c.created_at),
      };
    });

  return {
    id: row.id,
    marinaId: row.marina_id,
    authorName,
    initials: row.author?.initials ?? "?",
    authorIsMe: isMe || undefined,
    kind: row.kind,
    visitingFrom: row.visiting_from ?? undefined,
    body: row.body,
    hearts: row.hearts,
    likedByMe: (row.post_likes ?? []).some((l) => l.member_id === myId),
    comments,
    timeAgo: timeAgo(row.created_at),
    date: shortDate(row.created_at),
  };
}

// ── community posts ────────────────────────────────────────────────────────

// Shared select string — explicit comment columns to avoid fetching unused post_id.
const POST_SELECT = `
  *,
  author:members!community_posts_author_id_fkey(name, initials, username),
  post_comments(id, author_id, body, created_at, author:members!post_comments_author_id_fkey(name, initials, username)),
  post_likes(member_id)
`.trim();

export async function fetchCommunityPosts(marinaId: string): Promise<CommunityPost[]> {
  const myId = await getCurrentMemberId();
  const { data, error } = await supabase
    .from("community_posts")
    .select(POST_SELECT)
    .eq("marina_id", marinaId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as DbPostRow[]).map((row) => toPost(row, myId));
}

/** Fetches only the current member's own posts across all their marinas. */
export async function fetchMyPosts(): Promise<CommunityPost[]> {
  const myId = await getCurrentMemberId();
  const { data, error } = await supabase
    .from("community_posts")
    .select(POST_SELECT)
    .eq("author_id", myId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as DbPostRow[]).map((row) => toPost(row, myId));
}

export async function dbInsertPost(
  marinaId: string,
  body: string,
  kind: "member" | "visiting",
  visitingFrom?: string,
): Promise<string> {
  const memberId = await getCurrentMemberId();
  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      marina_id: marinaId,
      author_id: memberId,
      kind,
      visiting_from: visitingFrom ?? null,
      body,
    })
    .select("id")
    .single();

  if (error) throw error;
  return (data as { id: string }).id;
}

export async function dbUpdatePost(postId: string, body: string): Promise<void> {
  const memberId = await getCurrentMemberId();
  const { error } = await supabase
    .from("community_posts")
    .update({ body })
    .eq("id", postId)
    .eq("author_id", memberId); // only own posts
  if (error) throw error;
}

export async function dbDeletePost(postId: string): Promise<void> {
  const memberId = await getCurrentMemberId();
  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", postId)
    .eq("author_id", memberId); // only own posts
  if (error) throw error;
}

export async function upsertLike(postId: string): Promise<void> {
  const memberId = await getCurrentMemberId();
  const { error } = await supabase
    .from("post_likes")
    .insert({ post_id: postId, member_id: memberId });
  if (error && error.code !== "23505") throw error; // 23505 = already liked
}

export async function deleteLike(postId: string): Promise<void> {
  const memberId = await getCurrentMemberId();
  const { error } = await supabase
    .from("post_likes")
    .delete()
    .eq("post_id", postId)
    .eq("member_id", memberId);
  if (error) throw error;
}

export async function dbInsertComment(postId: string, body: string): Promise<string> {
  const memberId = await getCurrentMemberId();
  const { data, error } = await supabase
    .from("post_comments")
    .insert({ post_id: postId, author_id: memberId, body })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function dbUpdateComment(commentId: string, body: string): Promise<void> {
  const memberId = await getCurrentMemberId();
  const { error } = await supabase
    .from("post_comments")
    .update({ body })
    .eq("id", commentId)
    .eq("author_id", memberId);
  if (error) throw error;
}

export async function dbDeleteComment(commentId: string): Promise<void> {
  const memberId = await getCurrentMemberId();
  const { error } = await supabase
    .from("post_comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", memberId);
  if (error) throw error;
}

// ── marina board ────────────────────────────────────────────────────────────

export interface DbAnnouncementRow {
  id: string;
  title: string;
  body: string;
  category: string;
  status: string;
  published_at: string | null;
}

interface DbPinnedRow {
  id: string;
  title: string;
  meta: string | null;
  tone: "default" | "alert";
}

/** Shared row → Announcement transform — used by the member board (sent-only) and the staff dashboard (all statuses). */
export function toAnnouncement(a: DbAnnouncementRow): Announcement {
  return {
    id: a.id,
    title: a.title,
    body: a.body,
    category: a.category as AnnouncementCategory,
    status: a.status as AnnouncementStatus,
    date: a.published_at
      ? new Date(a.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "",
  };
}

export async function fetchMarinaBoardData(marinaId: string): Promise<{
  announcements: Announcement[];
  pinnedPosts: PinnedPost[];
}> {
  const [annResult, pinnedResult] = await Promise.all([
    supabase
      .from("announcements")
      .select("*")
      .eq("marina_id", marinaId)
      .eq("status", "sent")
      .order("published_at", { ascending: false }),
    supabase
      .from("pinned_posts")
      .select("*")
      .eq("marina_id", marinaId)
      .order("sort_order", { ascending: true }),
  ]);

  if (annResult.error) throw annResult.error;
  if (pinnedResult.error) throw pinnedResult.error;

  const announcements: Announcement[] = (annResult.data as DbAnnouncementRow[]).map(toAnnouncement);

  const pinnedPosts: PinnedPost[] = (pinnedResult.data as DbPinnedRow[]).map((p) => ({
    id: p.id,
    title: p.title,
    meta: p.meta ?? "",
    tone: p.tone,
  }));

  return { announcements, pinnedPosts };
}

import { createClient } from "@supabase/supabase-js";

// Both vars are NEXT_PUBLIC_ so they're safe to use in client components.
// Auth is client-side only for now (magic link via supabase.auth, session
// read from local storage) — every member route is a client component, so
// there's nothing server-rendered that needs the user's session yet. If
// server components or route handlers need auth later, that's the point to
// bring in a cookie-aware client via @supabase/ssr.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

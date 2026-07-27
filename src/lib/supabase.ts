import { createClient } from "@supabase/supabase-js";

// Both vars are NEXT_PUBLIC_ so they're safe to use in client components.
// When we add Supabase Auth (a later stage), server components and route
// handlers will need a cookie-aware client via @supabase/ssr instead.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

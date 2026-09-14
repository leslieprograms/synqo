import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Bypasses Row Level Security using the secret key. Only import this
 * from trusted server actions or route handlers that need to write to
 * a table with no authenticated-role policy — today, that's just the
 * shared `items` catalog, which is meant to be written exclusively by
 * server-side search adapters, never directly by a user's own session.
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not set. Add it to .env.local to enable catalog writes."
    );
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

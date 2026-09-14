"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithEmail(email: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  return { error: error?.message ?? null };
}

/**
 * Verifies the 6-digit code from the same email the magic link came in —
 * an alternative for anyone who'd rather not switch to their inbox app
 * and back. Requires the Magic Link email template to actually include
 * {{ .Token }}, otherwise there's no code to type.
 */
export async function verifyLoginCode(email: string, token: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) return { error: error.message };
  redirect("/onboarding");
}

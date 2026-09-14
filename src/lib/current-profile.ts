import { createClient } from "@/lib/supabase/server";

export interface ProfileRow {
  user_id: string;
  handle: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  social_url: string | null;
  onboarding_completed_at: string | null;
}

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<ProfileRow>();

  return { user, profile };
}

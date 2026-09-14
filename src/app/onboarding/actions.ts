"use server";

import { createClient } from "@/lib/supabase/server";
import { profiles as seedProfiles } from "@/lib/seed-data";

const RESERVED_HANDLES = new Set(seedProfiles.map((p) => p.handle));

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, user };
}

export async function checkHandleAvailability(handle: string): Promise<boolean> {
  const normalized = handle.trim().toLowerCase();
  if (RESERVED_HANDLES.has(normalized)) return false;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("handle", normalized)
    .maybeSingle();
  return !data;
}

export async function saveHandle(input: {
  handle: string;
  displayName: string;
}): Promise<{ error: string | null }> {
  const { supabase, user } = await requireUser();
  const handle = input.handle.trim().toLowerCase();
  const displayName = input.displayName.trim();

  if (!/^[a-z0-9_]{2,20}$/.test(handle)) {
    return { error: "Handles are 2-20 characters: lowercase letters, numbers, underscores." };
  }
  if (!displayName) {
    return { error: "Add a name." };
  }
  if (RESERVED_HANDLES.has(handle)) {
    return { error: "That handle is taken." };
  }

  const { error } = await supabase
    .from("profiles")
    .upsert(
      { user_id: user.id, handle, display_name: displayName },
      { onConflict: "user_id" }
    );

  if (error) {
    return { error: error.code === "23505" ? "That handle is taken." : error.message };
  }
  return { error: null };
}

export async function completeOnboarding(): Promise<{ error: string | null; handle?: string }> {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("handle")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { error: "Claim a handle first." };

  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { error: null, handle: profile.handle as string };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { searchCatalog, type CatalogCandidate } from "@/lib/media-api/search";

/**
 * Shared by onboarding's "pick 6" step and the owner-only add/remove
 * controls on a real profile page — same underlying tables, same rules,
 * used from two different places in the flow.
 */
async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, user };
}

async function upsertItem(candidate: CatalogCandidate): Promise<{ itemId: string } | { error: string }> {
  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Catalog writes aren't configured yet." };
  }

  const { data: item, error } = await admin
    .from("items")
    .upsert(
      {
        media_type: candidate.mediaType,
        source: candidate.source,
        source_id: candidate.sourceId,
        title: candidate.title,
        year: candidate.year,
        cover_url: candidate.coverUrl,
        creator: candidate.creator,
      },
      { onConflict: "source,media_type,source_id" }
    )
    .select("id")
    .single();

  if (error || !item) return { error: error?.message ?? "Could not save that title." };
  return { itemId: item.id as string };
}

export async function searchCatalogAction(query: string): Promise<CatalogCandidate[]> {
  return searchCatalog(query);
}

/**
 * Favoriting doesn't require a rating — it just marks the item as
 * "experienced" (state: rated) and adds it to the favorites shelf.
 * Rating stays null unless the user sets one elsewhere.
 */
export async function addFavorite(
  candidate: CatalogCandidate,
  revalidateHandle?: string
): Promise<{ error: string | null; itemId?: string }> {
  const { supabase, user } = await requireUser();

  const result = await upsertItem(candidate);
  if ("error" in result) return result;

  const { error: userItemError } = await supabase
    .from("user_items")
    .upsert({ user_id: user.id, item_id: result.itemId, state: "rated" }, { onConflict: "user_id,item_id" });
  if (userItemError) return { error: userItemError.message };

  const { data: lastPosition } = await supabase
    .from("favorite_items")
    .select("position")
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error: favoriteError } = await supabase.from("favorite_items").upsert(
    { user_id: user.id, item_id: result.itemId, position: (lastPosition?.position ?? 0) + 1 },
    { onConflict: "user_id,item_id" }
  );
  if (favoriteError) return { error: favoriteError.message };

  if (revalidateHandle) revalidatePath(`/${revalidateHandle}`);
  return { error: null, itemId: result.itemId };
}

/** Removes an item from the favorites shelf only — leaves any rating/comment on it intact. */
export async function removeFavorite(
  itemId: string,
  revalidateHandle?: string
): Promise<{ error: string | null }> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("favorite_items")
    .delete()
    .eq("user_id", user.id)
    .eq("item_id", itemId);
  if (error) return { error: error.message };

  if (revalidateHandle) revalidatePath(`/${revalidateHandle}`);
  return { error: null };
}

/** Adds to the private "next to binge" queue — not rated, not public. */
export async function addToWatchlist(
  candidate: CatalogCandidate,
  revalidateHandle?: string
): Promise<{ error: string | null; itemId?: string }> {
  const { supabase, user } = await requireUser();

  const result = await upsertItem(candidate);
  if ("error" in result) return result;

  const { error } = await supabase
    .from("user_items")
    .upsert({ user_id: user.id, item_id: result.itemId, state: "saved" }, { onConflict: "user_id,item_id" });
  if (error) return { error: error.message };

  if (revalidateHandle) revalidatePath(`/${revalidateHandle}`);
  return { error: null, itemId: result.itemId };
}

export async function removeFromWatchlist(
  itemId: string,
  revalidateHandle?: string
): Promise<{ error: string | null }> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("user_items")
    .delete()
    .eq("user_id", user.id)
    .eq("item_id", itemId)
    .eq("state", "saved");
  if (error) return { error: error.message };

  if (revalidateHandle) revalidatePath(`/${revalidateHandle}`);
  return { error: null };
}

import { createClient } from "@/lib/supabase/server";
import { relativeTimeShort } from "@/lib/format";
import { Comment, FavoriteEntry, Item, ListDef, Profile, WatchlistEntry } from "@/lib/types";

interface ItemRow {
  id: string;
  title: string;
  year: number | null;
  media_type: Item["mediaType"];
  cover_url: string | null;
}

function toItem(row: ItemRow): Item {
  return {
    id: row.id,
    title: row.title,
    year: row.year,
    mediaType: row.media_type,
    genres: [],
    colorSeed: row.id,
  };
}

export interface RealProfileResult {
  profile: Profile;
  itemsById: Record<string, Item>;
  coverUrls: Record<string, string | null>;
  userId: string;
}

/**
 * Reads a real, onboarded profile straight from Supabase and reshapes it
 * into the same `Profile`/`Item` shape the seeded catalog already uses,
 * so `TasteProfile` doesn't need two code paths. Cover art comes straight
 * from `items.cover_url` — it was already resolved once at onboarding
 * time, so there's no TMDB/IGDB call on every page view.
 */
export async function getRealProfileByHandle(handle: string): Promise<RealProfileResult | null> {
  const supabase = await createClient();

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("user_id, handle, display_name, bio, social_url, onboarding_completed_at")
    .eq("handle", handle)
    .not("onboarding_completed_at", "is", null)
    .maybeSingle();

  if (!profileRow) return null;

  const [{ data: userItemRows }, { data: favoriteRows }, { data: listRows }] = await Promise.all([
    supabase
      .from("user_items")
      .select("item_id, state, rating, review_text, created_at, items(*)")
      .eq("user_id", profileRow.user_id),
    supabase
      .from("favorite_items")
      .select("item_id, position, items(*)")
      .eq("user_id", profileRow.user_id)
      .order("position"),
    supabase
      .from("lists")
      .select("id, name, created_at")
      .eq("user_id", profileRow.user_id)
      .order("created_at"),
  ]);

  const itemsById: Record<string, Item> = {};
  const coverUrls: Record<string, string | null> = {};

  const registerItem = (row: ItemRow | null) => {
    if (!row) return;
    itemsById[row.id] = toItem(row);
    coverUrls[row.id] = row.cover_url;
  };

  for (const row of userItemRows ?? []) {
    registerItem(row.items as unknown as ItemRow | null);
  }
  for (const row of favoriteRows ?? []) {
    registerItem(row.items as unknown as ItemRow | null);
  }

  const ratingsByItemId: Record<string, number> = {};
  for (const row of userItemRows ?? []) {
    if (row.state === "rated" && typeof row.rating === "number") {
      ratingsByItemId[row.item_id] = row.rating / 2; // stored 1-10, shown out of 5
    }
  }

  const favorites: FavoriteEntry[] = (favoriteRows ?? []).map((row) => ({
    itemId: row.item_id,
    rating: ratingsByItemId[row.item_id] ?? null,
  }));

  const nextToBinge: WatchlistEntry[] = (userItemRows ?? [])
    .filter((row) => row.state === "saved")
    .map((row) => ({ itemId: row.item_id }));

  const comments: Comment[] = (userItemRows ?? [])
    .filter((row) => row.state === "rated" && row.review_text)
    .map((row) => ({
      id: `${profileRow.user_id}-${row.item_id}`,
      itemId: row.item_id,
      rating: ratingsByItemId[row.item_id] ?? 0,
      text: row.review_text as string,
      postedAt: relativeTimeShort(row.created_at),
    }))
    .sort((a, b) => (a.id < b.id ? 1 : -1));

  const listIds = (listRows ?? []).map((list) => list.id);
  const { data: listItemRows } = listIds.length
    ? await supabase
        .from("list_items")
        .select("list_id, item_id, position, items(*)")
        .in("list_id", listIds)
        .order("position")
    : { data: [] as never[] };

  for (const row of listItemRows ?? []) {
    registerItem(row.items as unknown as ItemRow | null);
  }

  const lists: ListDef[] = (listRows ?? []).map((list) => ({
    id: list.id,
    title: list.name,
    itemIds: (listItemRows ?? [])
      .filter((row) => row.list_id === list.id)
      .map((row) => row.item_id),
  }));

  const profile: Profile = {
    handle: profileRow.handle,
    displayName: profileRow.display_name,
    bio: profileRow.bio,
    socialUrl: profileRow.social_url ?? undefined,
    avatarSeed: profileRow.handle,
    favorites,
    nextToBinge,
    comments,
    lists,
  };

  return { profile, itemsById, coverUrls, userId: profileRow.user_id };
}

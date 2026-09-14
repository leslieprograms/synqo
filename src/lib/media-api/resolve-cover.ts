import "server-only";
import { Item } from "@/lib/types";
import { fetchTmdbPoster } from "./tmdb";
import { fetchIgdbCover } from "./igdb";

/**
 * In-memory per-process cache, used only for the seeded demo catalog —
 * real items resolve their cover once at onboarding time and store it
 * in `items.cover_url`, so pages for real profiles never call this.
 */
const cache = new Map<string, string | null>();

async function fetchCover(item: Item): Promise<string | null> {
  if (item.year == null) return null;
  if (item.mediaType === "game") {
    return fetchIgdbCover(item.title, item.year);
  }
  return fetchTmdbPoster(item.title, item.year, item.mediaType);
}

export async function resolveCoverUrl(item: Item): Promise<string | null> {
  if (cache.has(item.id)) return cache.get(item.id)!;

  let url: string | null = null;
  try {
    url = await fetchCover(item);
  } catch {
    url = null;
  }

  cache.set(item.id, url);
  return url;
}

/** Resolves covers for a batch of (possibly repeated) items in parallel. */
export async function resolveCoverUrls(items: Item[]): Promise<Record<string, string | null>> {
  const uniqueItems = [...new Map(items.map((item) => [item.id, item])).values()];
  const entries = await Promise.all(
    uniqueItems.map(async (item) => [item.id, await resolveCoverUrl(item)] as const)
  );
  return Object.fromEntries(entries);
}

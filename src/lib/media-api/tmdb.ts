import "server-only";
import { MediaType } from "@/lib/types";

/**
 * TMDB covers film and TV posters. The API key is read straight from
 * the server environment and never touches a client bundle — this
 * module is marked server-only so an accidental import from a client
 * component fails the build instead of leaking the key.
 */
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

interface TmdbSearchResult {
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
}

export async function fetchTmdbPoster(
  title: string,
  year: number,
  mediaType: Extract<MediaType, "film" | "tv">
): Promise<string | null> {
  if (!TMDB_API_KEY) return null;

  const endpoint = mediaType === "tv" ? "tv" : "movie";
  const yearParam = mediaType === "tv" ? "first_air_date_year" : "year";
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    query: title,
    [yearParam]: String(year),
  });

  try {
    const res = await fetch(`${TMDB_BASE}/search/${endpoint}?${params}`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return null;

    const data: { results?: TmdbSearchResult[] } = await res.json();
    const posterPath = data.results?.[0]?.poster_path;
    return posterPath ? `${TMDB_IMAGE_BASE}${posterPath}` : null;
  } catch {
    return null;
  }
}

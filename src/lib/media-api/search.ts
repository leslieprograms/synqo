import "server-only";
import { MediaType } from "@/lib/types";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID;
const IGDB_CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;

export interface CatalogCandidate {
  source: "tmdb" | "igdb";
  sourceId: string;
  mediaType: MediaType;
  title: string;
  year: number | null;
  coverUrl: string | null;
  creator: string | null;
}

interface TmdbMultiResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
}

async function searchTmdb(query: string): Promise<CatalogCandidate[]> {
  if (!TMDB_API_KEY) return [];

  const params = new URLSearchParams({ api_key: TMDB_API_KEY, query });
  const res = await fetch(`${TMDB_BASE}/search/multi?${params}`);
  if (!res.ok) return [];

  const data: { results?: TmdbMultiResult[] } = await res.json();
  return (data.results ?? [])
    .filter((r): r is TmdbMultiResult & { media_type: "movie" | "tv" } =>
      r.media_type === "movie" || r.media_type === "tv"
    )
    .map((r) => {
      const dateStr = r.media_type === "tv" ? r.first_air_date : r.release_date;
      return {
        source: "tmdb" as const,
        sourceId: String(r.id),
        mediaType: r.media_type === "tv" ? "tv" : "film",
        title: (r.title ?? r.name ?? "Untitled").trim(),
        year: dateStr ? new Date(dateStr).getUTCFullYear() : null,
        coverUrl: r.poster_path ? `${TMDB_IMAGE_BASE}${r.poster_path}` : null,
        creator: null,
      };
    });
}

let cachedIgdbToken: { token: string; expiresAt: number } | null = null;

async function getIgdbToken(): Promise<string | null> {
  if (!IGDB_CLIENT_ID || !IGDB_CLIENT_SECRET) return null;
  if (cachedIgdbToken && cachedIgdbToken.expiresAt > Date.now()) return cachedIgdbToken.token;

  const params = new URLSearchParams({
    client_id: IGDB_CLIENT_ID,
    client_secret: IGDB_CLIENT_SECRET,
    grant_type: "client_credentials",
  });
  const res = await fetch(`https://id.twitch.tv/oauth2/token?${params}`, { method: "POST" });
  if (!res.ok) return null;

  const data: { access_token: string; expires_in: number } = await res.json();
  cachedIgdbToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedIgdbToken.token;
}

interface IgdbSearchResult {
  name: string;
  first_release_date?: number;
  cover?: { image_id: string };
  involved_companies?: { company: { name: string } }[];
}

async function searchIgdb(query: string): Promise<CatalogCandidate[]> {
  if (!IGDB_CLIENT_ID) return [];
  const token = await getIgdbToken();
  if (!token) return [];

  const escaped = query.replace(/"/g, '\\"');
  const body = `search "${escaped}"; fields name, cover.image_id, first_release_date; limit 10;`;

  const res = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": IGDB_CLIENT_ID,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body,
  });
  if (!res.ok) return [];

  const results: (IgdbSearchResult & { id: number })[] = await res.json();
  return results.map((r) => ({
    source: "igdb" as const,
    sourceId: String(r.id),
    mediaType: "game" as const,
    title: r.name,
    year: r.first_release_date ? new Date(r.first_release_date * 1000).getUTCFullYear() : null,
    coverUrl: r.cover?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${r.cover.image_id}.jpg`
      : null,
    creator: null,
  }));
}

/** Searches film/TV (TMDB) and games (IGDB) in parallel for the onboarding picker. */
export async function searchCatalog(query: string): Promise<CatalogCandidate[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const [tmdbResults, igdbResults] = await Promise.all([
    searchTmdb(trimmed).catch(() => []),
    searchIgdb(trimmed).catch(() => []),
  ]);

  return [...tmdbResults, ...igdbResults];
}

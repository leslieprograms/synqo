import "server-only";

/**
 * IGDB covers game box art. It authenticates through Twitch's OAuth2
 * client-credentials flow, so a short-lived bearer token is fetched
 * and cached in memory alongside the client secret — both stay on
 * the server.
 */
const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID;
const IGDB_CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getIgdbToken(): Promise<string | null> {
  if (!IGDB_CLIENT_ID || !IGDB_CLIENT_SECRET) return null;
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;

  const params = new URLSearchParams({
    client_id: IGDB_CLIENT_ID,
    client_secret: IGDB_CLIENT_SECRET,
    grant_type: "client_credentials",
  });

  try {
    const res = await fetch(`https://id.twitch.tv/oauth2/token?${params}`, {
      method: "POST",
    });
    if (!res.ok) return null;

    const data: { access_token: string; expires_in: number } = await res.json();
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    };
    return cachedToken.token;
  } catch {
    return null;
  }
}

interface IgdbGame {
  first_release_date?: number;
  cover?: { image_id: string };
}

export async function fetchIgdbCover(title: string, year: number): Promise<string | null> {
  if (!IGDB_CLIENT_ID) return null;
  const token = await getIgdbToken();
  if (!token) return null;

  const escapedTitle = title.replace(/"/g, '\\"');
  const body = `search "${escapedTitle}"; fields cover.image_id, first_release_date; limit 5;`;

  try {
    const res = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": IGDB_CLIENT_ID,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body,
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return null;

    const results: IgdbGame[] = await res.json();
    const match =
      results.find(
        (r) =>
          r.first_release_date &&
          new Date(r.first_release_date * 1000).getUTCFullYear() === year
      ) ?? results[0];

    return match?.cover?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${match.cover.image_id}.jpg`
      : null;
  } catch {
    return null;
  }
}

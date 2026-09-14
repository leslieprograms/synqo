export type MediaType = "film" | "tv" | "game";

export interface Item {
  id: string;
  title: string;
  year: number | null;
  mediaType: MediaType;
  genres: string[];
  /** Seed string used to derive a deterministic gradient for the cover placeholder. */
  colorSeed: string;
  synopsis?: string;
}

export interface FavoriteEntry {
  itemId: string;
  /** Rating is optional — favoriting something doesn't require rating it. */
  rating: number | null; // 1-5
}

export interface WatchlistEntry {
  itemId: string;
  note?: string;
}

export interface Comment {
  id: string;
  itemId: string;
  rating: number; // 1-5
  text: string;
  postedAt: string; // relative label, e.g. "1mo"
  featured?: boolean;
}

export interface ListDef {
  id: string;
  title: string;
  itemIds: string[];
}

export interface Profile {
  handle: string;
  displayName: string;
  bio: string;
  socialUrl?: string;
  avatarSeed: string;
  favorites: FavoriteEntry[];
  nextToBinge: WatchlistEntry[];
  comments: Comment[];
  lists: ListDef[];
}

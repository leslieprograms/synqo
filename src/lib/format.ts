import { MediaType } from "./types";

export const mediaLabels: Record<MediaType, string> = {
  film: "Film",
  tv: "TV",
  game: "Game",
};

export function mediaLabel(mediaType: MediaType): string {
  return mediaLabels[mediaType];
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** "3d", "1mo", "2y" — matches the compact style already used for seeded comments. */
export function relativeTimeShort(date: string | Date): string {
  const seconds = (Date.now() - new Date(date).getTime()) / 1000;
  for (const [unit, secondsInUnit] of UNITS) {
    const value = Math.floor(seconds / secondsInUnit);
    if (value >= 1) {
      const abbrev = unit === "month" ? "mo" : unit.charAt(0);
      return `${value}${abbrev}`;
    }
  }
  return "just now";
}

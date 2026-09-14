import Image from "next/image";
import { Film, Gamepad2, Tv } from "lucide-react";
import { gradientForSeed } from "@/lib/color";
import { MediaType } from "@/lib/types";

const mediaIcon: Record<MediaType, typeof Film> = {
  film: Film,
  tv: Tv,
  game: Gamepad2,
};

/**
 * Poster-shaped placeholder cover. Every screen reads this as "the
 * art" — it's the one place color is allowed, so the rest of the UI
 * can stay quiet. Swapping in real TMDB/IGDB cover_url values later
 * only touches this component.
 */
export function CoverArt({
  title,
  colorSeed,
  mediaType,
  imageUrl,
  className = "",
  showLabel = true,
}: {
  title: string;
  colorSeed: string;
  mediaType: MediaType;
  /** Real poster/cover art from TMDB or IGDB, when the API keys are configured. */
  imageUrl?: string | null;
  className?: string;
  showLabel?: boolean;
}) {
  if (imageUrl) {
    return (
      <div className={`relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-surface-muted ${className}`}>
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 45vw, 200px"
          className="object-cover"
        />
      </div>
    );
  }

  const Icon = mediaIcon[mediaType];
  return (
    <div
      className={`relative aspect-[2/3] w-full overflow-hidden rounded-xl ${className}`}
      style={{ backgroundImage: gradientForSeed(colorSeed) }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/10" />
      <Icon
        strokeWidth={1.5}
        className="absolute right-2 top-2 h-3.5 w-3.5 text-white/75"
      />
      {showLabel && (
        <span className="absolute inset-x-0 bottom-0 p-2.5 text-[13px] font-medium leading-tight text-white">
          {title}
        </span>
      )}
    </div>
  );
}

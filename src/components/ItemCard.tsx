import { Loader2, X } from "lucide-react";
import { CoverArt } from "./CoverArt";
import { StarRating } from "./StarRating";
import { Item } from "@/lib/types";
import { mediaLabel } from "@/lib/format";

export function ItemCard({
  item,
  rating,
  note,
  imageUrl,
  onRemove,
  removing,
  className = "",
}: {
  item: Item;
  rating?: number | null;
  note?: string;
  imageUrl?: string | null;
  /** Shown as a hover-reveal "×" in the corner — pass only when the viewer owns this list. */
  onRemove?: () => void;
  removing?: boolean;
  className?: string;
}) {
  return (
    <div className={`group relative flex w-[148px] shrink-0 flex-col gap-2 sm:w-[168px] ${className}`}>
      <CoverArt
        title={item.title}
        colorSeed={item.colorSeed}
        mediaType={item.mediaType}
        imageUrl={imageUrl}
      />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          aria-label={`Remove ${item.title}`}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-60"
        >
          {removing ? <Loader2 size={12} className="animate-spin" /> : <X size={13} />}
        </button>
      )}
      <div className="space-y-1">
        {rating != null && <StarRating rating={rating} size={13} />}
        <p className="truncate text-xs text-muted">
          {mediaLabel(item.mediaType)}
          {item.year ? ` · ${item.year}` : ""}
        </p>
        {note && <p className="text-xs italic text-muted">{note}</p>}
      </div>
    </div>
  );
}

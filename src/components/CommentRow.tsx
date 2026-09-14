import { CoverArt } from "./CoverArt";
import { StarRating } from "./StarRating";
import { SaveButton } from "./SaveButton";
import { Comment, Item } from "@/lib/types";
import { mediaLabel } from "@/lib/format";

export function CommentRow({
  item,
  comment,
  imageUrl,
}: {
  item: Item;
  comment: Comment;
  imageUrl?: string | null;
}) {
  return (
    <div className="flex gap-4 border-b border-border py-5 first:pt-0 last:border-b-0">
      <div className="w-14 shrink-0 sm:w-16">
        <CoverArt
          title={item.title}
          colorSeed={item.colorSeed}
          mediaType={item.mediaType}
          imageUrl={imageUrl}
          showLabel={false}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <h3 className="font-semibold">{item.title}</h3>
              {item.year && <span className="text-sm text-muted">{item.year}</span>}
              <span className="rounded-full border border-border px-1.5 py-px text-[11px] text-muted">
                {mediaLabel(item.mediaType)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <StarRating rating={comment.rating} />
              <span className="text-xs text-muted">Commented {comment.postedAt} ago</span>
            </div>
          </div>
          <SaveButton />
        </div>
        <p className="mt-2.5 text-[15px] leading-relaxed text-foreground/90">
          {comment.text}
        </p>
      </div>
    </div>
  );
}

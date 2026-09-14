"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

/**
 * Visual-only for now — there's no account system yet, so this just
 * toggles local state. It's here so the layout reads correctly once
 * saves are wired up to real user_items rows.
 */
export function SaveButton({ initialSaved = false }: { initialSaved?: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  return (
    <button
      type="button"
      onClick={() => setSaved((s) => !s)}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-foreground hover:text-foreground"
    >
      <Heart
        size={16}
        strokeWidth={1.5}
        className={saved ? "text-foreground" : ""}
        fill={saved ? "currentColor" : "none"}
      />
    </button>
  );
}

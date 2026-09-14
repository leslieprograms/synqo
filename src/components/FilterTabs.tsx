"use client";

import { MediaType } from "@/lib/types";
import { mediaLabels } from "@/lib/format";

export type FilterValue = "all" | MediaType;

const options: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "film", label: mediaLabels.film },
  { value: "tv", label: mediaLabels.tv },
  { value: "game", label: mediaLabels.game },
];

export function FilterTabs({
  value,
  onChange,
}: {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-border pb-3">
      <span className="mr-2 text-xs text-muted">Showing</span>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={
              active
                ? "rounded-full bg-foreground px-3.5 py-1.5 text-sm font-medium text-background"
                : "rounded-full px-3.5 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

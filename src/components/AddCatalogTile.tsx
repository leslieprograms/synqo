"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { CoverArt } from "./CoverArt";
import { mediaLabel } from "@/lib/format";
import { searchCatalogAction } from "@/lib/actions/catalog";
import type { CatalogCandidate } from "@/lib/media-api/search";

function candidateKey(c: CatalogCandidate) {
  return `${c.source}:${c.sourceId}`;
}

/**
 * A dashed "+ Add" poster tile that expands into a search panel. Used
 * on a real profile page's Favorites and Next to Binge sections, but
 * only ever rendered for the signed-in owner of that page.
 */
export function AddCatalogTile({
  onAdd,
  label = "Add",
}: {
  onAdd: (candidate: CatalogCandidate) => Promise<{ error: string | null }>;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogCandidate[]>([]);
  const [searchedQuery, setSearchedQuery] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryTooShort = query.trim().length < 2;
  const searching = !queryTooShort && searchedQuery !== query;

  useEffect(() => {
    if (queryTooShort) return;
    const timer = setTimeout(async () => {
      const found = await searchCatalogAction(query);
      setResults(found);
      setSearchedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, queryTooShort]);

  function reset() {
    setOpen(false);
    setQuery("");
    setResults([]);
    setSearchedQuery(null);
    setError(null);
  }

  async function handlePick(candidate: CatalogCandidate) {
    setPendingKey(candidateKey(candidate));
    setError(null);
    const result = await onAdd(candidate);
    setPendingKey(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    reset();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex aspect-[2/3] w-[148px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border text-muted transition-colors hover:border-foreground hover:text-foreground sm:w-[168px]"
      >
        <Plus size={18} strokeWidth={1.5} />
        <span className="text-xs">{label}</span>
      </button>
    );
  }

  return (
    <div className="w-[280px] shrink-0 rounded-xl border border-border bg-surface p-3.5 sm:w-[320px]">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, shows, and games…"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        <button
          type="button"
          onClick={reset}
          aria-label="Close"
          className="text-muted transition-colors hover:text-foreground"
        >
          <X size={15} />
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {searching && <p className="mt-2 text-xs text-muted">Searching…</p>}
      {!searching && !queryTooShort && results.length === 0 && (
        <p className="mt-2 text-xs text-muted">No results.</p>
      )}

      {!queryTooShort && results.length > 0 && (
        <div className="mt-3 max-h-72 space-y-1 overflow-y-auto">
          {results.map((candidate) => {
            const key = candidateKey(candidate);
            return (
              <button
                key={key}
                type="button"
                disabled={pendingKey === key}
                onClick={() => handlePick(candidate)}
                className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-surface-muted disabled:opacity-60"
              >
                <div className="w-8 shrink-0">
                  <CoverArt
                    title={candidate.title}
                    colorSeed={candidate.sourceId}
                    mediaType={candidate.mediaType}
                    imageUrl={candidate.coverUrl}
                    showLabel={false}
                  />
                </div>
                <span className="min-w-0 flex-1 truncate text-sm">{candidate.title}</span>
                <span className="shrink-0 text-xs text-muted">
                  {mediaLabel(candidate.mediaType)}
                  {candidate.year ? ` · ${candidate.year}` : ""}
                </span>
                {pendingKey === key && <Loader2 size={14} className="animate-spin text-muted" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

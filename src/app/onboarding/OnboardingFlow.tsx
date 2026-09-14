"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { CoverArt } from "@/components/CoverArt";
import { mediaLabel } from "@/lib/format";
import type { CatalogCandidate } from "@/lib/media-api/search";
import { addFavorite, removeFavorite, searchCatalogAction } from "@/lib/actions/catalog";
import { checkHandleAvailability, completeOnboarding, saveHandle } from "./actions";

const MAX_PICKS = 6;

type HandleStatus = "idle" | "checking" | "available" | "taken" | "invalid";
type Pick = CatalogCandidate & { itemId: string };

function candidateKey(c: CatalogCandidate) {
  return `${c.source}:${c.sourceId}`;
}

export function OnboardingFlow({
  initialStep,
  initialDisplayName,
  initialHandle,
}: {
  initialStep: 1 | 2;
  initialDisplayName: string;
  initialHandle: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(initialStep);
  const [handle, setHandle] = useState(initialHandle);

  return step === 1 ? (
    <ClaimHandleStep
      initialDisplayName={initialDisplayName}
      initialHandle={initialHandle}
      onDone={(claimedHandle) => {
        setHandle(claimedHandle);
        setStep(2);
      }}
    />
  ) : (
    <PickFavoritesStep onFinished={() => router.push(`/${handle}`)} />
  );
}

function ClaimHandleStep({
  initialDisplayName,
  initialHandle,
  onDone,
}: {
  initialDisplayName: string;
  initialHandle: string;
  onDone: (handle: string) => void;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [handle, setHandle] = useState(initialHandle);
  const [checkedHandle, setCheckedHandle] = useState<string | null>(null);
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const checkId = useRef(0);

  const trimmedHandle = handle.trim().toLowerCase();
  const formatValid = trimmedHandle.length > 0 && /^[a-z0-9_]{2,20}$/.test(trimmedHandle);
  const status: HandleStatus = !trimmedHandle
    ? "idle"
    : !formatValid
      ? "invalid"
      : checkedHandle !== trimmedHandle
        ? "checking"
        : available
          ? "available"
          : "taken";

  useEffect(() => {
    if (!formatValid) return;
    const id = ++checkId.current;
    const timer = setTimeout(async () => {
      const isAvailable = await checkHandleAvailability(trimmedHandle);
      if (checkId.current === id) {
        setAvailable(isAvailable);
        setCheckedHandle(trimmedHandle);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [trimmedHandle, formatValid]);

  const canSubmit = status === "available" && displayName.trim().length > 0 && !pending;

  return (
    <div className="mx-auto max-w-sm">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">Step 1 of 2</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Claim your handle</h1>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            const result = await saveHandle({ handle, displayName });
            if (result.error) setError(result.error);
            else onDone(handle.trim().toLowerCase());
          });
        }}
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Display name</label>
          <input
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Maya Chen"
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-foreground"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Handle</label>
          <div className="flex items-center rounded-lg border border-border bg-surface px-3.5 py-2.5 focus-within:border-foreground">
            <span className="text-sm text-muted">synqo.app/@</span>
            <input
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value.replace(/\s/g, ""))}
              placeholder="maya"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            {status === "checking" && <Loader2 size={15} className="animate-spin text-muted" />}
            {status === "available" && <Check size={15} className="text-green-600" />}
          </div>
          {status === "taken" && <p className="mt-1.5 text-xs text-red-600">That handle is taken.</p>}
          {status === "invalid" && (
            <p className="mt-1.5 text-xs text-muted">
              2-20 characters: lowercase letters, numbers, underscores.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}

function PickFavoritesStep({ onFinished }: { onFinished: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogCandidate[]>([]);
  const [searchedQuery, setSearchedQuery] = useState<string | null>(null);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finishing, startFinishing] = useTransition();

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

  const pickedKeys = new Set(picks.map((p) => candidateKey(p)));

  async function handleAdd(candidate: CatalogCandidate) {
    if (picks.length >= MAX_PICKS) return;
    setError(null);
    setPendingKey(candidateKey(candidate));
    const result = await addFavorite(candidate);
    setPendingKey(null);
    if (result.error || !result.itemId) {
      setError(result.error ?? "Could not save that title.");
      return;
    }
    setPicks((prev) => [...prev, { ...candidate, itemId: result.itemId! }]);
  }

  async function handleRemove(pick: Pick) {
    setPicks((prev) => prev.filter((p) => p.itemId !== pick.itemId));
    await removeFavorite(pick.itemId);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">Step 2 of 2</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Pick 6 you love</h1>
      <p className="mt-1.5 text-sm text-muted">
        Search only — no suggestions. Your canon, not the algorithm&rsquo;s.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3 md:grid-cols-6">
        {Array.from({ length: MAX_PICKS }).map((_, i) => {
          const pick = picks[i];
          if (!pick) {
            return (
              <div
                key={i}
                className="flex aspect-[2/3] items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted"
              >
                Empty
              </div>
            );
          }
          return (
            <div key={pick.itemId} className="group relative">
              <CoverArt
                title={pick.title}
                colorSeed={pick.sourceId}
                mediaType={pick.mediaType}
                imageUrl={pick.coverUrl}
                showLabel={!pick.coverUrl}
              />
              <button
                type="button"
                onClick={() => handleRemove(pick)}
                aria-label={`Remove ${pick.title}`}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="relative mt-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, shows, and games…"
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-foreground"
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {searching && <p className="mt-3 text-sm text-muted">Searching…</p>}

      {!searching && !queryTooShort && results.length === 0 && (
        <p className="mt-3 text-sm text-muted">
          No results. If this is your first search, TMDB and IGDB keys may not be configured yet.
        </p>
      )}

      {!queryTooShort && results.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3 md:grid-cols-5">
          {results.map((candidate) => {
            const key = candidateKey(candidate);
            const picked = pickedKeys.has(key);
            return (
              <button
                key={key}
                type="button"
                disabled={picked || pendingKey === key || picks.length >= MAX_PICKS}
                onClick={() => handleAdd(candidate)}
                className="group flex flex-col gap-1.5 text-left disabled:cursor-not-allowed"
              >
                <div className="relative">
                  <CoverArt
                    title={candidate.title}
                    colorSeed={candidate.sourceId}
                    mediaType={candidate.mediaType}
                    imageUrl={candidate.coverUrl}
                    showLabel={!candidate.coverUrl}
                    className={picked ? "opacity-40" : "transition-opacity group-hover:opacity-80"}
                  />
                  {pendingKey === key && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 size={18} className="animate-spin text-white" />
                    </div>
                  )}
                  {picked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check size={20} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="truncate text-xs text-muted">
                  {mediaLabel(candidate.mediaType)}
                  {candidate.year ? ` · ${candidate.year}` : ""}
                </p>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        disabled={picks.length === 0 || finishing}
        onClick={() =>
          startFinishing(async () => {
            const result = await completeOnboarding();
            if (result.error) setError(result.error);
            else onFinished();
          })
        }
        className="mt-10 rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {finishing ? "Finishing…" : `Finish (${picks.length}/${MAX_PICKS})`}
      </button>
    </div>
  );
}

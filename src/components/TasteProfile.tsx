"use client";

import { useMemo, useState } from "react";
import { Item, Profile } from "@/lib/types";
import { itemsById as seedItemsById } from "@/lib/seed-data";
import { addFavorite, addToWatchlist, removeFavorite, removeFromWatchlist } from "@/lib/actions/catalog";
import type { CatalogCandidate } from "@/lib/media-api/search";
import { ProfileHeader } from "./ProfileHeader";
import { FilterTabs, FilterValue } from "./FilterTabs";
import { SectionHeader } from "./SectionHeader";
import { ScrollRow } from "./ScrollRow";
import { ItemCard } from "./ItemCard";
import { CommentRow } from "./CommentRow";
import { OnThisPageNav } from "./OnThisPageNav";
import { AddCatalogTile } from "./AddCatalogTile";

export function TasteProfile({
  profile,
  coverUrls = {},
  itemsById = seedItemsById,
  isOwner = false,
}: {
  profile: Profile;
  /** Real poster/cover art, keyed by item id. Falls back to the gradient placeholder when a key is missing or null. */
  coverUrls?: Record<string, string | null>;
  /** Item lookup for this profile's data source. Defaults to the seed catalog. */
  itemsById?: Record<string, Item>;
  /** Shows add/remove controls for Favorites and Next to Binge — only ever true for the signed-in owner. */
  isOwner?: boolean;
}) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [removingFavoriteId, setRemovingFavoriteId] = useState<string | null>(null);
  const [removingWatchlistId, setRemovingWatchlistId] = useState<string | null>(null);

  async function handleRemoveFavorite(itemId: string) {
    setRemovingFavoriteId(itemId);
    await removeFavorite(itemId, profile.handle);
    setRemovingFavoriteId(null);
  }

  async function handleRemoveWatchlistItem(itemId: string) {
    setRemovingWatchlistId(itemId);
    await removeFromWatchlist(itemId, profile.handle);
    setRemovingWatchlistId(null);
  }

  async function handleAddFavorite(candidate: CatalogCandidate) {
    return addFavorite(candidate, profile.handle);
  }

  async function handleAddToWatchlist(candidate: CatalogCandidate) {
    return addToWatchlist(candidate, profile.handle);
  }

  const favorites = useMemo(
    () =>
      profile.favorites.filter(
        (f) => filter === "all" || filter === itemsById[f.itemId].mediaType
      ),
    [profile.favorites, filter, itemsById]
  );
  const nextToBinge = useMemo(
    () =>
      profile.nextToBinge.filter(
        (w) => filter === "all" || filter === itemsById[w.itemId].mediaType
      ),
    [profile.nextToBinge, filter, itemsById]
  );
  const comments = useMemo(
    () =>
      profile.comments.filter(
        (c) => filter === "all" || filter === itemsById[c.itemId].mediaType
      ),
    [profile.comments, filter, itemsById]
  );
  const lists = useMemo(
    () =>
      profile.lists
        .map((list) => ({
          ...list,
          itemIds: list.itemIds.filter(
            (id) => filter === "all" || filter === itemsById[id].mediaType
          ),
        }))
        .filter((list) => list.itemIds.length > 0),
    [profile.lists, filter, itemsById]
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <ProfileHeader profile={profile} />

      <div className="mt-8">
        <FilterTabs value={filter} onChange={setFilter} />
      </div>

      <div className="mt-8 flex gap-10">
        <OnThisPageNav />

        <div className="min-w-0 flex-1 space-y-12">
          {(favorites.length > 0 || isOwner) && (
            <section>
              <SectionHeader
                id="favorites"
                title="Favorites"
                meta={`Up to 6 · the things ${profile.displayName.split(" ")[0]} would show first`}
              />
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-6">
                {favorites.map((f) => (
                  <ItemCard
                    key={f.itemId}
                    item={itemsById[f.itemId]}
                    rating={f.rating}
                    imageUrl={coverUrls[f.itemId]}
                    onRemove={isOwner ? () => handleRemoveFavorite(f.itemId) : undefined}
                    removing={removingFavoriteId === f.itemId}
                  />
                ))}
                {isOwner && <AddCatalogTile onAdd={handleAddFavorite} />}
              </div>
            </section>
          )}

          {(nextToBinge.length > 0 || isOwner) && (
            <section>
              <SectionHeader id="next-to-binge" title="My Next to Binge" />
              <ScrollRow>
                {nextToBinge.map((w) => (
                  <ItemCard
                    key={w.itemId}
                    item={itemsById[w.itemId]}
                    note={w.note}
                    imageUrl={coverUrls[w.itemId]}
                    onRemove={isOwner ? () => handleRemoveWatchlistItem(w.itemId) : undefined}
                    removing={removingWatchlistId === w.itemId}
                  />
                ))}
                {isOwner && <AddCatalogTile onAdd={handleAddToWatchlist} />}
              </ScrollRow>
            </section>
          )}

          {comments.length > 0 && (
            <section>
              <SectionHeader
                id="comments"
                title="Comments"
                action={{ label: "See all comments", href: "#comments" }}
              />
              <div>
                {comments.map((comment) => (
                  <CommentRow
                    key={comment.id}
                    item={itemsById[comment.itemId]}
                    comment={comment}
                    imageUrl={coverUrls[comment.itemId]}
                  />
                ))}
              </div>
            </section>
          )}

          {lists.length > 0 && (
            <section id="lists" className="scroll-mt-24 space-y-10">
              <h2 className="text-[19px] font-semibold tracking-tight">Lists</h2>
              {lists.map((list) => (
                <div key={list.id}>
                  <SectionHeader title={list.title} meta={`${list.itemIds.length} titles`} />
                  <ScrollRow>
                    {list.itemIds.map((id) => (
                      <ItemCard key={id} item={itemsById[id]} imageUrl={coverUrls[id]} />
                    ))}
                  </ScrollRow>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

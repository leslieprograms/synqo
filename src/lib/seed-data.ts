import { Item, Profile } from "./types";

/**
 * A small hand-picked catalog, used until the real metadata pipeline
 * (TMDB + IGDB) is wired up behind an actual database. Every field
 * here is the same shape the real catalog will use, so swapping the
 * data source later shouldn't touch any component.
 */
export const items: Item[] = [
  { id: "parasite", title: "Parasite", year: 2019, mediaType: "film", genres: ["Thriller", "Drama", "Comedy"], colorSeed: "parasite" },
  { id: "oldboy", title: "Oldboy", year: 2003, mediaType: "film", genres: ["Thriller", "Mystery"], colorSeed: "oldboy" },
  { id: "memories-of-murder", title: "Memories of Murder", year: 2003, mediaType: "film", genres: ["Crime", "Drama"], colorSeed: "memories-of-murder" },
  { id: "burning", title: "Burning", year: 2018, mediaType: "film", genres: ["Mystery", "Drama"], colorSeed: "burning" },
  { id: "the-handmaiden", title: "The Handmaiden", year: 2016, mediaType: "film", genres: ["Thriller", "Romance"], colorSeed: "the-handmaiden" },
  { id: "perfect-days", title: "Perfect Days", year: 2023, mediaType: "film", genres: ["Drama"], colorSeed: "perfect-days" },
  { id: "no-country", title: "No Country for Old Men", year: 2007, mediaType: "film", genres: ["Crime", "Thriller"], colorSeed: "no-country" },
  { id: "anatomy-of-a-fall", title: "Anatomy of a Fall", year: 2023, mediaType: "film", genres: ["Drama", "Mystery"], colorSeed: "anatomy-of-a-fall" },
  { id: "portrait-lady-fire", title: "Portrait of a Lady on Fire", year: 2019, mediaType: "film", genres: ["Romance", "Drama"], colorSeed: "portrait-lady-fire" },
  { id: "worst-person", title: "The Worst Person in the World", year: 2021, mediaType: "film", genres: ["Comedy", "Drama"], colorSeed: "worst-person" },

  { id: "andor", title: "Andor", year: 2022, mediaType: "tv", genres: ["Sci-Fi", "Drama"], colorSeed: "andor" },
  { id: "severance", title: "Severance", year: 2022, mediaType: "tv", genres: ["Mystery", "Sci-Fi"], colorSeed: "severance" },
  { id: "succession", title: "Succession", year: 2018, mediaType: "tv", genres: ["Drama"], colorSeed: "succession" },
  { id: "the-bear", title: "The Bear", year: 2022, mediaType: "tv", genres: ["Drama", "Comedy"], colorSeed: "the-bear" },
  { id: "chernobyl", title: "Chernobyl", year: 2019, mediaType: "tv", genres: ["Drama", "History"], colorSeed: "chernobyl" },
  { id: "reservation-dogs", title: "Reservation Dogs", year: 2021, mediaType: "tv", genres: ["Comedy", "Drama"], colorSeed: "reservation-dogs" },
  { id: "shogun", title: "Shōgun", year: 2024, mediaType: "tv", genres: ["Drama", "History"], colorSeed: "shogun" },

  { id: "outer-wilds", title: "Outer Wilds", year: 2019, mediaType: "game", genres: ["Adventure", "Puzzle"], colorSeed: "outer-wilds" },
  { id: "disco-elysium", title: "Disco Elysium", year: 2019, mediaType: "game", genres: ["RPG"], colorSeed: "disco-elysium" },
  { id: "hades", title: "Hades", year: 2020, mediaType: "game", genres: ["Roguelike", "Action"], colorSeed: "hades" },
  { id: "obra-dinn", title: "Return of the Obra Dinn", year: 2018, mediaType: "game", genres: ["Mystery", "Puzzle"], colorSeed: "obra-dinn" },
  { id: "elden-ring", title: "Elden Ring", year: 2022, mediaType: "game", genres: ["Action RPG"], colorSeed: "elden-ring" },
  { id: "baldurs-gate-3", title: "Baldur's Gate 3", year: 2023, mediaType: "game", genres: ["RPG"], colorSeed: "baldurs-gate-3" },
  { id: "tunic", title: "Tunic", year: 2022, mediaType: "game", genres: ["Adventure", "Puzzle"], colorSeed: "tunic" },
];

export const itemsById: Record<string, Item> = Object.fromEntries(
  items.map((item) => [item.id, item])
);

export const profiles: Profile[] = [
  {
    handle: "keanu",
    displayName: "Keanu Aoki",
    bio: "Keeping a mental shelf of slow-burn thrillers, prestige TV, and cool games.",
    socialUrl: "x.com/keanuaoki",
    avatarSeed: "keanu-aoki",
    favorites: [
      { itemId: "parasite", rating: 5 },
      { itemId: "andor", rating: 5 },
      { itemId: "outer-wilds", rating: 5 },
      { itemId: "severance", rating: 5 },
      { itemId: "disco-elysium", rating: 5 },
      { itemId: "perfect-days", rating: 4 },
    ],
    nextToBinge: [
      { itemId: "shogun", note: "Everyone I trust won't stop bringing this up." },
      { itemId: "baldurs-gate-3" },
      { itemId: "anatomy-of-a-fall" },
      { itemId: "tunic" },
      { itemId: "the-bear" },
      { itemId: "chernobyl" },
    ],
    comments: [
      {
        id: "c-andor",
        itemId: "andor",
        rating: 5,
        postedAt: "1mo",
        text: "Makes up for every disappointing modern Star Wars project. I think it's the best Star Wars story ever, including the original trilogy. The second season's final stretch is some of the best TV I've watched.",
      },
      {
        id: "c-severance",
        itemId: "severance",
        rating: 5,
        postedAt: "2mo",
        text: "The kind of premise that could only work as a slow burn. Every department, from the score to the production design, is pulling in the same direction.",
      },
      {
        id: "c-outer-wilds",
        itemId: "outer-wilds",
        rating: 5,
        postedAt: "3mo",
        text: "The rare game I'd ask people to go in completely blind for. The structure is the twist, and figuring it out yourself is the entire point.",
      },
      {
        id: "c-perfect-days",
        itemId: "perfect-days",
        rating: 4,
        postedAt: "4mo",
        text: "A whole philosophy of contentment told through a Tokyo toilet cleaner's routine. Quiet in a way most films are afraid to be.",
      },
    ],
    lists: [
      {
        id: "slow-burn-thrillers",
        title: "Slow-burn thrillers that reward patience",
        itemIds: [
          "parasite",
          "oldboy",
          "memories-of-murder",
          "burning",
          "the-handmaiden",
          "no-country",
        ],
      },
      {
        id: "games-that-respect-you",
        title: "Games that respect your intelligence",
        itemIds: [
          "outer-wilds",
          "disco-elysium",
          "obra-dinn",
          "tunic",
          "hades",
          "elden-ring",
        ],
      },
    ],
  },
];

export function getProfile(handle: string): Profile | undefined {
  return profiles.find((profile) => profile.handle === handle);
}

/** Every item referenced anywhere on a profile page, for resolving cover art up front. */
export function getProfileItems(profile: Profile): Item[] {
  const ids = [
    ...profile.favorites.map((f) => f.itemId),
    ...profile.nextToBinge.map((w) => w.itemId),
    ...profile.comments.map((c) => c.itemId),
    ...profile.lists.flatMap((list) => list.itemIds),
  ];
  return ids.map((id) => itemsById[id]);
}

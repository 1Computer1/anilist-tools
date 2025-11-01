import {
  MEDIA_LIST_STATUSES,
  type Entry,
  type FuzzyDate,
  type List,
  type MediaListStatus,
  type MediaType,
} from "../api/queries/list";
import { type ScoreFormat, type TitleLanguage } from "../api/queries/viewer";

export type SortBy =
  | "title"
  | "score"
  | "progress"
  | "lastUpdated"
  | "lastAdded"
  | "startDate"
  | "completedDate"
  | "releaseDate"
  | "averageScore"
  | "popularity"
  | "random";

export const SORT_BYS: SortBy[] = [
  "title",
  "score",
  "progress",
  "lastUpdated",
  "lastAdded",
  "startDate",
  "completedDate",
  "releaseDate",
  "averageScore",
  "popularity",
  "random",
];

export type SortDir = "asc" | "desc";

export const SORT_DIRS: SortDir[] = ["asc", "desc"];

export function nameOfListType(s: MediaType) {
  return { ANIME: "Anime", MANGA: "Manga" }[s];
}

export function nameOfScoreFormat(s: ScoreFormat) {
  return {
    POINT_100: "100 Point",
    POINT_10_DECIMAL: "10 Point Decimal",
    POINT_10: "10 Point",
    POINT_5: "5 Star",
    POINT_3: "3 Point Smiley",
  }[s];
}

export function nameOfTitleLanguage(s: TitleLanguage) {
  return {
    ENGLISH: "English",
    NATIVE: "Native",
    ROMAJI: "Romaji",
  }[s];
}

export function nameOfSortBy(s: SortBy) {
  return {
    title: "Title",
    score: "Score",
    progress: "Progress",
    lastUpdated: "Last Updated",
    lastAdded: "Last Added",
    averageScore: "Average Score",
    popularity: "Popularity",
    releaseDate: "Release Date",
    startDate: "Start Date",
    completedDate: "Completed Date",
    random: "Random",
  }[s];
}

export function nameOfSortDir(s: SortDir) {
  return {
    asc: "Ascending",
    desc: "Descending",
  }[s];
}

export function nameOfStatus(m: MediaType, s: MediaListStatus) {
  return {
    COMPLETED: "Completed",
    CURRENT: { ANIME: "Watching", MANGA: "Reading" }[m],
    DROPPED: "Dropped",
    PAUSED: "Paused",
    PLANNING: "Planning",
    REPEATING: { ANIME: "Rewatching", MANGA: "Rereading" }[m],
  }[s];
}

export function prepareListForDisplay(
  data: List,
  filter: (e: Entry) => boolean,
  sortBy: SortBy,
  sortDir: SortDir,
  titleLanguage: TitleLanguage,
  seed: number,
): [Entry[], number[]] {
  let sorted;
  if (sortBy === "random") {
    sorted = [...data.values()].filter(filter);
    shuffle(sorted, seed);
    sorted.sort(
      (a, b) =>
        MEDIA_LIST_STATUSES.indexOf(a.status) -
        MEDIA_LIST_STATUSES.indexOf(b.status),
    );
  } else {
    const comparator = COMPARATORS[sortBy];
    sorted = [...data.values()].filter(filter);
    sorted.sort((a, b) => {
      const x =
        MEDIA_LIST_STATUSES.indexOf(a.status) -
        MEDIA_LIST_STATUSES.indexOf(b.status);
      return (
        x ||
        (sortDir === "desc"
          ? comparator(a, b, titleLanguage)
          : comparator(b, a, titleLanguage))
      );
    });
  }
  const is = [];
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].status !== sorted[i - 1]?.status) {
      is.push(i);
    }
  }
  return [sorted, is];
}

export const COMPARATORS: Record<
  Exclude<SortBy, "random">,
  (a: Entry, b: Entry, titleLanguage: TitleLanguage) => number
> = {
  title: (a, b, titleLanguage) =>
    getTitle(b, titleLanguage).localeCompare(getTitle(a, titleLanguage)),
  score: (a, b) => b.score - a.score,
  progress: (a, b) => (b.progress ?? 0) - (a.progress ?? 0),
  lastUpdated: (a, b) => b.updatedAt - a.updatedAt,
  lastAdded: (a, b) => b.createdAt - a.createdAt,
  averageScore: (a, b) => b.media.averageScore - a.media.averageScore,
  popularity: (a, b) => b.media.popularity - a.media.popularity,
  releaseDate: (a, b) => compareDate(b.media.startDate, a.media.startDate),
  startDate: (a, b) => compareDate(b.startedAt, a.startedAt),
  completedDate: (a, b) => compareDate(b.completedAt, a.completedAt),
};

export function compareDate(a: FuzzyDate, b: FuzzyDate) {
  return (
    (a.year ?? 0) - (b.year ?? 0) ||
    (a.month ?? 0) - (b.month ?? 0) ||
    (a.day ?? 0) - (b.day ?? 0)
  );
}

export function getTitle(entry: Entry, titleLanguage: TitleLanguage) {
  return {
    ENGLISH:
      entry.media.title.english ??
      entry.media.title.romaji ??
      entry.media.title.native,
    ROMAJI: entry.media.title.romaji ?? entry.media.title.native,
    NATIVE: entry.media.title.native,
  }[titleLanguage];
}

export function seedgen() {
  return (Math.random() * 2 ** 32) >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(array: T[], seed: number) {
  const rand = mulberry32(seed);
  let i = array.length;
  while (i != 0) {
    let r = Math.floor(rand() * i);
    i--;
    [array[i], array[r]] = [array[r], array[i]];
  }
}

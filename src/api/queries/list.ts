import { query } from "../anilist";
import type { ScoreFormat } from "./viewer";

export type MediaListStatus =
  | "CURRENT"
  | "PLANNING"
  | "COMPLETED"
  | "DROPPED"
  | "PAUSED"
  | "REPEATING";

export const MEDIA_LIST_STATUSES: MediaListStatus[] = [
  "CURRENT",
  "REPEATING",
  "COMPLETED",
  "PAUSED",
  "DROPPED",
  "PLANNING",
];

export type MediaFormat =
  | "TV"
  | "TV_SHORT"
  | "MOVIE"
  | "SPECIAL"
  | "OVA"
  | "ONA"
  | "MUSIC"
  | "MANGA"
  | "NOVEL"
  | "ONE_SHOT";

export type MediaStatus =
  | "FINISHED"
  | "RELEASING"
  | "NOT_YET_RELEASED"
  | "CANCELLED"
  | "HIATUS";

export type List = Map<number, Entry>;

export type Entry = {
  id: number;
  score: number;
  status: MediaListStatus;
  startedAt: FuzzyDate;
  completedAt: FuzzyDate;
  createdAt: number;
  updatedAt: number;
  progress: number | null;
  progressVolumes: number | null;
  notes: string | null;
  repeat: number;
  media: {
    title: { english?: string; native: string; romaji?: string };
    coverImage: { medium: string };
    description: string;
    siteUrl: string;
    meanScore: number;
    averageScore: number;
    format: MediaFormat;
    popularity: number;
    status: MediaStatus;
    startDate: FuzzyDate;
    endDate: FuzzyDate;
    chapters: number | null;
    episodes: number | null;
    volumes: number | null;
  };
};

export type FuzzyDate = {
  day: number | null;
  month: number | null;
  year: number | null;
};

const QUERY = `query ($id: Int, $type: MediaType, $forceSingleCompletedList: Boolean, $statusIn: [MediaListStatus], $format: ScoreFormat, $sort: [MediaListSort]) {
  MediaListCollection (userId: $id, type: $type, forceSingleCompletedList: $forceSingleCompletedList, status_in: $statusIn, sort: $sort) {
    lists {
      entries {
        media {
          title {
            english(stylised: false)
            native(stylised: false)
            romaji(stylised: false)
          }
          coverImage {
            medium
          }
          description(asHtml: true)
          siteUrl
          meanScore
          averageScore
          format
          popularity
          status(version: 2)
          startDate {
            day
            month
            year
          }
          endDate {
            day
            month
            year
          }
          chapters
          episodes
        }
        id
        score(format: $format)
        status
        startedAt {
          day
          month
          year
        }
        completedAt {
          day
          month
          year
        }
        createdAt
        updatedAt
        progress
        notes
        repeat
      }
      name
    }
  }
}`;

export type MediaType = "ANIME" | "MANGA";

export const MEDIA_TYPES: MediaType[] = ["ANIME", "MANGA"];

export type MediaListSort =
  | "MEDIA_ID"
  | "MEDIA_ID_DESC"
  | "SCORE"
  | "SCORE_DESC"
  | "STATUS"
  | "STATUS_DESC"
  | "PROGRESS"
  | "PROGRESS_DESC"
  | "PROGRESS_VOLUMES"
  | "PROGRESS_VOLUMES_DESC"
  | "REPEAT"
  | "REPEAT_DESC"
  | "PRIORITY"
  | "PRIORITY_DESC"
  | "STARTED_ON"
  | "STARTED_ON_DESC"
  | "FINISHED_ON"
  | "FINISHED_ON_DESC"
  | "ADDED_TIME"
  | "ADDED_TIME_DESC"
  | "UPDATED_TIME"
  | "UPDATED_TIME_DESC"
  | "MEDIA_TITLE_ROMAJI"
  | "MEDIA_TITLE_ROMAJI_DESC"
  | "MEDIA_TITLE_ENGLISH"
  | "MEDIA_TITLE_ENGLISH_DESC"
  | "MEDIA_TITLE_NATIVE"
  | "MEDIA_TITLE_NATIVE_DESC"
  | "MEDIA_POPULARITY"
  | "MEDIA_POPULARITY_DESC";

export const getList = query<
  List,
  {
    id: number;
    type: MediaType;
    forceSingleCompletedList: true;
    statusIn: MediaListStatus[];
    format: ScoreFormat;
    sort: [MediaListSort];
  }
>(QUERY, (x) => {
  const seen = new Set();
  const entries: List = new Map();
  for (const list of x.MediaListCollection.lists) {
    for (const entry of list.entries) {
      if (!seen.has(entry.id)) {
        seen.add(entry.id);
        entries.set(entry.id, entry);
      }
    }
  }
  return entries;
});

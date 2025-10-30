import { Field, Label } from "@headlessui/react";
import type { UseQueryResult } from "@tanstack/react-query";
import clsx from "clsx";
import { PiCheckFatFill } from "react-icons/pi";
import type { AnilistError } from "../../api/anilist";
import type {
  Entry,
  List,
  MediaListStatus,
  MediaType,
} from "../../api/queries/list";
import type { Viewer } from "../../api/queries/viewer";
import { CustomListbox } from "../../components/CustomListbox";
import type { ListDraftAction } from "../scorer";
import { useState } from "react";

export type SortBy =
  | "score"
  | "progress"
  | "lastUpdated"
  | "lastAdded"
  | "startDate"
  | "completedDate"
  | "releaseDate"
  | "averageScore"
  | "popularity";

export type SortDir = "asc" | "desc";

export const MEDIA_LIST_STATUSES: MediaListStatus[] = [
  "CURRENT",
  "REPEATING",
  "COMPLETED",
  "PAUSED",
  "DROPPED",
  "PLANNING",
];

export type Settings = {
  listType: ReactState<MediaType>;
  sortBy: ReactState<SortBy>;
  sortDir: ReactState<SortDir>;
  allowedStatuses: ReactState<MediaListStatus[]>;
};

type ReactState<T> = {
  value: T;
  set: React.Dispatch<React.SetStateAction<T>>;
};

export function useSettings(): Settings {
  return {
    listType: useState_("ANIME"),
    allowedStatuses: useState_(["COMPLETED"]),
    sortBy: useState_("score"),
    sortDir: useState_("desc"),
  } as Settings;
}

function useState_<T>(intial: T): ReactState<T> {
  const [value, set] = useState(intial);
  return { value, set };
}

export function SettingsItems({
  dispatch,
  settings,
  viewer,
}: {
  dispatch: React.Dispatch<ListDraftAction>;
  settings: Settings;
  viewer: {
    data: Viewer | undefined;
    query: UseQueryResult<Viewer, AnilistError>;
  };
}) {
  return (
    <>
      <SettingsItem label="List">
        <CustomListbox
          className="select w-full"
          disabled={viewer.data == null}
          value={settings.listType.value}
          onChange={(v) => {
            dispatch({ t: "reset" });
            settings.listType.set(v);
          }}
          options={["ANIME", "MANGA"]}
          ButtonContents={() => nameOfListType(settings.listType.value)}
          OptionContents={({ value }) => nameOfListType(value)}
        />
      </SettingsItem>
      <SettingsItem label="Status">
        <CustomListbox<MediaListStatus>
          className="select w-full"
          disabled={viewer.data == null}
          multiple
          value={settings.allowedStatuses.value}
          options={MEDIA_LIST_STATUSES}
          onChange={(v) => {
            if (v.length > 0) {
              settings.allowedStatuses.set(v);
            }
          }}
          ButtonContents={() => (
            <span className="inline-block truncate">
              {[...settings.allowedStatuses.value]
                .sort(
                  (a, b) =>
                    MEDIA_LIST_STATUSES.indexOf(a) -
                    MEDIA_LIST_STATUSES.indexOf(b),
                )
                .map((x) => nameOfStatus(settings.listType.value, x))
                .join(", ")}
            </span>
          )}
          OptionContents={({ value }) => (
            <div className="inline-flex flex-row items-center gap-x-2">
              <div
                className={clsx(
                  !settings.allowedStatuses.value.includes(value) &&
                    "invisible",
                )}
              >
                <PiCheckFatFill />
              </div>
              <span>{nameOfStatus(settings.listType.value, value)}</span>
            </div>
          )}
        />
      </SettingsItem>
      <SettingsItem label="Sort By">
        <CustomListbox
          className="select w-full"
          disabled={viewer.data == null}
          value={settings.sortBy.value}
          options={Object.keys(comparators) as SortBy[]}
          onChange={(v) => settings.sortBy.set(v)}
          ButtonContents={() => nameOfSortBy(settings.sortBy.value)}
          OptionContents={({ value }) => nameOfSortBy(value)}
        />
      </SettingsItem>
      <SettingsItem label="Sort Direction">
        <CustomListbox
          className="select w-full"
          disabled={viewer.data == null}
          value={settings.sortDir.value}
          options={["asc", "desc"]}
          onChange={(v) => settings.sortDir.set(v)}
          ButtonContents={() => nameOfSortDir(settings.sortDir.value)}
          OptionContents={({ value }) => nameOfSortDir(value)}
        />
      </SettingsItem>
    </>
  );
}

function SettingsItem({
  label,
  children,
}: {
  label: React.JSX.Element | string;
  children: React.JSX.Element;
}) {
  return (
    <Field className="flex w-full flex-col gap-y-2">
      <Label>{label}</Label>
      {children}
    </Field>
  );
}

export function nameOfListType(s: MediaType) {
  return { ANIME: "Anime", MANGA: "Manga" }[s];
}

export function nameOfSortBy(s: SortBy) {
  return {
    score: "Score",
    progress: "Progress",
    lastUpdated: "Last Updated",
    lastAdded: "Last Added",
    averageScore: "Average Score",
    popularity: "Popularity",
    releaseDate: "Release Date",
    startDate: "Start Date",
    completedDate: "Completed Date",
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
  settings: Settings,
): [Entry[], number[]] {
  const comparator =
    settings.sortDir.value === "desc"
      ? comparators[settings.sortBy.value]
      : (a: Entry, b: Entry) => comparators[settings.sortBy.value](b, a);
  const xs = [...data.values()]
    .filter((x) => settings.allowedStatuses.value.includes(x.status))
    .sort((a, b) => {
      const x =
        MEDIA_LIST_STATUSES.indexOf(a.status) -
        MEDIA_LIST_STATUSES.indexOf(b.status);
      return x || comparator(a, b);
    });
  const is = [];
  for (let i = 0; i < xs.length; i++) {
    if (xs[i].status !== xs[i - 1]?.status) {
      is.push(i);
    }
  }
  return [xs, is];
}

const comparators: Record<SortBy, (a: Entry, b: Entry) => number> = {
  score: (a, b) => b.score - a.score,
  progress: (a, b) => (b.progress ?? 0) - (a.progress ?? 0),
  lastUpdated: (a, b) => b.updatedAt - a.updatedAt,
  lastAdded: (a, b) => b.createdAt - a.createdAt,
  averageScore: (a, b) => b.media.averageScore - a.media.averageScore,
  popularity: (a, b) => b.media.popularity - a.media.popularity,
  releaseDate: (a, b) =>
    (b.media.startDate.year ?? 0) - (a.media.startDate.year ?? 0) ||
    (b.media.startDate.month ?? 0) - (a.media.startDate.month ?? 0) ||
    (b.media.startDate.day ?? 0) - (a.media.startDate.day ?? 0),
  startDate: (a, b) =>
    (b.startedAt.year ?? 0) - (a.startedAt.year ?? 0) ||
    (b.startedAt.month ?? 0) - (a.startedAt.month ?? 0) ||
    (b.startedAt.day ?? 0) - (a.startedAt.day ?? 0),
  completedDate: (a, b) =>
    (b.completedAt.year ?? 0) - (a.completedAt.year ?? 0) ||
    (b.completedAt.month ?? 0) - (a.completedAt.month ?? 0) ||
    (b.completedAt.day ?? 0) - (a.completedAt.day ?? 0),
};

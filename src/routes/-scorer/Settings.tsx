import { Button, Field, Label, Switch } from "@headlessui/react";
import type { UseQueryResult } from "@tanstack/react-query";
import clsx from "clsx";
import { PiCheckFatFill, PiShuffleFill } from "react-icons/pi";
import type { AnilistError } from "../../api/anilist";
import {
  MEDIA_LIST_STATUSES,
  MEDIA_TYPES,
  type Entry,
  type List,
  type MediaListStatus,
  type MediaType,
} from "../../api/queries/list";
import {
  SCORE_FORMATS,
  TITLE_LANGUAGES,
  type ScoreFormat,
  type TitleLanguage,
  type Viewer,
} from "../../api/queries/viewer";
import { CustomListbox } from "../../components/CustomListbox";
import type { ConfirmDialogContext, ListDraftAction } from "../scorer";
import { useState } from "react";
import type { DialogState } from "../../hooks/useDialog";

export type SortBy =
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

export type Settings = {
  listType: ReactState<MediaType>;
  sortBy: ReactState<SortBy>;
  // For forcing a settings reupdate when pressing shuffle
  random: ReactState<boolean>;
  sortDir: ReactState<SortDir>;
  allowedStatuses: ReactState<MediaListStatus[]>;
  titleLanguage: ReactState<TitleLanguage>;
  scoreFormat: ReactState<ScoreFormat>;
  hideScore: ReactState<boolean>;
};

export type ReactState<T> = {
  value: T;
  set: React.Dispatch<React.SetStateAction<T>>;
};

export function useSettings(): Settings {
  return {
    listType: useState_<MediaType>("ANIME"),
    allowedStatuses: useState_<MediaListStatus[]>(["COMPLETED"]),
    sortBy: useState_<SortBy>("score"),
    random: useState_<boolean>(false),
    sortDir: useState_<SortDir>("desc"),
    titleLanguage: useState_<TitleLanguage>("ENGLISH"),
    scoreFormat: useState_<ScoreFormat>("POINT_100"),
    hideScore: useState_<boolean>(false),
  };
}

function useState_<T>(intial: T): ReactState<T> {
  const [value, set] = useState(intial);
  return { value, set };
}

export function SettingsItems({
  dispatch,
  settings,
  viewer,
  numUnsavedChanges,
  confirmDialog,
}: {
  dispatch: React.Dispatch<ListDraftAction>;
  settings: Settings;
  viewer: {
    data: Viewer | undefined;
    query: UseQueryResult<Viewer, AnilistError>;
  };
  numUnsavedChanges: number | null;
  confirmDialog: DialogState<ConfirmDialogContext>;
}) {
  return (
    <>
      <SettingsItem label="List">
        <CustomListbox
          className="select w-full"
          disabled={viewer.data == null}
          value={settings.listType.value}
          onChange={(v) => {
            if (settings.listType.value === v) {
              return;
            }
            const change = async () => {
              settings.listType.set(v);
              dispatch({ t: "reset" });
            };
            if (numUnsavedChanges != null && numUnsavedChanges > 0) {
              confirmDialog.openWith({
                title: "Change List",
                action: "Confirm",
                message: "Are you sure you want to change your list?",
                onConfirm: change,
              });
            } else {
              change();
            }
          }}
          options={MEDIA_TYPES}
          ButtonContents={() => nameOfListType(settings.listType.value)}
          OptionContents={({ value }) => nameOfListType(value)}
        />
      </SettingsItem>
      <SettingsItem label="Score Format">
        <CustomListbox
          className="select w-full"
          disabled={viewer.data == null}
          value={settings.scoreFormat.value}
          onChange={(v) => {
            if (settings.scoreFormat.value === v) {
              return;
            }
            settings.scoreFormat.set(v);
            dispatch({ t: "updateScoreDisplays" });
          }}
          options={SCORE_FORMATS}
          ButtonContents={() => nameOfScoreFormat(settings.scoreFormat.value)}
          OptionContents={({ value }) => nameOfScoreFormat(value)}
        />
      </SettingsItem>
      <Field className="flex w-full flex-row items-center gap-x-2 text-sm">
        <Switch
          className="toggle toggle-primary duration-300"
          checked={settings.hideScore.value}
          onChange={settings.hideScore.set}
        />
        <Label>Hide Old Scores</Label>
      </Field>
      <SettingsItem label="Title Language">
        <CustomListbox
          className="select w-full"
          disabled={viewer.data == null}
          value={settings.titleLanguage.value}
          onChange={(v) => settings.titleLanguage.set(v)}
          options={TITLE_LANGUAGES}
          ButtonContents={() =>
            nameOfTitleLanguage(settings.titleLanguage.value)
          }
          OptionContents={({ value }) => nameOfTitleLanguage(value)}
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
          options={SORT_BYS}
          onChange={(v) => {
            settings.sortBy.set(v);
            settings.random.set(!settings.random.value);
          }}
          ButtonContents={() => nameOfSortBy(settings.sortBy.value)}
          OptionContents={({ value }) => nameOfSortBy(value)}
        />
      </SettingsItem>
      {settings.sortBy.value.startsWith("random") ? (
        <Button
          className="btn btn-outline btn-secondary"
          onClick={() => {
            settings.random.set(!settings.random.value);
          }}
        >
          <PiShuffleFill /> Reshuffle
        </Button>
      ) : (
        <SettingsItem label="Sort Direction">
          <CustomListbox
            className="select w-full"
            disabled={viewer.data == null}
            value={settings.sortDir.value}
            options={SORT_DIRS}
            onChange={(v) => settings.sortDir.set(v)}
            ButtonContents={() => nameOfSortDir(settings.sortDir.value)}
            OptionContents={({ value }) => nameOfSortDir(value)}
          />
        </SettingsItem>
      )}
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
    <Field className="flex w-full flex-col gap-y-2 text-sm md:text-base">
      <Label>{label}</Label>
      {children}
    </Field>
  );
}

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
  settings: Settings,
): [Entry[], number[]] {
  const sortBy = settings.sortBy.value;
  let sorted;
  if (sortBy === "random") {
    sorted = [...data.values()].filter((x) =>
      settings.allowedStatuses.value.includes(x.status),
    );
    shuffle(sorted);
    sorted.sort(
      (a, b) =>
        MEDIA_LIST_STATUSES.indexOf(a.status) -
        MEDIA_LIST_STATUSES.indexOf(b.status),
    );
  } else {
    const comparator =
      settings.sortDir.value === "desc"
        ? comparators[sortBy]
        : (a: Entry, b: Entry) => comparators[sortBy](b, a);
    sorted = [...data.values()]
      .filter((x) => settings.allowedStatuses.value.includes(x.status))
      .sort((a, b) => {
        const x =
          MEDIA_LIST_STATUSES.indexOf(a.status) -
          MEDIA_LIST_STATUSES.indexOf(b.status);
        return x || comparator(a, b);
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

const comparators: Record<
  Exclude<SortBy, "random">,
  (a: Entry, b: Entry) => number
> = {
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

function shuffle<T>(array: T[]) {
  let i = array.length;
  while (i != 0) {
    let r = Math.floor(Math.random() * i);
    i--;
    [array[i], array[r]] = [array[r], array[i]];
  }
}

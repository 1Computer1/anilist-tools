import { Button, Field, Label, Switch } from "@headlessui/react";
import type { UseQueryResult } from "@tanstack/react-query";
import clsx from "clsx";
import { PiCheckFatFill, PiShuffleFill } from "react-icons/pi";
import type { AnilistError } from "../../api/anilist";
import {
  MEDIA_LIST_STATUSES,
  MEDIA_TYPES,
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
import type { ScorerListDraftAction } from "../scorer";
import type { DialogState } from "../../hooks/useDialog";
import type { ConfirmDialogContext } from "../../components/list/LeftRightListInterface";
import {
  nameOfListType,
  nameOfScoreFormat,
  nameOfSortBy,
  nameOfSortDir,
  nameOfStatus,
  nameOfTitleLanguage,
  SORT_BYS,
  SORT_DIRS,
  type SortBy,
  type SortDir,
} from "../../util/settings";
import { useStateW, type ReactState } from "../../hooks/useStateW";
import SettingsItem from "../../components/list/SettingsItem";

export type ScorerSettings = {
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

export function useScorerSettings(): ScorerSettings {
  return {
    listType: useStateW<MediaType>("ANIME"),
    allowedStatuses: useStateW<MediaListStatus[]>(["COMPLETED"]),
    sortBy: useStateW<SortBy>("score"),
    random: useStateW<boolean>(false),
    sortDir: useStateW<SortDir>("desc"),
    titleLanguage: useStateW<TitleLanguage>("ENGLISH"),
    scoreFormat: useStateW<ScoreFormat>("POINT_100"),
    hideScore: useStateW<boolean>(false),
  };
}

export function ScorerSettingsItems({
  dispatch,
  settings,
  viewer,
  numUnsavedChanges,
  confirmDialog,
}: {
  dispatch: React.Dispatch<ScorerListDraftAction>;
  settings: ScorerSettings;
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
                severity: "BAD",
                message: "Are you sure you want to change your list?",
                onConfirm: change,
              });
            } else {
              change();
            }
          }}
          options={MEDIA_TYPES}
          buttonContents={nameOfListType(settings.listType.value)}
          optionContents={(value) => nameOfListType(value)}
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
          buttonContents={nameOfScoreFormat(settings.scoreFormat.value)}
          optionContents={(value) => nameOfScoreFormat(value)}
        />
      </SettingsItem>
      <Field className="flex w-full flex-row items-center gap-x-2 text-sm">
        <Switch
          className="toggle toggle-primary duration-300 motion-reduce:transition-none"
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
          buttonContents={nameOfTitleLanguage(settings.titleLanguage.value)}
          optionContents={(value) => nameOfTitleLanguage(value)}
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
          buttonContents={
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
          }
          optionContents={(value) => (
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
          buttonContents={nameOfSortBy(settings.sortBy.value)}
          optionContents={(value) => nameOfSortBy(value)}
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
            buttonContents={nameOfSortDir(settings.sortDir.value)}
            optionContents={(value) => nameOfSortDir(value)}
          />
        </SettingsItem>
      )}
    </>
  );
}

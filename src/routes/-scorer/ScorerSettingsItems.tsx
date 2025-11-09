import { Field, Label, Switch } from "@headlessui/react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { AnilistError } from "../../api/anilist";
import {
  MEDIA_LIST_STATUSES,
  type MediaListStatus,
  type MediaType,
} from "../../api/queries/list";
import {
  SCORE_FORMATS,
  type ScoreFormat,
  type TitleLanguage,
  type Viewer,
} from "../../api/queries/viewer";
import CustomListbox from "../../components/CustomListbox";
import type { ScorerListDraftAction } from "../scorer";
import type { DialogState } from "../../hooks/useDialog";
import type { ConfirmDialogContext } from "../../components/dialogs/ConfirmDialog";
import {
  nameOfScoreFormat,
  seedgen,
  SORT_BYS,
  type SortBy,
  type SortDir,
} from "../../util/settings";
import useCell, { type Cell } from "../../hooks/useCell";
import SettingsItem from "../../components/list/settings/SettingsItem";
import SettingsItemStatuses from "../../components/list/settings/SettingsItemStatuses";
import SettingsItemTitleLanguage from "../../components/list/settings/SettingsItemTitleLanguage";
import SettingsItemTitleFilter from "../../components/list/settings/SettingsItemTitleFilter";
import SettingsItemList from "../../components/list/settings/SettingsItemList";
import SettingsItemSortBy from "../../components/list/settings/SettingsItemsSortBy";
import SettingsItemSortDir from "../../components/list/settings/SettingsItemsSortDir";

export type ScorerSettings = {
  listType: Cell<MediaType>;
  sortBy: Cell<SortBy>;
  randomSeed: Cell<number>;
  sortDir: Cell<SortDir>;
  allowedStatuses: Cell<MediaListStatus[]>;
  titleFilter: Cell<string>;
  titleLanguage: Cell<TitleLanguage>;
  scoreFormat: Cell<ScoreFormat>;
  hideScore: Cell<boolean>;
};

export function useScorerSettings(): ScorerSettings {
  return {
    listType: useCell<MediaType>("ANIME"),
    allowedStatuses: useCell<MediaListStatus[]>(["COMPLETED"]),
    sortBy: useCell<SortBy>("score"),
    randomSeed: useCell<number>(seedgen()),
    sortDir: useCell<SortDir>("desc"),
    titleFilter: useCell<string>(""),
    titleLanguage: useCell<TitleLanguage>("ENGLISH"),
    scoreFormat: useCell<ScoreFormat>("POINT_100"),
    hideScore: useCell<boolean>(false),
  };
}

export default function ScorerSettingsItems({
  dispatch,
  settings,
  viewer,
  hasUnsavedChanges,
  confirmDialog,
}: {
  dispatch: React.Dispatch<ScorerListDraftAction>;
  settings: ScorerSettings;
  viewer: {
    data: Viewer | undefined;
    query: UseQueryResult<Viewer, AnilistError>;
  };
  hasUnsavedChanges: boolean;
  confirmDialog: DialogState<ConfirmDialogContext>;
}) {
  return (
    <>
      <SettingsItemList
        viewer={viewer}
        listType={settings.listType}
        hasUnsavedChanges={hasUnsavedChanges}
        confirmDialog={confirmDialog}
        onChange={() => dispatch({ t: "reset" })}
      />
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
          disabled={viewer.data == null}
          checked={settings.hideScore.value}
          onChange={settings.hideScore.set}
        />
        <Label>Hide Old Scores</Label>
      </Field>
      <SettingsItemTitleFilter
        viewer={viewer}
        titleFilter={settings.titleFilter}
      />
      <SettingsItemTitleLanguage
        viewer={viewer}
        titleLanguage={settings.titleLanguage}
      />
      <SettingsItemStatuses
        viewer={viewer}
        listType={settings.listType.value}
        options={MEDIA_LIST_STATUSES}
        statuses={settings.allowedStatuses}
      />
      <SettingsItemSortBy
        viewer={viewer}
        sortBy={settings.sortBy}
        options={SORT_BYS}
      />
      <SettingsItemSortDir
        viewer={viewer}
        sortBy={settings.sortBy.value}
        sortDir={settings.sortDir}
        randomSeed={settings.randomSeed}
      />
    </>
  );
}

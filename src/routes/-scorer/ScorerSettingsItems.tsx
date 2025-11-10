import { Field, Label, Switch } from "@headlessui/react";
import { MEDIA_LIST_STATUSES } from "../../api/queries/list";
import { SCORE_FORMATS, type Viewer } from "../../api/queries/viewer";
import CustomListbox from "../../components/CustomListbox";
import type { ScorerListDraftAction } from "../scorer";
import type { DialogState } from "../../hooks/useDialog";
import type { ConfirmDialogContext } from "../../components/dialogs/ConfirmDialog";
import { nameOfScoreFormat, SORT_BYS } from "../../util/settings";
import SettingsItem from "../../components/list/settings/SettingsItem";
import SettingsItemStatuses from "../../components/list/settings/SettingsItemStatuses";
import SettingsItemTitleLanguage from "../../components/list/settings/SettingsItemTitleLanguage";
import SettingsItemFilter from "../../components/list/settings/SettingsItemFilter";
import SettingsItemList from "../../components/list/settings/SettingsItemList";
import SettingsItemSortBy from "../../components/list/settings/SettingsItemsSortBy";
import SettingsItemSortDir from "../../components/list/settings/SettingsItemsSortDir";
import type { ScorerSettings } from "./scorerSettings";
import type { UseAnilistQueryResult } from "../../hooks/anilist";

export default function ScorerSettingsItems({
  dispatch,
  settings,
  viewer,
  hasUnsavedChanges,
  confirmDialog,
}: {
  dispatch: React.Dispatch<ScorerListDraftAction>;
  settings: ScorerSettings;
  viewer: UseAnilistQueryResult<Viewer>;
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
      <div className="divider mb-3"></div>
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
      <div className="divider mb-3"></div>
      <SettingsItemFilter viewer={viewer} filter={settings.filter} />
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

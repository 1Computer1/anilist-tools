import { type Viewer } from "../../api/queries/viewer";
import type { DropperListDraftAction } from "../dropper";
import type { DialogState } from "../../hooks/useDialog";
import type { ConfirmDialogContext } from "../../components/dialogs/ConfirmDialog";
import useCell from "../../hooks/useCell";
import SettingsItemDate from "../../components/list/settings/SettingsItemDate";
import SettingsItemStatuses from "../../components/list/settings/SettingsItemStatuses";
import SettingsItemTitleLanguage from "../../components/list/settings/SettingsItemTitleLanguage";
import SettingsItemTitleFilter from "../../components/list/settings/SettingsItemTitleFilter";
import SettingsItemList from "../../components/list/settings/SettingsItemList";
import { DateTime } from "luxon";
import { Button } from "@headlessui/react";
import { PiTrashFill } from "react-icons/pi";
import SettingsItemSortBy from "../../components/list/settings/SettingsItemsSortBy";
import SettingsItemSortDir from "../../components/list/settings/SettingsItemsSortDir";
import { SORT_BYS } from "../../util/settings";
import type { DropperSettings } from "./dropperSettings";
import type { UseAnilistQueryResult } from "../../hooks/anilist";

type DroppableMediaListStatus = "CURRENT" | "PAUSED";

const DROPPABLE_MEDIA_LIST_STATUS: DroppableMediaListStatus[] = [
  "CURRENT",
  "PAUSED",
];

export default function DropperSettingsItems({
  dispatch,
  settings,
  viewer,
  hasUnsavedChanges,
  confirmDialog,
}: {
  dispatch: React.Dispatch<DropperListDraftAction>;
  settings: DropperSettings;
  viewer: UseAnilistQueryResult<Viewer>;
  hasUnsavedChanges: boolean;
  confirmDialog: DialogState<ConfirmDialogContext>;
}) {
  const olderThan = useCell<DateTime>(DateTime.now().endOf("day"));
  const dropStatuses = useCell<DroppableMediaListStatus[]>([
    "CURRENT",
    "PAUSED",
  ]);

  return (
    <>
      <SettingsItemList
        viewer={viewer}
        listType={settings.listType}
        hasUnsavedChanges={hasUnsavedChanges}
        confirmDialog={confirmDialog}
        onChange={() => dispatch({ t: "reset" })}
      />
      <SettingsItemTitleFilter
        viewer={viewer}
        titleFilter={settings.titleFilter}
      />
      <SettingsItemTitleLanguage
        viewer={viewer}
        titleLanguage={settings.titleLanguage}
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
      <div className="divider mb-3"></div>
      <SettingsItemStatuses
        label="Drop Status Filter"
        viewer={viewer}
        listType={settings.listType.value}
        options={DROPPABLE_MEDIA_LIST_STATUS}
        statuses={dropStatuses}
      />
      <SettingsItemDate
        label="Drop Older Than"
        viewer={viewer}
        date={olderThan}
      />
      <Button
        className="btn btn-outline btn-secondary"
        disabled={viewer.data == null}
        onClick={() => {
          dispatch({
            t: "updateOlderThan",
            date: olderThan.value,
            dropStatuses: dropStatuses.value,
            status: "DROPPED",
          });
        }}
      >
        <PiTrashFill /> Drop
      </Button>
    </>
  );
}

import { type MediaType, MEDIA_TYPES } from "../../../api/queries/list";
import type { Viewer } from "../../../api/queries/viewer";
import type { UseAnilistQueryResult } from "../../../hooks/anilist";
import type { Cell } from "../../../hooks/useCell";
import type { DialogState } from "../../../hooks/useDialog";
import { nameOfListType } from "../../../util/settings";
import CustomListbox from "../../CustomListbox";
import type { ConfirmDialogContext } from "../../dialogs/ConfirmDialog";
import SettingsItem from "./SettingsItem";

export default function SettingsItemList({
  viewer,
  hasUnsavedChanges,
  confirmDialog,
  onChange,
  listType,
}: {
  viewer: UseAnilistQueryResult<Viewer>;
  hasUnsavedChanges: boolean;
  listType: Cell<MediaType>;
  onChange: () => void;
  confirmDialog: DialogState<ConfirmDialogContext>;
}) {
  return (
    <SettingsItem label="List">
      <CustomListbox
        className="select w-full"
        disabled={viewer.data == null}
        value={listType.value}
        onChange={(v) => {
          if (listType.value === v) {
            return;
          }
          const change = async () => {
            listType.set(v);
            onChange();
          };
          if (hasUnsavedChanges) {
            confirmDialog.openWith({
              title: "Change List",
              action: "Confirm",
              severity: "ERROR",
              message: (
                <>
                  Are you sure you want to switch to your{" "}
                  {nameOfListType(v).toLowerCase()} list?
                  <br />
                  You will lose all unsaved changes.
                </>
              ),
              onConfirm: change,
            });
          } else {
            change();
          }
        }}
        options={MEDIA_TYPES}
        buttonContents={nameOfListType(listType.value)}
        optionContents={(value) => nameOfListType(value)}
      />
    </SettingsItem>
  );
}

import type { UseQueryResult } from "@tanstack/react-query";
import type { AnilistError } from "../../api/anilist";
import { MEDIA_TYPES, type MediaType } from "../../api/queries/list";
import {
  TITLE_LANGUAGES,
  type TitleLanguage,
  type Viewer,
} from "../../api/queries/viewer";
import CustomListbox from "../../components/CustomListbox";
import type { DropperListDraftAction } from "../dropper";
import type { DialogState } from "../../hooks/useDialog";
import type { ConfirmDialogContext } from "../../components/dialogs/ConfirmDialog";
import { nameOfListType, nameOfTitleLanguage } from "../../util/settings";
import { useStateW, type ReactState } from "../../hooks/useStateW";
import SettingsItem from "../../components/list/SettingsItem";
import { DateTime } from "luxon";
import clsx from "clsx";
import { Button } from "@headlessui/react";
import { PiTrashFill } from "react-icons/pi";
import { useState } from "react";

export type DropperSettings = {
  listType: ReactState<MediaType>;
  titleLanguage: ReactState<TitleLanguage>;
};

export function useDropperSettings(): DropperSettings {
  return {
    listType: useStateW<MediaType>("ANIME"),
    titleLanguage: useStateW<TitleLanguage>("ENGLISH"),
  };
}

export default function DropperSettingsItems({
  dispatch,
  settings,
  viewer,
  numUnsavedChanges,
  confirmDialog,
}: {
  dispatch: React.Dispatch<DropperListDraftAction>;
  settings: DropperSettings;
  viewer: {
    data: Viewer | undefined;
    query: UseQueryResult<Viewer, AnilistError>;
  };
  numUnsavedChanges: number | null;
  confirmDialog: DialogState<ConfirmDialogContext>;
}) {
  const [olderThan, setOlderThan] = useState<DateTime>(
    DateTime.now().endOf("day"),
  );

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
            if (numUnsavedChanges != null && numUnsavedChanges !== 0) {
              confirmDialog.openWith({
                title: "Change List",
                action: "Confirm",
                severity: "BAD",
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
          buttonContents={nameOfListType(settings.listType.value)}
          optionContents={(value) => nameOfListType(value)}
        />
      </SettingsItem>
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
      <SettingsItem label="Drop Older Than">
        <input
          type="date"
          value={olderThan.toISODate()!}
          onChange={(e) => {
            const date = (
              e.target.valueAsDate
                ? (DateTime.fromISO(e.target.value) ?? DateTime.local())
                : DateTime.local()
            ).endOf("day");
            setOlderThan(date);
          }}
          className={clsx(
            "bg-base-100 rounded-field border-base-content/20 flex h-(--size) flex-col border p-2 text-sm shadow-sm",
            "origin-top transition duration-150 ease-out data-closed:scale-y-90 data-closed:opacity-0 motion-reduce:transition-none",
            "focus:outline-none",
          )}
        />
      </SettingsItem>
      <Button
        className="btn btn-outline btn-secondary"
        onClick={() => {
          dispatch({
            t: "updateOlderThan",
            date: olderThan,
            status: "DROPPED",
          });
        }}
      >
        <PiTrashFill /> Drop
      </Button>
    </>
  );
}

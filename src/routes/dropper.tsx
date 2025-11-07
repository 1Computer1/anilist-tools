import { createFileRoute } from "@tanstack/react-router";
import { useAnilistMutation, type UserListOptions } from "../hooks/anilist";
import { useImmerReducer } from "use-immer";
import { Button } from "@headlessui/react";
import { saveMediaListEntries, type ListDraft } from "../api/mutations/save";
import { useQueryClient } from "@tanstack/react-query";
import {
  PiArrowClockwiseFill,
  PiFloppyDiskFill,
  PiQuestionFill,
} from "react-icons/pi";
import { useDialog } from "../hooks/useDialog";
import { Shortcuts } from "../components/Shortcuts";
import { ErrorAlert } from "../components/ErrorAlert";
import { useEffect, useState } from "react";
import CustomDialog from "../components/dialogs/CustomDialog";
import LeftRightListInterface, {
  useLeftRightListInterface,
} from "../components/list/LeftRightListInterface";
import { prepareListForDisplay } from "../util/settings";
import type { MediaListStatus } from "../api/queries/list";
import DropperSettingsItems, {
  useDropperSettings,
} from "./-dropper/DropperSettingsItems";
import DropperListEntry from "./-dropper/DropperListEntry";
import { DateTime } from "luxon";
import useBlockerDialog from "../hooks/useBlockerDialog";

export const Route = createFileRoute("/dropper")({
  component: Dropper,
  head: () => ({
    meta: [
      { title: "ALter - Dropper" },
      {
        name: "description",
        content:
          "Enhance your AniList experience with powerful tools!\nDrop shows and manga that you have not updated in a long time.",
      },
    ],
  }),
});

export type DropperListDraft = ListDraft<"status">;

export type DropperListDraftAction =
  | { t: "updateStatus"; id: number; status?: MediaListStatus }
  | {
      t: "updateOlderThan";
      date: DateTime;
      dropStatuses: MediaListStatus[];
      status: MediaListStatus;
    }
  | { t: "reset" };

function Dropper() {
  const queryClient = useQueryClient();

  const settings = useDropperSettings();

  const listOptions: UserListOptions = {
    type: settings.listType.value,
    statusIn: ["CURRENT", "PAUSED"],
    sort: ["UPDATED_TIME"],
  };

  const leftRightListInterfaceProps = useLeftRightListInterface({
    listOptions,
  });

  const { viewer, list, confirmDialog } = leftRightListInterfaceProps;

  useEffect(() => {
    if (viewer.data) {
      settings.titleLanguage.set(viewer.data.options.titleLanguage);
    }
  }, [viewer.data]);

  const [dispatchError, setDispatchError] = useState<React.ReactNode | null>(
    null,
  );

  const [draft, dispatch] = useImmerReducer<
    DropperListDraft,
    DropperListDraftAction
  >((draft, action) => {
    switch (action.t) {
      case "updateStatus": {
        if (!draft.has(action.id)) {
          draft.set(action.id, {});
        }
        draft.get(action.id)!.status = action.status;
        break;
      }
      case "updateOlderThan": {
        if (!list.data) {
          setDispatchError("Data somehow went missing, please refresh.");
          break;
        }
        for (const [_, entry] of list.data) {
          if (!draft.has(entry.id)) {
            draft.set(entry.id, {});
          }
          if (
            action.dropStatuses.includes(entry.status) &&
            DateTime.fromSeconds(entry.updatedAt).endOf("day") <= action.date
          ) {
            draft.get(entry.id)!.status = "DROPPED";
          } else {
            draft.get(entry.id)!.status = undefined;
          }
        }
        break;
      }
      case "reset": {
        draft.clear();
        break;
      }
    }
  }, new Map());

  const numUnsavedChanges =
    list.data == null
      ? null
      : (() => {
          let changes = 0;
          for (const [k, v] of draft) {
            if (v.status == null) {
              continue;
            }
            const before = list.data!.get(k);
            if (!before) {
              return null;
            }
            if (v.status !== before.status) {
              changes += 1;
            }
          }
          return changes;
        })();

  useBlockerDialog({
    confirmDialog,
    shouldBlock: () =>
      viewer.data != null && numUnsavedChanges != null && numUnsavedChanges > 0,
  });

  const mutSave = useAnilistMutation(saveMediaListEntries, {
    onSuccess: async () => {
      savingLoadingDialog.close();
      await queryClient.invalidateQueries({
        queryKey: ["list", { type: listOptions.type }],
      });
      dispatch({ t: "reset" });
    },
  });

  const shortcutsDialog = useDialog();
  const savingLoadingDialog = useDialog();

  return (
    <LeftRightListInterface
      {...leftRightListInterfaceProps}
      prepareListForDisplay={(list) =>
        prepareListForDisplay(
          list,
          (e) => {
            const matched = !settings.titleFilter.value
              ? true
              : [
                  e.media.title.english,
                  e.media.title.native,
                  e.media.title.romaji,
                ].some((t) => {
                  return (
                    t?.toLowerCase().includes(settings.titleFilter.value) ??
                    false
                  );
                });
            return matched;
          },
          "lastUpdated",
          "asc",
          settings.titleLanguage.value,
          0,
          false,
        )
      }
      error={
        numUnsavedChanges == null ? (
          <ErrorAlert type="APP">
            Your changes are out of sync with your list.
            <br />
            Please refresh to reset.
          </ErrorAlert>
        ) : dispatchError ? (
          <ErrorAlert type="APP">{dispatchError}</ErrorAlert>
        ) : null
      }
      leftMenu={
        <>
          <Button
            className="btn btn-ghost btn-square"
            onClick={() => shortcutsDialog.open()}
          >
            <PiQuestionFill className="size-6" />
          </Button>
        </>
      }
      rightMenu={
        <>
          {numUnsavedChanges != null && numUnsavedChanges > 0 && (
            <div className="text-error text-center text-xs lg:text-sm">
              {numUnsavedChanges} unsaved change
              {numUnsavedChanges > 1 && "s"}
            </div>
          )}
          <Button
            className="btn btn-outline btn-secondary"
            disabled={list.query.isFetching || list.data == null}
            onClick={async () => {
              const refresh = async () => {
                await queryClient.invalidateQueries({
                  queryKey: ["list", { type: listOptions.type }],
                });
                dispatch({ t: "reset" });
              };
              if (numUnsavedChanges != null && numUnsavedChanges > 0) {
                confirmDialog.openWith({
                  title: "Refresh List",
                  action: "Refresh",
                  severity: "BAD",
                  message: (
                    <>
                      Are you sure you want to refresh?
                      <br />
                      You will lose all unsaved changes.
                    </>
                  ),
                  onConfirm: refresh,
                });
              } else {
                refresh();
              }
            }}
          >
            <PiArrowClockwiseFill /> Refresh
          </Button>
          <Button
            className="btn btn-outline btn-success"
            disabled={numUnsavedChanges == null || numUnsavedChanges == 0}
            onClick={() => {
              confirmDialog.openWith({
                title: "Update Scores",
                action: "Update",
                severity: "GOOD",
                message: (
                  <>
                    Are you sure you want to drop {numUnsavedChanges} of your
                    entries?
                  </>
                ),
                onConfirm: async () => {
                  if (numUnsavedChanges !== 0) {
                    savingLoadingDialog.open();
                    mutSave.mutate(draft);
                  } else {
                    await queryClient.invalidateQueries({
                      queryKey: ["list", { type: listOptions.type }],
                    });
                    dispatch({ t: "reset" });
                  }
                },
              });
            }}
          >
            <PiFloppyDiskFill /> Save
          </Button>
        </>
      }
      settingsItems={
        <DropperSettingsItems
          viewer={viewer}
          dispatch={dispatch}
          settings={settings}
          numUnsavedChanges={numUnsavedChanges}
          confirmDialog={confirmDialog}
        />
      }
      listEntry={({ entry, ref, tab }) => (
        <DropperListEntry
          settings={settings}
          entry={entry}
          draft={draft}
          dispatch={dispatch}
          ref={ref}
          tab={tab}
        />
      )}
    >
      <CustomDialog title="Keyboard Shortcuts" state={shortcutsDialog}>
        <Shortcuts
          shortcuts={[
            { divider: "Navigation" },
            { keys: "Tab|↓|↩", desc: "Go next" },
            { keys: "Shift+Tab|↑", desc: "Go back" },
            { divider: "Update" },
            { keys: ".", desc: "Drop entry" },
            { keys: "/", desc: "Revert status to original" },
            { divider: "Other" },
            { keys: "Ctrl", desc: "Hold to update but stay on entry" },
            { keys: "`|Esc|⌫", desc: "Revert status and go back" },
          ]}
        />
      </CustomDialog>
      <CustomDialog state={savingLoadingDialog} closeable={false}>
        <div className="flex-center gap-y-2">
          <span>Saving your new scores...</span>
          <progress className="progress progress-success w-full"></progress>
        </div>
      </CustomDialog>
    </LeftRightListInterface>
  );
}

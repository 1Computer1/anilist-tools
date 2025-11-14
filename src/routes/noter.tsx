import { createFileRoute } from "@tanstack/react-router";
import { useAnilistMutation, type UserListOptions } from "../hooks/anilist";
import { useImmerReducer } from "use-immer";
import { Button } from "@headlessui/react";
import { saveMediaListEntries, type ListDraft } from "../api/mutations/save";
import { useQueryClient } from "@tanstack/react-query";
import {
  PiArrowClockwiseFill,
  PiFloppyDiskFill,
  PiKeyboardBold,
} from "react-icons/pi";
import { useDialog } from "../hooks/useDialog";
import { Shortcuts } from "../components/Shortcuts";
import { Alert } from "../components/Alert";
import { useEffect, useState } from "react";
import CustomDialog from "../components/dialogs/CustomDialog";
import LeftRightListInterface, {
  useLeftRightListInterface,
} from "../components/list/LeftRightListInterface";
import { matchesFilter, prepareListForDisplay } from "../util/settings";
import { MEDIA_LIST_STATUSES, type Entry } from "../api/queries/list";
import NoterSettingsItems from "./-noter/NoterSettingsItems";
import { useNoterSettings } from "./-noter/noterSettings";
import NoterListEntry from "./-noter/NoterListEntry";
import useBlockerDialog from "../hooks/useBlockerDialog";
import LoadingDialog from "../components/dialogs/LoadingDialog";
import replaceEval from "../util/replaceEval";

export const Route = createFileRoute("/noter")({
  component: Noter,
  head: () => ({
    meta: [
      { title: "ALter - Noter" },
      {
        name: "description",
        content:
          "Enhance your AniList experience with powerful tools!\nSearch your notes and edit them all at once.",
      },
    ],
  }),
});

export type NoterListDraft = ListDraft<"notes">;

export type NoterListDraftAction =
  | { t: "update"; id: number; notes?: string }
  | { t: "replace"; id: number }
  | { t: "replaceAll" }
  | { t: "reset" };

function Noter() {
  const queryClient = useQueryClient();

  const settings = useNoterSettings();

  const listOptions: UserListOptions = {
    type: settings.listType.value,
    statusIn: MEDIA_LIST_STATUSES,
    sort: ["SCORE_DESC"],
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
    NoterListDraft,
    NoterListDraftAction
  >((draft, action) => {
    switch (action.t) {
      case "update": {
        if (!draft.has(action.id)) {
          draft.set(action.id, {});
        }
        draft.get(action.id)!.notes = action.notes;
        break;
      }
      case "replace": {
        if (!list.data) {
          setDispatchError("Data somehow went missing, please refresh.");
          break;
        }
        if (!draft.has(action.id)) {
          draft.set(action.id, {});
        }
        if (
          settings.noteFindRegexp.value == null ||
          settings.noteFindRegexpError.value != null
        ) {
          setDispatchError("Regular expression missing or invalid.");
          break;
        }
        const d = draft.get(action.id)!;
        const entry = list.data.get(action.id)!;
        const rep = doReplace(
          entry,
          d.notes ?? entry.notes,
          settings.noteReplaceJavaScriptMode.value,
          settings.noteFindRegexp.value,
          settings.noteReplace.value,
        );
        d.notes = rep;
        break;
      }
      case "replaceAll": {
        if (!list.data) {
          setDispatchError("Data somehow went missing, please refresh.");
          break;
        }
        if (
          settings.noteFindRegexp.value == null ||
          settings.noteFindRegexpError.value != null
        ) {
          setDispatchError("Regular expression missing or invalid.");
          break;
        }
        for (const [_, entry] of list.data) {
          const old =
            draft.get(entry.id)?.notes ?? list.data.get(entry.id)!.notes;
          const rep = doReplace(
            entry,
            old,
            settings.noteReplaceJavaScriptMode.value,
            settings.noteFindRegexp.value,
            settings.noteReplace.value,
          );
          if (rep !== old) {
            if (!draft.has(entry.id)) {
              draft.set(entry.id, {});
            }
            draft.get(entry.id)!.notes = rep;
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
            if (v.notes == null) {
              continue;
            }
            const before = list.data!.get(k);
            if (!before) {
              return null;
            }
            if (v.notes !== before.notes) {
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
        prepareListForDisplay({
          data: list,
          filter: (e) => {
            return (
              matchesFilter(settings.filter.value, e) &&
              (!settings.hideUnmatched.value ||
                (settings.noteFindRegexp.value instanceof RegExp
                  ? (draft.get(e.id)?.notes ?? e.notes).match(
                      settings.noteFindRegexp.value,
                    ) != null
                  : true))
            );
          },
          sortBy: settings.sortBy.value,
          sortDir: settings.sortDir.value,
          titleLanguage: settings.titleLanguage.value,
          seed: settings.randomSeed.value,
          section: true,
        })
      }
      error={
        numUnsavedChanges == null ? (
          <Alert type="APP">
            Your changes are out of sync with your list.
            <br />
            Please refresh to reset.
          </Alert>
        ) : dispatchError ? (
          <Alert type="APP">{dispatchError}</Alert>
        ) : null
      }
      leftMenu={
        <>
          <Button
            className="btn btn-ghost btn-square"
            onClick={() => shortcutsDialog.open()}
          >
            <PiKeyboardBold className="size-6" />
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
                  severity: "ERROR",
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
                title: "Update Notes",
                action: "Update",
                severity: "SUCCESS",
                message: (
                  <>
                    Are you sure you want to update {numUnsavedChanges} of your
                    notes?
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
        <NoterSettingsItems
          viewer={viewer}
          dispatch={dispatch}
          settings={settings}
          hasUnsavedChanges={numUnsavedChanges != null && numUnsavedChanges > 0}
          confirmDialog={confirmDialog}
        />
      }
      listEntry={({ entry, ref, tab }) => (
        <NoterListEntry
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
            { keys: "↓|↩", desc: "Go next" },
            { keys: "↑", desc: "Go back" },
            { divider: "Update" },
            { keys: "r", desc: "Apply replacement" },
            { keys: ".", desc: "Clear note" },
            { keys: "/", desc: "Revert note to original" },
            { divider: "Other" },
            { keys: "Ctrl", desc: "Hold to update but stay on entry" },
            { keys: "`|Esc|⌫", desc: "Revert note and go back" },
          ]}
        />
      </CustomDialog>
      <LoadingDialog state={savingLoadingDialog}>
        Updating some notes...
      </LoadingDialog>
    </LeftRightListInterface>
  );
}

function doReplace(
  entry: Entry,
  str: string,
  scriptMode: boolean,
  regexp: RegExp,
  replacer: string,
) {
  return scriptMode
    ? replaceEval(entry, str, regexp, replacer)
    : str.replace(regexp, replacer.replaceAll(/\$([`'])/g, "$$$$$1"));
}

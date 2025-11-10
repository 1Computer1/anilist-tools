import { Button } from "@headlessui/react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  PiArrowClockwiseFill,
  PiFloppyDiskFill,
  PiScrewdriverFill,
  PiKeyboardBold,
} from "react-icons/pi";
import { useImmerReducer } from "use-immer";
import {
  type ListDraft,
  saveMediaListEntries,
  type ValueOf,
} from "../api/mutations/save";
import CustomDialog from "../components/dialogs/CustomDialog";
import LoadingDialog from "../components/dialogs/LoadingDialog";
import { Alert } from "../components/Alert";
import LeftRightListInterface, {
  useLeftRightListInterface,
} from "../components/list/LeftRightListInterface";
import { Shortcuts } from "../components/Shortcuts";
import { type UserListOptions, useAnilistMutation } from "../hooks/anilist";
import useBlockerDialog from "../hooks/useBlockerDialog";
import { useDialog } from "../hooks/useDialog";
import { prepareListForDisplay, matchesFilter } from "../util/settings";
import {
  fuzzyDateToDate,
  isEqualDateWithFuzzyDate,
  isFuzzyNotBlank,
  isNonFuzzy,
} from "../util/date";
import FixerListEntry, {
  type FixerListEntryShow,
} from "./-fixer/FixerListEntry";
import { useFixerSettings } from "./-fixer/fixerSettings";
import FixerSettingsItems from "./-fixer/FixerSettingsItems";
import * as _ from "lodash-es";
import {
  MEDIA_LIST_STATUSES,
  type Entry,
  type MediaListStatus,
} from "../api/queries/list";
import { DateTime } from "luxon";

export const Route = createFileRoute("/fixer")({
  component: Fixer,
  head: () => ({
    meta: [
      { title: "ALter - Fixer" },
      {
        name: "description",
        content:
          "Enhance your AniList experience with powerful tools!\nFix inconsistent data in your entries.",
      },
    ],
  }),
});

export type FixerListDraft = ListDraft<
  "status" | "startedAt" | "completedAt" | "progress" | "progressVolumes",
  {
    exclude: boolean;
    statusBad: boolean;
    startedAtBad: boolean;
    completedAtBad: boolean;
    progressBad: boolean;
    progressVolumesBad: boolean;
  }
>;

export type FixerListDraftAction =
  | { t: "update"; id: number; startedAt?: DateTime; completedAt?: DateTime }
  | { t: "exclude"; id: number; exclude?: boolean }
  | { t: "updateRecommended"; id: number }
  | { t: "updateRecommendedAll"; show: FixerListEntryShow }
  | { t: "reset" };

function Fixer() {
  const queryClient = useQueryClient();

  const settings = useFixerSettings();

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

  const [fixPressed, setFixPressed] = useState(false);
  const [listEntryShow, setListEntryShow] = useState<FixerListEntryShow>({
    status: true,
    progress: true,
    dates: true,
  });

  const [draft, dispatch] = useImmerReducer<
    FixerListDraft,
    FixerListDraftAction
  >((draft, action) => {
    function applyRecommended(entry: Entry, d: ValueOf<FixerListDraft>) {
      if (settings.fixes.invalidStatus.value) {
        if (
          entry.status === "COMPLETED" &&
          !(
            entry.media.status === "FINISHED" ||
            entry.media.status === "CANCELLED"
          )
        ) {
          d.statusBad = true;
          d.status = {
            RELEASING: "CURRENT",
            HIATUS: "PAUSED",
            NOT_YET_RELEASED: "PLANNING",
          }[entry.media.status] as MediaListStatus;
        } else if (
          ["CURRENT", "REPEATING", "DROPPED", "PAUSED"].includes(
            entry.status,
          ) &&
          entry.media.status === "NOT_YET_RELEASED"
        ) {
          d.statusBad = true;
          d.status = "PLANNING";
        }
      }
      if (
        settings.fixes.invalidProgress.value &&
        entry.status === "COMPLETED"
      ) {
        const max = entry.media.episodes ?? entry.media.chapters;
        if (max != null && entry.progress !== max) {
          d.progress = max;
          d.progressBad = true;
        }
        if (
          entry.media.volumes != null &&
          entry.progressVolumes !== entry.media.volumes
        ) {
          d.progressVolumes = entry.media.volumes;
          d.progressVolumesBad = true;
        }
      }
      if (
        (settings.fixes.missingStartDate.value ||
          settings.fixes.invalidStartDate.value) &&
        entry.status !== "PLANNING" &&
        entry.media.status !== "NOT_YET_RELEASED" &&
        isNonFuzzy(entry.media.startDate)
      ) {
        if (isNonFuzzy(entry.startedAt)) {
          const startedAt = fuzzyDateToDate(entry.startedAt);
          const mediaStartDate = fuzzyDateToDate(entry.media.startDate);
          if (
            settings.fixes.invalidStartDate.value &&
            startedAt < mediaStartDate
          ) {
            d.startedAt = mediaStartDate;
            d.startedAtBad = true;
          }
        } else if (settings.fixes.missingStartDate.value) {
          d.startedAt =
            fuzzyDateToDate(entry.completedAt) ??
            fuzzyDateToDate(entry.media.startDate);
          d.startedAtBad = true;
        }
      }
      if (
        settings.fixes.invalidStartDate.value &&
        (d.status ?? entry.status) === "PLANNING" &&
        isFuzzyNotBlank(entry.startedAt)
      ) {
        d.startedAt = DateTime.fromObject({ year: 0, month: 0, day: 0 }).endOf(
          "day",
        );
        d.startedAtBad = true;
      }
      if (
        (settings.fixes.missingEndDate.value ||
          settings.fixes.invalidEndDate.value) &&
        (entry.status === "COMPLETED" || entry.status === "REPEATING") &&
        entry.media.status === "FINISHED" &&
        isNonFuzzy(entry.media.endDate)
      ) {
        if (isNonFuzzy(entry.completedAt)) {
          const completedAt = fuzzyDateToDate(entry.completedAt);
          const mediaEndDate = fuzzyDateToDate(entry.media.endDate);
          if (
            settings.fixes.invalidEndDate.value &&
            completedAt < mediaEndDate
          ) {
            d.completedAt = mediaEndDate;
            d.completedAtBad = true;
          }
        } else if (settings.fixes.missingEndDate.value) {
          d.completedAt =
            fuzzyDateToDate(entry.startedAt) ??
            fuzzyDateToDate(entry.media.endDate);
          d.completedAtBad = true;
        }
      }
      if (
        settings.fixes.invalidEndDate.value &&
        (d.status ?? entry.status) === "PLANNING" &&
        isFuzzyNotBlank(entry.completedAt)
      ) {
        d.completedAt = DateTime.fromObject({
          year: 0,
          month: 0,
          day: 0,
        }).endOf("day");
        d.completedAtBad = true;
      }
    }

    switch (action.t) {
      case "update": {
        if (!draft.has(action.id)) {
          draft.set(action.id, {});
        }
        if ("startedAt" in action) {
          draft.get(action.id)!.startedAt = action.startedAt;
        }
        if ("completedAt" in action) {
          draft.get(action.id)!.completedAt = action.completedAt;
        }
        break;
      }
      case "exclude": {
        if (!draft.has(action.id)) {
          draft.set(action.id, {});
        }
        draft.get(action.id)!.exclude =
          action.exclude ?? !draft.get(action.id)!.exclude;
        break;
      }
      case "updateRecommended": {
        if (!list.data) {
          setDispatchError("Data somehow went missing, please refresh.");
          break;
        }
        const d: ValueOf<FixerListDraft> = {};
        applyRecommended(list.data.get(action.id)!, d);
        if (isEntryBad(d)) {
          draft.set(action.id, d);
        } else {
          draft.delete(action.id);
        }
        break;
      }
      case "updateRecommendedAll": {
        if (!list.data) {
          setDispatchError("Data somehow went missing, please refresh.");
          break;
        }
        setFixPressed(true);
        setListEntryShow(action.show);
        for (const [_, entry] of list.data) {
          const d: ValueOf<FixerListDraft> = {};
          applyRecommended(entry, d);
          if (isEntryBad(d)) {
            draft.set(entry.id, d);
          } else {
            draft.delete(entry.id);
          }
        }
        break;
      }
      case "reset": {
        draft.clear();
        setFixPressed(false);
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
            if (v.exclude) {
              continue;
            }
            const before = list.data!.get(k);
            if (!before) {
              return null;
            }
            const statusChanged =
              v.status != null && v.status !== before.status;
            const startedAtChanged =
              v.startedAt != null &&
              !isEqualDateWithFuzzyDate(v.startedAt, before.startedAt);
            const completedAtChanged =
              v.completedAt != null &&
              !isEqualDateWithFuzzyDate(v.completedAt, before.completedAt);
            const progressChanged =
              v.progress != null && v.progress !== before.progress;
            const progressVolumesChanged =
              v.progressVolumes != null &&
              v.progressVolumes !== before.progressVolumes;
            if (
              statusChanged ||
              startedAtChanged ||
              completedAtChanged ||
              progressChanged ||
              progressVolumesChanged
            ) {
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

  const isAnime = settings.listType.value === "ANIME";
  const airing = isAnime ? "airing" : "releasing";

  return (
    <LeftRightListInterface
      {...leftRightListInterfaceProps}
      prepareListForDisplay={(list) =>
        prepareListForDisplay(
          list,
          (e) =>
            draft.has(e.id) &&
            isEntryBad(draft.get(e.id)!) &&
            settings.allowedStatuses.value.includes(e.status) &&
            matchesFilter(settings.filter.value, e),
          settings.sortBy.value,
          settings.sortDir.value,
          settings.titleLanguage.value,
          0,
          true,
        )
      }
      listEmpty={(list) =>
        [...list.values()].every(
          (e) => !draft.has(e.id) || !isEntryBad(draft.get(e.id)!),
        ) && (
          <Alert type="SETTINGS" severity="INFO">
            {fixPressed ? (
              <p>No invalid entries found for the specified fixes.</p>
            ) : (
              <p>
                To start fixing data, set which fixes to apply, then press the{" "}
                <div className="btn btn-outline btn-xs btn-secondary pointer-events-none select-none">
                  <PiScrewdriverFill /> Fix
                </div>{" "}
                button!
              </p>
            )}
          </Alert>
        )
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
                title: "Update Scores",
                action: "Update",
                severity: "SUCCESS",
                message: (
                  <>
                    Are you sure you want to update the data for{" "}
                    {numUnsavedChanges} of your entries?
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
        <FixerSettingsItems
          viewer={viewer}
          dispatch={dispatch}
          settings={settings}
          hasUnsavedChanges={numUnsavedChanges != null && numUnsavedChanges > 0}
          confirmDialog={confirmDialog}
        />
      }
      listEntry={({ entry, ref, tab }) => (
        <FixerListEntry
          settings={settings}
          show={listEntryShow}
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
            { keys: ".", desc: "Fix entry" },
            { keys: "/", desc: "Exclude fixing this entry" },
            ...(listEntryShow.dates
              ? [
                  { keys: "s", desc: `Set start to ${airing} date` },
                  { keys: "f", desc: `Set finish to finished ${airing} date` },
                  {
                    keys: "d",
                    desc: `Set start and finish to ${airing} period`,
                  },
                  { keys: "+|Shift +", desc: "+1 day to start/finish date" },
                  { keys: "-|Shift -", desc: "-1 day to start/finish date" },
                  { keys: "]|Shift ]", desc: "+7 days to start/finish date" },
                  { keys: "[|Shift [", desc: "-7 days to start/finish date" },
                ]
              : []),
            { divider: "Other" },
            { keys: "Ctrl", desc: "Hold to update but stay on entry" },
            { keys: "`|Esc|⌫", desc: "Fix entry and go back" },
          ]}
        />
      </CustomDialog>
      <LoadingDialog state={savingLoadingDialog}>
        Updating data...
      </LoadingDialog>
    </LeftRightListInterface>
  );
}

function isEntryBad(d: ValueOf<FixerListDraft>): boolean {
  return (
    [
      "statusBad",
      "startedAtBad",
      "completedAtBad",
      "progressBad",
      "progressVolumesBad",
    ] as const
  ).some((k) => d[k]);
}

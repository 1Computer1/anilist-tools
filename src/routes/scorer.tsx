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
import ScorerListEntry from "./-scorer/ScorerListEntry";
import { SCORE_SYSTEMS } from "./-scorer/scoreSystems";
import { ErrorAlert } from "../components/ErrorAlert";
import { useEffect } from "react";
import CustomDialog from "../components/dialogs/CustomDialog";
import ScorerSettingsItems from "./-scorer/ScorerSettingsItems";
import { useScorerSettings } from "./-scorer/scorerSettings";
import LeftRightListInterface, {
  useLeftRightListInterface,
} from "../components/list/LeftRightListInterface";
import { matchesTitle, prepareListForDisplay } from "../util/settings";
import useBlockerDialog from "../hooks/useBlockerDialog";
import LoadingDialog from "../components/dialogs/LoadingDialog";

export const Route = createFileRoute("/scorer")({
  component: Scorer,
  head: () => ({
    meta: [
      { title: "ALter - Scorer" },
      {
        name: "description",
        content:
          "Enhance your AniList experience with powerful tools!\nQuickly apply new scores to your anime and manga list.",
      },
    ],
  }),
});

export type ScorerListDraft = ListDraft<"score" | "scoreDisplay">;

export type ScorerListDraftAction =
  | { t: "updateScore"; id: number; score?: number; scoreDisplay?: string }
  | { t: "updateScoreDisplays" }
  | { t: "reset" };

function Scorer() {
  const queryClient = useQueryClient();

  const settings = useScorerSettings();

  const listOptions: UserListOptions = {
    type: settings.listType.value,
    statusIn: [
      "CURRENT",
      "PLANNING",
      "COMPLETED",
      "DROPPED",
      "PAUSED",
      "REPEATING",
    ],
    sort: ["SCORE_DESC"],
  };

  const leftRightListInterfaceProps = useLeftRightListInterface({
    listOptions,
  });

  const { viewer, list, confirmDialog } = leftRightListInterfaceProps;

  useEffect(() => {
    if (viewer.data) {
      settings.scoreFormat.set(viewer.data.mediaListOptions.scoreFormat);
      settings.titleLanguage.set(viewer.data.options.titleLanguage);
    }
  }, [viewer.data]);

  const [draft, dispatch] = useImmerReducer<
    ScorerListDraft,
    ScorerListDraftAction
  >((draft, action) => {
    switch (action.t) {
      case "updateScore": {
        if (!draft.has(action.id)) {
          draft.set(action.id, {});
        }
        draft.get(action.id)!.score = action.score;
        draft.get(action.id)!.scoreDisplay = action.scoreDisplay;
        break;
      }
      case "updateScoreDisplays": {
        for (const [_, v] of draft) {
          if (v.score != null) {
            const scoreDisplay = SCORE_SYSTEMS[
              settings.scoreFormat.value
            ].fromRaw(v.score);
            v.scoreDisplay = scoreDisplay;
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

  const [numUnsavedChanges, numPerceivedChanges] =
    list.data == null
      ? [null, null]
      : (() => {
          let changes = 0;
          let perceivedChanges = 0;
          for (const [k, v] of draft) {
            if (v.score == null || Number.isNaN(v.score)) {
              continue;
            }
            const before = list.data!.get(k);
            if (!before) {
              return [null, null];
            }
            perceivedChanges += 1;
            if (v.score !== before.score) {
              changes += 1;
            }
          }
          return [changes, perceivedChanges];
        })();

  const numDisplayUnsavedChanges = settings.hideScore.value
    ? numPerceivedChanges
    : numUnsavedChanges;

  useBlockerDialog({
    confirmDialog,
    shouldBlock: () =>
      viewer.data != null &&
      numUnsavedChanges != null &&
      (settings.hideScore.value
        ? numPerceivedChanges > 0
        : numUnsavedChanges > 0),
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
  const shorcutsForScore = {
    POINT_100: {
      incDesc: "+1 to score",
      incDescLarge: "+5 to score",
      decDesc: "-1 to score",
      decDescLarge: "-5 to score",
      numKeyMax: 0,
      numKeyDesc: "Set score to 10, 20, …, 100",
    },
    POINT_10_DECIMAL: {
      incDesc: "+0.1 to score",
      incDescLarge: "+0.5 to score",
      decDesc: "-0.1 to score",
      decDescLarge: "-0.5 to score",
      numKeyMax: 0,
      numKeyDesc: "Set score to 1, 2, …, 10",
    },
    POINT_10: {
      incDesc: "+1 to score",
      decDesc: "-1 to score",
      numKeyMax: 0,
      numKeyDesc: "Set score to 1, 2, …, 10",
    },
    POINT_5: {
      incDesc: "Add ★ to score",
      decDesc: "Remove ★ from score",
      numKeyMax: 5,
      numKeyDesc: "Set stars from 1★ to 5★",
    },
    POINT_3: {
      incDesc: "Be more happy :)",
      decDesc: "Be less happy :(",
      numKeyMax: 3,
      numKeyDesc: "Set your happiness",
    },
  }[settings.scoreFormat.value];

  const savingLoadingDialog = useDialog();

  return (
    <LeftRightListInterface
      {...leftRightListInterfaceProps}
      prepareListForDisplay={(list) =>
        prepareListForDisplay(
          list,
          (e) =>
            settings.allowedStatuses.value.includes(e.status) &&
            matchesTitle(settings.titleFilter.value, e),
          settings.sortBy.value,
          settings.sortDir.value,
          settings.titleLanguage.value,
          settings.randomSeed.value,
          true,
        )
      }
      error={
        numUnsavedChanges == null ? (
          <ErrorAlert type="APP">
            Your changes are out of sync with your list.
            <br />
            Please refresh to reset.
          </ErrorAlert>
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
          {numDisplayUnsavedChanges != null && numDisplayUnsavedChanges > 0 && (
            <div className="text-error text-center text-xs lg:text-sm">
              {numDisplayUnsavedChanges} unsaved change
              {numDisplayUnsavedChanges > 1 && "s"}
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
              if (
                numDisplayUnsavedChanges != null &&
                numDisplayUnsavedChanges > 0
              ) {
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
            disabled={
              numDisplayUnsavedChanges == null || numDisplayUnsavedChanges == 0
            }
            onClick={() => {
              confirmDialog.openWith({
                title: "Update Scores",
                action: "Update",
                severity: "GOOD",
                message: (
                  <>
                    Are you sure you want to update {numDisplayUnsavedChanges}{" "}
                    of your ratings?
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
        <ScorerSettingsItems
          viewer={viewer}
          dispatch={dispatch}
          settings={settings}
          hasUnsavedChanges={
            numDisplayUnsavedChanges != null && numDisplayUnsavedChanges > 0
          }
          confirmDialog={confirmDialog}
        />
      }
      listEntry={({ entry, ref, tab }) => (
        <ScorerListEntry
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
            { divider: "Adjustments" },
            { keys: "→|=|+", desc: shorcutsForScore.incDesc },
            { keys: "←|-|_", desc: shorcutsForScore.decDesc },
            ...(shorcutsForScore.incDescLarge && shorcutsForScore.decDescLarge
              ? [
                  { keys: "]|}", desc: shorcutsForScore.incDescLarge },
                  { keys: "[|{", desc: shorcutsForScore.decDescLarge },
                ]
              : []),
            { divider: "Update" },
            {
              keys: `1...${shorcutsForScore.numKeyMax}`,
              desc: shorcutsForScore.numKeyDesc,
            },
            { keys: ".", desc: "Clear score value" },
            { keys: "/", desc: "Revert score to original" },
            { divider: "Other" },
            { keys: "Ctrl", desc: "Hold to update but stay on entry" },
            { keys: "`|Esc|⌫", desc: "Revert score and go back" },
          ]}
        />
      </CustomDialog>
      <LoadingDialog state={savingLoadingDialog}>
        Saving your new scores...
      </LoadingDialog>
    </LeftRightListInterface>
  );
}

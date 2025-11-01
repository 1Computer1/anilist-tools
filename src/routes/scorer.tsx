import { createFileRoute } from "@tanstack/react-router";
import { useAnilistMutation, useAnilistQuery } from "../hooks/anilist";
import { getList } from "../api/queries/list";
import { useImmerReducer } from "use-immer";
import { Button, Switch, Transition } from "@headlessui/react";
import { saveMediaListEntries, type ListDraft } from "../api/mutations/save";
import { useQueryClient } from "@tanstack/react-query";
import { getTokenUserId } from "../util/jwt";
import { getViewer } from "../api/queries/viewer";
import {
  PiArrowClockwiseFill,
  PiDotsThreeOutlineFill,
  PiFloppyDiskFill,
  PiQuestionFill,
} from "react-icons/pi";
import { useDialog } from "../hooks/useDialog";
import ChoicesDialog from "../components/dialogs/ChoicesDialog";
import { Shortcuts } from "../components/Shortcuts";
import { ListDivider, ListEntry, SCORE_SYSTEMS } from "./-scorer/ListEntry";
import type { Context } from "../api/anilist";
import { ErrorAlert } from "../components/ErrorAlert";
import { useEffect, useRef, useState } from "react";
import CustomDialog from "../components/dialogs/CustomDialog";
import clsx from "clsx";
import { useMediaQuery } from "usehooks-ts";
import {
  nameOfStatus,
  prepareListForDisplay,
  SettingsItems,
  useSettings,
} from "./-scorer/Settings";

export const Route = createFileRoute("/scorer")({
  component: Scorer,
  head: () => ({
    meta: [
      { title: "AniList Tools - Scorer" },
      {
        name: "description",
        content:
          "Enhance your AniList experience with various tools!\nQuickly apply new scores to your entire list.",
      },
    ],
  }),
});

export type ListDraftAction =
  | { t: "updateScore"; id: number; score?: number; scoreDisplay?: string }
  | { t: "updateScoreDisplays" }
  | { t: "reset" };

export type UserListOptions = Pick<
  typeof getList extends (ctx: Context, options: infer O) => any ? O : never,
  "type" | "statusIn" | "sort"
>;

export type ConfirmResetDialogContext = {
  title: string;
  action: string;
  message: string;
  onConfirm: () => void;
};

function Scorer() {
  const queryClient = useQueryClient();

  const viewer = useAnilistQuery(["viewer"], getViewer, {
    staleTime: Infinity,
  });

  const settings = useSettings();
  useEffect(() => {
    if (viewer.data) {
      settings.scoreFormat.set(viewer.data.mediaListOptions.scoreFormat);
      settings.titleLanguage.set(viewer.data.options.titleLanguage);
    }
  }, [viewer.data]);

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

  const list = useAnilistQuery(
    ["list", listOptions],
    (ctx) =>
      getList(ctx, {
        id: getTokenUserId(ctx.token),
        forceSingleCompletedList: true,
        format: "POINT_100",
        ...listOptions,
      }),
    {
      enabled: !!viewer.data,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  );

  const fetchError = viewer.query.error ?? list.query.error;

  const [displayList, dividerPositions] = list.data
    ? prepareListForDisplay(list.data, settings)
    : [null, null];

  const [draft, dispatch] = useImmerReducer<ListDraft, ListDraftAction>(
    (draft, action) => {
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
    },
    new Map(),
  );

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

  const mutSave = useAnilistMutation(saveMediaListEntries, {
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["list", { type: listOptions.type }],
      });
      dispatch({ t: "reset" });
    },
  });

  const confirmSaveDialog = useDialog();
  const confirmResetDialog = useDialog<ConfirmResetDialogContext>({
    title: "",
    action: "",
    message: "",
    onConfirm: () => {},
  });

  const shortcutsDialog = useDialog();
  const shorcutsForScore = {
    POINT_100: {
      incDesc: "+1 to score",
      decDesc: "-1 to score",
      numKeyMax: 0,
      numKeyDesc: "Set score to 10, 20, …, 100",
    },
    POINT_10_DECIMAL: {
      incDesc: "+0.1 to score",
      decDesc: "-0.1 to score",
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

  const listEntryRefs = useRef<HTMLDivElement[]>([]);
  useEffect(() => {
    listEntryRefs.current = listEntryRefs.current.slice(
      0,
      displayList?.length ?? 0,
    );
  }, [displayList?.length]);

  const md = useMediaQuery("(width >= 48rem)");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <main className="flex h-full w-full flex-col items-center justify-start gap-2 px-2 lg:px-4">
      <ChoicesDialog
        state={confirmSaveDialog}
        title="Update Scores"
        choices={[
          {
            text: "Update",
            severity: "GOOD",
            onClick: async () => {
              confirmSaveDialog.close();
              if (numUnsavedChanges !== 0) {
                mutSave.mutate(draft);
              } else {
                await queryClient.invalidateQueries({
                  queryKey: ["list", { type: listOptions.type }],
                });
                dispatch({ t: "reset" });
              }
            },
          },
          {
            text: "Cancel",
            severity: "NORMAL",
            onClick: () => {
              confirmSaveDialog.close();
            },
          },
        ]}
      >
        Are you sure you want to update{" "}
        {settings.hideScore.value ? numPerceivedChanges : numUnsavedChanges} of
        your ratings?
      </ChoicesDialog>
      <ChoicesDialog
        state={confirmResetDialog}
        title={confirmResetDialog.context.title}
        choices={[
          {
            text: confirmResetDialog.context.action,
            severity: "BAD",
            onClick: () => {
              confirmResetDialog.context.onConfirm();
              confirmResetDialog.close();
            },
          },
          {
            text: "Cancel",
            severity: "NORMAL",
            onClick: () => {
              confirmResetDialog.close();
            },
          },
        ]}
      >
        {confirmResetDialog.context.message}
        <br />
        Your unsaved changes will be lost.
      </ChoicesDialog>
      <CustomDialog title="Keyboard Shortcuts" state={shortcutsDialog}>
        <Shortcuts
          shortcuts={[
            { divider: "Navigation" },
            { keys: "Tab|↓|↩", desc: "Go next" },
            { keys: "Shift+Tab|↑", desc: "Go back" },
            { divider: "Adjustments" },
            { keys: "→|=|+", desc: shorcutsForScore.incDesc },
            { keys: "←|-|_", desc: shorcutsForScore.decDesc },
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
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row items-center justify-center gap-2">
          <Button
            className="btn btn-ghost btn-square"
            onClick={() => shortcutsDialog.open()}
          >
            <PiQuestionFill className="size-6" />
          </Button>
        </div>
        <div className="flex flex-row items-center justify-center gap-2">
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
                numUnsavedChanges != null &&
                (settings.hideScore.value
                  ? numPerceivedChanges > 0
                  : numUnsavedChanges > 0)
              ) {
                confirmResetDialog.openWith({
                  title: "Refresh List",
                  action: "Refresh",
                  message: "Are you sure you want to refresh?",
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
              numUnsavedChanges == null ||
              (settings.hideScore.value
                ? numPerceivedChanges == 0
                : numUnsavedChanges == 0)
            }
            onClick={() => {
              confirmSaveDialog.open();
            }}
          >
            <PiFloppyDiskFill /> Save
          </Button>
          {!md && (
            <>
              <Switch
                className="btn btn-square btn-ghost"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              >
                <PiDotsThreeOutlineFill className="size-6" />
              </Switch>
            </>
          )}
        </div>
      </div>
      <div className="flex w-full grow flex-col items-start justify-center gap-2 md:flex-row">
        <Transition show={md || isSettingsOpen}>
          <div
            className={clsx(
              "bg-base-200 rounded-box flex w-full flex-1 flex-col items-center justify-start dark:shadow",
              "md:h-full md:w-auto md:flex-[unset] md:grow-0",
              "origin-top duration-150 ease-out data-closed:scale-y-90 data-closed:opacity-0 motion-reduce:transition-none md:transition-none",
            )}
          >
            <div
              className={clsx(
                "flex min-h-0 w-full grow basis-0 flex-col justify-start gap-2 overflow-y-auto p-4",
                "md:h-full md:w-44 lg:w-48",
                "rounded-box focus:outline-base-content focus:outline-2 focus:outline-offset-2",
              )}
            >
              <SettingsItems
                viewer={viewer}
                dispatch={dispatch}
                settings={settings}
                numUnsavedChanges={numUnsavedChanges}
                confirmResetDialog={confirmResetDialog}
              />
            </div>
          </div>
        </Transition>
        <div className="bg-base-200 rounded-box flex w-full flex-1 flex-col items-center justify-start md:h-full md:w-auto md:flex-auto md:grow dark:shadow">
          {!list.query.isFetching &&
          list.data != null &&
          displayList != null ? (
            <ol
              className={clsx(
                "flex min-h-0 w-full grow basis-0 flex-col gap-y-1.5 overflow-y-auto p-4",
                "rounded-box focus:outline-base-content focus:outline-2 focus:outline-offset-2",
              )}
            >
              {displayList.map((entry, i) => (
                <>
                  {dividerPositions.includes(i) && (
                    <ListDivider
                      key={i}
                      text={nameOfStatus(settings.listType.value, entry.status)}
                    />
                  )}
                  <li key={entry.id} className="w-full">
                    <ListEntry
                      settings={settings}
                      entry={entry}
                      draft={draft}
                      dispatch={dispatch}
                      ref={(el) => {
                        listEntryRefs.current[i] = el!;
                      }}
                      tab={(d) => {
                        listEntryRefs.current[i + d]?.focus({
                          preventScroll: true,
                        });
                      }}
                    />
                  </li>
                </>
              ))}
            </ol>
          ) : (
            <div className="dark:bg-base-200 rounded-box flex min-h-0 w-full grow basis-0 flex-col items-center justify-center gap-y-2 p-4 dark:shadow">
              {fetchError != null ? (
                <ErrorAlert type="NETWORK">
                  {fetchError.cause.status === 429 ? (
                    <div>
                      Too many requests were sent to AniList in a short amount
                      of time.
                      <br />
                      Please wait at least one minute, then refresh the page.
                    </div>
                  ) : fetchError.cause.status === 401 ||
                    fetchError.cause.status === 403 ? (
                    <div>
                      Could not log in to your account.
                      <br />
                      Please revoke the AniList Tools app from your account and
                      try again.
                    </div>
                  ) : fetchError.cause.status >= 500 ? (
                    <div>
                      AniList is not working at the moment.
                      <br />
                      Please try again later.
                    </div>
                  ) : (
                    <div>
                      An error occured fetching data from AniList:
                      <br />
                      {fetchError.cause.text ??
                        JSON.stringify(fetchError.cause.errors)}
                    </div>
                  )}
                </ErrorAlert>
              ) : viewer.data == null ? (
                <ErrorAlert type="AUTH">
                  Please login with AniList to use this tool.
                </ErrorAlert>
              ) : !list.query.isFetching &&
                list.query.isSuccess &&
                numUnsavedChanges == null ? (
                <ErrorAlert type="APP">
                  Your saved changes appear to be out-of-sync with your list.
                  <br />
                  Please refresh the page.
                </ErrorAlert>
              ) : (
                <span className="loading loading-bars loading-xl"></span>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

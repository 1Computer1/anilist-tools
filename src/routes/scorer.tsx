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
import { ListDivider, ListEntry } from "./-scorer/ListEntry";
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
      { title: "Anilist Tools - Scorer" },
      {
        name: "description",
        content:
          "Enhance your Anilist experience with various tools!\nQuickly apply new scores to your entire list.",
      },
    ],
  }),
});

export type ListDraftAction =
  | { t: "updateScore"; id: number; score: number }
  | { t: "reset" };

export type UserListOptions = Pick<
  typeof getList extends (ctx: Context, options: infer O) => any ? O : never,
  "type" | "statusIn" | "sort"
>;

function Scorer() {
  const queryClient = useQueryClient();

  const viewer = useAnilistQuery(["viewer"], getViewer, {
    staleTime: Infinity,
  });

  const settings = useSettings();

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

  const numUnsavedChanges =
    list.data == null
      ? null
      : (() => {
          try {
            return [...draft.entries()].filter(([k, v]) => {
              if (v.score == null || Number.isNaN(v.score)) {
                return false;
              }
              const before = list.data!.get(k);
              if (!before) {
                throw new Error("Could not find existing entry for draft");
              }
              return v.score !== before.score;
            }).length;
          } catch (err) {
            return null;
          }
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
  const confirmRefreshDialog = useDialog();
  const shortcutsDialog = useDialog();

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
            onClick: () => {
              confirmSaveDialog.close();
              mutSave.mutate(draft);
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
        Are you sure you want to update {numUnsavedChanges} of your ratings?
      </ChoicesDialog>
      <ChoicesDialog
        state={confirmRefreshDialog}
        title="Refresh List"
        choices={[
          {
            text: "Refresh",
            severity: "BAD",
            onClick: async () => {
              confirmRefreshDialog.close();
              await queryClient.invalidateQueries({
                queryKey: ["list", { type: listOptions.type }],
              });
              dispatch({ t: "reset" });
            },
          },
          {
            text: "Cancel",
            severity: "NORMAL",
            onClick: () => {
              confirmRefreshDialog.close();
            },
          },
        ]}
      >
        Are you sure you want to refresh?
        <br />
        Your unsaved changes will be lost.
      </ChoicesDialog>
      <CustomDialog title="Keyboard Shortcuts" state={shortcutsDialog}>
        <Shortcuts
          shortcuts={[
            { divider: "Navigation" },
            { keys: "Tab|↓", desc: "Go next" },
            { keys: "Shift+Tab|↑", desc: "Go back" },
            { divider: "Adjustments" },
            { keys: "→|=|+", desc: "+1 to score" },
            { keys: "←|-|_", desc: "-1 to score" },
            { divider: "Update" },
            { keys: "1...0", desc: "Set score to 10…100" },
            { keys: "y...p", desc: "Set score to 10, 30, 50, 70, 90" },
            { keys: "j...l", desc: "Set score to 35, 60, 85" },
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
              if (numUnsavedChanges != null && numUnsavedChanges > 0) {
                confirmRefreshDialog.open();
              } else {
                await queryClient.invalidateQueries({
                  queryKey: ["list", { type: listOptions.type }],
                });
                dispatch({ t: "reset" });
              }
            }}
          >
            <PiArrowClockwiseFill /> Refresh
          </Button>
          <Button
            className="btn btn-outline btn-success"
            disabled={numUnsavedChanges == null || numUnsavedChanges == 0}
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
                "focus:outline-base-content focus:outline-2 focus:outline-offset-2",
              )}
            >
              <SettingsItems
                viewer={viewer}
                dispatch={dispatch}
                settings={settings}
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
                "flex min-h-0 w-full grow basis-0 flex-col gap-y-2 overflow-y-auto p-4",
                "focus:outline-base-content focus:outline-2 focus:outline-offset-2",
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
                      Too many requests were sent to Anilist in a short amount
                      of time.
                      <br />
                      Please wait at least one minute, then refresh the page.
                    </div>
                  ) : fetchError.cause.status === 401 ||
                    fetchError.cause.status === 403 ? (
                    <div>
                      Could not log in to your account.
                      <br />
                      Please revoke the Anilist Tools app from your account and
                      try again.
                    </div>
                  ) : fetchError.cause.status >= 500 ? (
                    <div>
                      Anilist is not working at the moment.
                      <br />
                      Please try again later.
                    </div>
                  ) : (
                    <div>
                      An error occured fetching data from Anilist:
                      <br />
                      {fetchError.cause.text ??
                        JSON.stringify(fetchError.cause.errors)}
                    </div>
                  )}
                </ErrorAlert>
              ) : viewer.data == null ? (
                <ErrorAlert type="AUTH">
                  Please login with Anilist to use this tool.
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

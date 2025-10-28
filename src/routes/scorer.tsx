import { createFileRoute } from "@tanstack/react-router";
import { useAnilistMutation, useAnilistQuery } from "../hooks/anilist";
import { getList, type MediaType } from "../api/queries/list";
import { useImmer, useImmerReducer } from "use-immer";
import { Button, Select } from "@headlessui/react";
import { saveMediaListEntries, type ListDraft } from "../api/mutations/save";
import { useQueryClient } from "@tanstack/react-query";
import { getTokenUserId } from "../util/jwt";
import { getViewer } from "../api/queries/viewer";
import {
  PiArrowClockwiseFill,
  PiFloppyDiskFill,
  PiQuestionFill,
} from "react-icons/pi";
import { useDialog } from "../hooks/useDialog";
import ChoicesDialog from "../components/ChoicesDialog";
import { Shortcuts } from "../components/Shortcuts";
import { ListEntry } from "./-scorer/ListEntry";
import type { Context } from "../api/anilist";
import { ErrorAlert } from "../components/ErrorAlert";
import { useEffect, useRef } from "react";
import InfoDialog from "../components/InfoDialog";

export type ListDraftAction =
  | { t: "updateScore"; id: number; score: number }
  | { t: "reset" }
  | { t: "clean" };

export type UserListOptions = Pick<
  typeof getList extends (ctx: Context, options: infer O) => any ? O : never,
  "type" | "statusIn" | "sort"
>;

export const Route = createFileRoute("/scorer")({
  component: Scorer,
});

function Scorer() {
  const queryClient = useQueryClient();

  const viewer = useAnilistQuery(["viewer"], getViewer, {
    staleTime: Infinity,
  });

  const [listOptions, updateListOptions] = useImmer<UserListOptions>({
    type: "ANIME",
    statusIn: ["COMPLETED"],
    sort: ["SCORE_DESC"],
  });

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
              if (v.score == null) {
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

  const listEntryRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    listEntryRefs.current = Array.from({ length: list.data?.size ?? 0 });
  }, [list.data?.size]);

  return (
    <main className="flex h-full w-full flex-col items-center justify-start gap-2 px-2 xl:px-16">
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
      <InfoDialog title="Shortcuts" state={shortcutsDialog}>
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
            { keys: "y...p", desc: "Set score to 20, 40, 60, 80, 100" },
            { keys: "j...l", desc: "Set score to 35, 60, 85" },
            { keys: ".", desc: "Clear score value" },
            { keys: "/", desc: "Revert score to original" },
            { divider: "Other" },
            { keys: "Ctrl", desc: "Hold to update but stay on entry" },
            { keys: "`|Esc|⌫", desc: "Revert score and go back" },
          ]}
        />
      </InfoDialog>
      <h1 className="inline-flex flex-row items-center justify-center text-xl whitespace-pre xl:text-4xl">
        Scorer{" "}
        <Button
          className="btn btn-ghost btn-square btn-sm -mt-4 -ml-1 hidden size-6 text-base xl:inline-flex"
          onClick={() => shortcutsDialog.open()}
        >
          <PiQuestionFill />
        </Button>
      </h1>
      <div className="flex flex-row items-center justify-center gap-2">
        <Select
          className="select select-neutral pr-8"
          disabled={viewer.data == null}
          defaultValue={"ANIME"}
          onChange={(e) => {
            dispatch({ t: "reset" });
            updateListOptions((x) => {
              x.type = e.target.value as MediaType;
            });
          }}
        >
          <option value="ANIME">Anime</option>
          <option value="MANGA">Manga</option>
        </Select>
        <Button
          className="btn btn-outline btn-success"
          disabled={numUnsavedChanges == null || numUnsavedChanges == 0}
          onClick={() => {
            confirmSaveDialog.open();
          }}
        >
          <PiFloppyDiskFill /> Save
        </Button>
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
      </div>
      {!list.query.isFetching && list.data != null ? (
        <ol
          className="bg-base-200 flex min-h-0 w-full grow basis-0 flex-col gap-y-2 overflow-y-auto rounded-lg p-4 shadow"
          tabIndex={-1}
        >
          {[...list.data.values()].map((entry, i) => (
            <li key={entry.id} className="w-full">
              <ListEntry
                entry={entry}
                draft={draft}
                dispatch={dispatch}
                ref={(el) => {
                  listEntryRefs.current[i] = el!;
                }}
                tab={(d) => {
                  listEntryRefs.current[i + d]?.focus({ preventScroll: true });
                }}
              />
            </li>
          ))}
        </ol>
      ) : (
        <div className="bg-base-200 flex min-h-0 w-full grow basis-0 flex-col items-center justify-center gap-y-2 rounded-lg p-4 shadow">
          {fetchError != null ? (
            <ErrorAlert type="NETWORK">
              {fetchError.cause.status === 429 ? (
                <div>
                  Too many requests were sent to Anilist in a short amount of
                  time.
                  <br />
                  Please wait at least one minute, then refresh the page.
                </div>
              ) : fetchError.cause.status === 401 ||
                fetchError.cause.status === 403 ? (
                <div>
                  Could not log in to your account.
                  <br />
                  Please revoke the Anilist Tools app from your account and try
                  again.
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
    </main>
  );
}

import {
  useAnilistQuery,
  type UserListOptions,
  type UseAnilistQueryResult,
} from "../../hooks/anilist";
import { getList, type Entry, type List } from "../../api/queries/list";
import { Switch, Transition } from "@headlessui/react";
import { getTokenUserId } from "../../util/jwt";
import { getViewer, type Viewer } from "../../api/queries/viewer";
import { PiWrenchFill } from "react-icons/pi";
import { useDialog, type DialogState } from "../../hooks/useDialog";
import { Alert } from "../Alert";
import React, { Fragment, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useMediaQuery } from "usehooks-ts";
import * as _ from "lodash-es";
import { nameOfStatus } from "../../util/settings";
import ListDivider from "./ListDivider";
import type { ConfirmDialogContext } from "../dialogs/ConfirmDialog";
import ConfirmDialog from "../dialogs/ConfirmDialog";

export type LeftRightListInterfaceProps = {
  // Input props
  listOptions: UserListOptions;
  prepareListForDisplay: (list: List) => [Entry[], number[]];
  listEmpty?: (list: List) => React.ReactNode;
  // Input node props
  error: React.ReactNode | null;
  leftMenu: React.ReactNode;
  rightMenu: React.ReactNode;
  settingsItems: React.ReactNode;
  listEntry: (opts: {
    entry: Entry;
    ref: React.Ref<HTMLElement>;
    tab: (d: 1 | -1) => void;
  }) => React.ReactNode;
  children?: React.ReactNode;
  // Prepared props
  viewer: UseAnilistQueryResult<Viewer>;
  list: UseAnilistQueryResult<List>;
  confirmDialog: DialogState<ConfirmDialogContext>;
};

export function useLeftRightListInterface({
  listOptions,
}: {
  listOptions: UserListOptions;
}): Pick<
  LeftRightListInterfaceProps,
  "listOptions" | "viewer" | "list" | "confirmDialog"
> {
  const viewer = useAnilistQuery(["viewer"], getViewer, {
    staleTime: Infinity,
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

  const confirmDialog = useDialog<ConfirmDialogContext>({
    title: "",
    action: "",
    severity: "ERROR",
    message: "",
    onConfirm: () => {},
  });

  return { listOptions, viewer, list, confirmDialog };
}

export default function LeftRightListInterface({
  listOptions,
  prepareListForDisplay,
  listEmpty,
  error,
  leftMenu,
  rightMenu,
  settingsItems,
  listEntry,
  children,
  viewer,
  list,
  confirmDialog,
}: LeftRightListInterfaceProps) {
  const fetchError = viewer.query.error ?? list.query.error;

  const [displayList, dividerPositions] = list.data
    ? prepareListForDisplay(list.data)
    : [null, null];

  const listEntryRefs = useRef<HTMLElement[]>([]);
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
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row items-center justify-center gap-2">
          {leftMenu}
        </div>
        <div className="flex flex-row items-center justify-center gap-2">
          {rightMenu}
          {!md && (
            <>
              <Switch
                className="btn btn-square btn-ghost"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              >
                <PiWrenchFill className="size-6" />
              </Switch>
            </>
          )}
        </div>
      </div>
      <ConfirmDialog state={confirmDialog}></ConfirmDialog>
      {children}
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
                "flex min-h-0 w-full grow basis-0 flex-col justify-start gap-2 overflow-y-auto p-4 [scrollbar-width:thin]",
                "md:h-full md:w-44 md:max-w-sm md:min-w-44 md:resize-x lg:w-48 lg:max-w-md lg:min-w-48 xl:max-w-3xl",
                "rounded-box focus:outline-base-content focus:outline-2 focus:outline-offset-2",
              )}
            >
              {settingsItems}
            </div>
          </div>
        </Transition>
        <div className="bg-base-200 rounded-box flex w-full flex-1 flex-col items-center justify-start md:h-full md:w-auto md:flex-auto md:grow dark:shadow">
          {!list.query.isFetching &&
          list.data != null &&
          displayList != null ? (
            displayList.length ? (
              <ol
                className={clsx(
                  "flex min-h-0 w-full grow basis-0 flex-col gap-y-1.5 overflow-y-auto p-4",
                  "rounded-box focus:outline-base-content focus:outline-2 focus:outline-offset-2",
                )}
              >
                {displayList.map((entry, i) => (
                  <Fragment key={entry.id}>
                    {dividerPositions.includes(i) && (
                      <ListDivider
                        text={nameOfStatus(listOptions.type, entry.status)}
                      />
                    )}
                    <li className="w-full">
                      {listEntry({
                        entry,
                        ref: (el) => {
                          listEntryRefs.current[i] = el!;
                        },
                        tab: (d) => {
                          listEntryRefs.current[i + d]?.focus({
                            preventScroll: true,
                          });
                        },
                      })}
                    </li>
                  </Fragment>
                ))}
              </ol>
            ) : (
              <div className="dark:bg-base-200 rounded-box flex min-h-0 w-full grow basis-0 flex-col items-center justify-center gap-y-2 p-4 dark:shadow">
                {listEmpty?.(list.data)}
              </div>
            )
          ) : (
            <div className="dark:bg-base-200 rounded-box flex min-h-0 w-full grow basis-0 flex-col items-center justify-center gap-y-2 p-4 dark:shadow">
              {fetchError != null ? (
                <Alert type="NETWORK">
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
                      Please log out, revoke the ALter app from your account,
                      then try again.
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
                </Alert>
              ) : viewer.data == null ? (
                <Alert type="AUTH">
                  Please login with AniList to use this tool.
                </Alert>
              ) : !list.query.isFetching && list.query.isSuccess && error ? (
                <>{error}</>
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

import clsx from "clsx";
import { type Dispatch, type Ref } from "react";
import type { Entry, MediaListStatus } from "../../api/queries/list";
import type { DropperListDraft, DropperListDraftAction } from "../dropper";
import { useMediaQuery } from "usehooks-ts";
import type { DropperSettings } from "./dropperSettings";
import { getTitle, nameOfStatus } from "../../util/settings";
import { DateTime } from "luxon";
import { PiTrashFill } from "react-icons/pi";
import { Switch } from "@headlessui/react";
import { dateToString } from "../../util/date";

export default function DropperListEntry({
  entry,
  draft,
  dispatch,
  tab,
  settings,
  ref,
}: {
  entry: Entry;
  draft: DropperListDraft;
  dispatch: Dispatch<DropperListDraftAction>;
  tab: (d: 1 | -1) => void;
  settings: DropperSettings;
  ref: Ref<HTMLElement>;
}) {
  const oldStatus = entry.status;
  const newStatus = draft.get(entry.id)?.status ?? entry.status;

  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <div
      className={clsx(
        "bg-base-100 rounded-field min-h-10 w-full p-1.25 shadow-md dark:shadow",
        "grid grid-cols-[2.5rem_4.25rem_1.75rem_1fr] grid-rows-1 gap-1 [grid-template-areas:'img_status_drop_text']",
        "lg:grid-cols-[2.5rem_5rem_2rem_1fr] lg:gap-2",
        "focus:outline-primary focus:outline-2",
      )}
      tabIndex={0}
      ref={ref as any}
      onFocus={(e) => {
        e.target.querySelector(".scroll-helper")?.scrollIntoView({
          block: "nearest",
          behavior: reduceMotion ? "instant" : "smooth",
        });
      }}
      onKeyDown={(e) => {
        const update = (status?: MediaListStatus) => {
          dispatch({
            t: "updateStatus",
            id: entry.id,
            status,
          });
        };

        if (e.key === ".") {
          update("DROPPED");
          if (!e.ctrlKey) {
            tab(1);
          }
        } else if (e.key === "/") {
          update();
          if (!e.ctrlKey) {
            tab(1);
          }
        } else if (e.key === "ArrowDown" || e.key === "Enter") {
          tab(1);
        } else if (e.key === "ArrowUp") {
          tab(-1);
        } else if (
          e.key === "`" ||
          e.key === "Escape" ||
          e.key === "Backspace"
        ) {
          update();
          tab(-1);
        } else {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="flex h-full flex-row items-center justify-center self-center [grid-area:img]">
        <div className="relative h-0 w-0">
          <div className="scroll-helper absolute top-1/2 -mt-16 h-32 lg:-mt-48 lg:h-96"></div>
        </div>
        <a
          href={entry.media.siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
        >
          <div
            className="rounded-field h-10 w-10 bg-cover bg-center bg-no-repeat lg:h-10 lg:w-10"
            style={{
              backgroundImage: `url(${entry.media.coverImage.medium})`,
            }}
          ></div>
        </a>
      </div>
      <div className="flex-center text-xs [grid-area:status] lg:text-sm">
        <div className="opacity-50">
          {nameOfStatus(settings.listType.value, oldStatus)}
        </div>
        <div>{dateToString(DateTime.fromSeconds(entry.updatedAt))}</div>
      </div>
      <div
        className={clsx(
          "flex-center [grid-area:drop]",
          newStatus === "DROPPED" && "text-error",
        )}
      >
        <Switch
          checked={newStatus === "DROPPED"}
          ref={(e) => {
            if (e) {
              e.tabIndex = -1;
            }
          }}
          onChange={() => {
            dispatch({
              t: "updateStatus",
              id: entry.id,
              status: newStatus === "DROPPED" ? undefined : "DROPPED",
            });
          }}
          className="btn btn-ghost text-neutral data-checked:text-error size-fit p-0"
        >
          <PiTrashFill className="size-6 lg:size-7" />
        </Switch>
      </div>
      <div className="flex min-w-0 flex-col justify-center self-center justify-self-start p-1 [grid-area:text]">
        <p className="wrap-anywhere">
          {getTitle(entry, settings.titleLanguage.value)}
        </p>
      </div>
    </div>
  );
}

import clsx from "clsx";
import { type Dispatch, type Ref } from "react";
import { type Entry } from "../../api/queries/list";
import {
  dateToString,
  fuzzyDateToDate,
  fuzzyDateToString,
  isEqualDateWithFuzzyDate,
  isNonFuzzy,
} from "../../util/date";
import { useMediaQuery } from "usehooks-ts";
import type { FixerSettings } from "./fixerSettings";
import { getTitle, nameOfStatus } from "../../util/settings";
import { DateTime } from "luxon";
import { PiArrowFatRightFill, PiWarningCircleFill } from "react-icons/pi";
import type { FixerListDraft, FixerListDraftAction } from "../fixer";
import CustomDateInput from "../../components/CustomDateInput";
import CustomTooltip from "../../components/CustomTooltip";

export type FixerListEntryShow = {
  status: boolean;
  progress: boolean;
  dates: boolean;
};

export default function FixerListEntry({
  entry,
  draft,
  dispatch,
  tab,
  settings,
  show,
  ref,
}: {
  entry: Entry;
  draft: FixerListDraft;
  dispatch: Dispatch<FixerListDraftAction>;
  tab: (d: 1 | -1) => void;
  settings: FixerSettings;
  show: FixerListEntryShow;
  ref: Ref<HTMLElement>;
}) {
  const isAnime = settings.listType.value === "ANIME";

  const episodes = isAnime ? "episodes" : "chapters";
  const airing = isAnime ? "airing" : "releasing";

  const maxProgress = entry.media.episodes ?? entry.media.chapters;
  const mediaStartDate = isNonFuzzy(entry.media.startDate)
    ? DateTime.fromObject(entry.media.startDate).endOf("day")
    : null;
  const mediaEndDate = isNonFuzzy(entry.media.endDate)
    ? DateTime.fromObject(entry.media.endDate).endOf("day")
    : null;

  const newEntry = draft.get(entry.id)!;

  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <div
      className={clsx(
        "bg-base-100 rounded-field min-h-10 w-full p-1.25 shadow-md dark:shadow",
        "grid grid-cols-[2.5rem_1fr] grid-rows-[2.5rem_1fr] gap-1 [grid-template-areas:'img_text''data_data']",
        "lg:grid-cols-[2.5rem_1fr] lg:gap-2",
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
        if (e.key === ".") {
          dispatch({ t: "exclude", id: entry.id, exclude: false });
          dispatch({ t: "updateRecommended", id: entry.id });
          if (!e.ctrlKey) {
            tab(1);
          }
        } else if (e.key === "/") {
          dispatch({ t: "exclude", id: entry.id });
          if (!e.ctrlKey) {
            tab(1);
          }
        } else if (show.dates && e.key === "s") {
          dispatch({
            t: "update",
            id: entry.id,
            startedAt: mediaStartDate ?? undefined,
          });
          if (!e.ctrlKey) {
            tab(1);
          }
        } else if (show.dates && e.key === "d") {
          dispatch({
            t: "update",
            id: entry.id,
            startedAt: mediaStartDate ?? undefined,
            completedAt: mediaEndDate ?? undefined,
          });
          if (!e.ctrlKey) {
            tab(1);
          }
        } else if (show.dates && e.key === "f") {
          dispatch({
            t: "update",
            id: entry.id,
            completedAt: mediaEndDate ?? undefined,
          });
          if (!e.ctrlKey) {
            tab(1);
          }
        } else if (show.dates && "-_[{".includes(e.key)) {
          const [k, bound] = e.shiftKey
            ? (["completedAt", mediaEndDate] as const)
            : (["startedAt", mediaStartDate] as const);
          const before =
            newEntry[k] ?? fuzzyDateToDate(entry[k]) ?? mediaEndDate;
          if (before && bound) {
            let after = before.minus({ days: "[{".includes(e.key) ? 7 : 1 });
            if (after < bound) {
              after = bound;
            }
            dispatch({
              t: "update",
              id: entry.id,
              [k]: after,
            });
          }
          if (!e.ctrlKey) {
            tab(1);
          }
        } else if (show.dates && "+=]}".includes(e.key)) {
          const k = e.shiftKey ? "completedAt" : "startedAt";
          const before =
            newEntry[k] ?? fuzzyDateToDate(entry[k]) ?? mediaEndDate;
          if (before) {
            const after = before.plus({ days: "]}".includes(e.key) ? 7 : 1 });
            dispatch({
              t: "update",
              id: entry.id,
              [k]: after,
            });
          }
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
          dispatch({ t: "exclude", id: entry.id, exclude: false });
          dispatch({ t: "updateRecommended", id: entry.id });
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
      <div className="flex min-w-0 flex-col justify-center self-center justify-self-start p-1 [grid-area:text]">
        <p
          className={clsx(
            "wrap-anywhere",
            newEntry.exclude && "line-through opacity-50",
          )}
        >
          {getTitle(entry, settings.titleLanguage.value)}
        </p>
      </div>
      <ul className="flex flex-col gap-0.5 px-2 [grid-area:data]">
        {show.status && (
          <Change
            label={
              <CustomTooltip content={<>{entry.media.status}</>}>
                Status
              </CustomTooltip>
            }
            beforeBad={newEntry.statusBad && "Status is not valid"}
            before={nameOfStatus(settings.listType.value, entry.status)}
            afterChanged={
              newEntry.status != null && newEntry.status !== entry.status
            }
            after={nameOfStatus(
              settings.listType.value,
              newEntry.status ?? entry.status,
            )}
            exclude={!!newEntry.exclude}
          />
        )}
        {show.progress && maxProgress ? (
          <Change
            label={
              <CustomTooltip
                content={
                  <>
                    {maxProgress} total {isAnime ? "episode" : "chapter"}
                    {maxProgress > 0 ? "s" : ""}
                  </>
                }
              >
                Progress
              </CustomTooltip>
            }
            beforeBad={newEntry.progressBad && "Progress not same as total"}
            before={entry.progress}
            afterChanged={newEntry.progress !== entry.progress}
            after={newEntry.progress}
            exclude={!!newEntry.exclude}
          />
        ) : (
          <NoChange
            label="Progress"
            exclude={!!newEntry.exclude}
            text={`No ${episodes} data`}
          />
        )}
        {show.progress && entry.media.volumes ? (
          <Change
            label={
              <CustomTooltip
                content={
                  <>
                    {entry.media.volumes} total volume
                    {entry.media.volumes > 0 ? "s" : ""}
                  </>
                }
              >
                Volumes
              </CustomTooltip>
            }
            beforeBad={
              newEntry.progressVolumesBad && "Progress not same as total"
            }
            before={entry.progressVolumes}
            afterChanged={newEntry.progressVolumes !== entry.progressVolumes}
            after={newEntry.progressVolumes}
            exclude={!!newEntry.exclude}
          />
        ) : (
          <NoChange
            label="Volumes"
            exclude={!!newEntry.exclude}
            text="No volumes data"
          />
        )}
        {show.dates && (
          <Change
            label={
              <CustomTooltip
                content={
                  <>
                    {mediaStartDate ? (
                      <>
                        Started {airing} on {dateToString(mediaStartDate)}
                      </>
                    ) : (
                      <>No {airing} date</>
                    )}
                  </>
                }
              >
                Start Date
              </CustomTooltip>
            }
            beforeBad={
              newEntry.startedAtBad
                ? isNonFuzzy(entry.startedAt)
                  ? "Started too early"
                  : "Missing start date"
                : null
            }
            before={fuzzyDateToString(entry.startedAt)}
            afterChanged={
              newEntry.startedAt == null
                ? false
                : !isEqualDateWithFuzzyDate(newEntry.startedAt, entry.startedAt)
            }
            afterBad={
              newEntry.startedAt == null &&
              fuzzyDateToDate(entry.startedAt) == null &&
              (newEntry.status ?? entry.status) !== "PLANNING"
                ? "Cannot be blank"
                : newEntry.startedAt != null &&
                    (newEntry.completedAt != null ||
                      isNonFuzzy(entry.completedAt))
                  ? newEntry.startedAt >
                    (newEntry.completedAt ??
                      fuzzyDateToDate(entry.completedAt))!
                    ? "Cannot be after the finish date"
                    : mediaStartDate && newEntry.startedAt < mediaStartDate
                      ? `Cannot be before the ${airing} date`
                      : null
                  : null
            }
            after={
              (newEntry.status ?? entry.status) === "PLANNING" ? (
                "∅"
              ) : (
                <CustomDateInput
                  value={newEntry.startedAt ?? fuzzyDateToDate(entry.startedAt)}
                  disabled={!mediaStartDate}
                  min={mediaStartDate?.toISODate() ?? ""}
                  onChange={(value) => {
                    if (value < mediaStartDate!) {
                      value = mediaStartDate!;
                    }
                    dispatch({
                      t: "update",
                      id: entry.id,
                      startedAt: value,
                    });
                  }}
                  className="px-0.5 py-0.5 text-xs sm:text-sm lg:px-2"
                />
              )
            }
            exclude={!!newEntry.exclude}
          />
        )}
        {show.dates && (
          <Change
            label={
              <CustomTooltip
                content={
                  mediaEndDate ? (
                    <>
                      Finished {airing} on {dateToString(mediaEndDate)}
                    </>
                  ) : (
                    <>No finished {airing} date</>
                  )
                }
              >
                Finish Date
              </CustomTooltip>
            }
            beforeBad={
              newEntry.completedAtBad
                ? isNonFuzzy(entry.completedAt)
                  ? "Finished too early"
                  : "Missing finish date"
                : null
            }
            before={fuzzyDateToString(entry.completedAt)}
            afterChanged={
              newEntry.completedAt == null
                ? false
                : !isEqualDateWithFuzzyDate(
                    newEntry.completedAt,
                    entry.completedAt,
                  )
            }
            afterBad={
              newEntry.completedAt == null &&
              fuzzyDateToDate(entry.completedAt) == null &&
              (newEntry.status ?? entry.status) !== "PLANNING"
                ? "Cannot be blank"
                : newEntry.completedAt != null &&
                    (newEntry.startedAt != null || isNonFuzzy(entry.startedAt))
                  ? newEntry.completedAt <
                    (newEntry.startedAt ?? fuzzyDateToDate(entry.startedAt))!
                    ? "Cannot be before the start date"
                    : mediaEndDate && newEntry.completedAt < mediaEndDate
                      ? `Cannot be before the finished ${airing} date`
                      : null
                  : null
            }
            after={
              (newEntry.status ?? entry.status) === "PLANNING" ? (
                "∅"
              ) : (
                <CustomDateInput
                  value={
                    newEntry.completedAt ?? fuzzyDateToDate(entry.completedAt)
                  }
                  min={mediaEndDate?.toISODate() ?? ""}
                  disabled={!mediaEndDate}
                  onChange={(value) => {
                    if (value < mediaEndDate!) {
                      value = mediaEndDate!;
                    }
                    dispatch({
                      t: "update",
                      id: entry.id,
                      completedAt: value,
                    });
                  }}
                  className="px-0.5 py-0.5 text-xs sm:text-sm lg:px-2"
                />
              )
            }
            exclude={!!newEntry.exclude}
          />
        )}
      </ul>
    </div>
  );
}

function Change({
  label,
  before,
  beforeBad,
  after,
  afterBad,
  afterChanged = false,
  exclude,
}: {
  label: React.ReactNode;
  before: React.ReactNode;
  beforeBad: React.ReactNode;
  after: React.ReactNode;
  afterBad?: React.ReactNode;
  afterChanged?: boolean;
  exclude: boolean;
}) {
  return (
    <li className="flex h-7 w-full flex-row items-center justify-between gap-1 text-sm sm:justify-start lg:gap-2">
      <div className="flex grow flex-row items-center gap-1 sm:min-w-48 sm:grow-0 md:min-w-48 lg:gap-2">
        <div
          className={clsx(
            beforeBad ? "text-error" : "opacity-50",
            exclude && "line-through opacity-50",
          )}
        >
          {label}
        </div>
        <div className="border-neutral grow border-b border-dotted px-1"></div>
      </div>
      <div className="flex flex-row items-center gap-1">
        <div
          className={clsx(
            "sm:w-20",
            beforeBad ? "text-error" : "opacity-50",
            exclude && "line-through opacity-50",
          )}
        >
          {beforeBad ? (
            <CustomTooltip content={beforeBad}>{before}</CustomTooltip>
          ) : (
            before
          )}
        </div>
        {after && !exclude && (
          <div
            className={clsx(
              "flex flex-row items-center gap-1 lg:gap-2",
              !beforeBad && !afterChanged && "opacity-50",
              afterBad ? "text-warning" : afterChanged && "text-info",
            )}
          >
            {afterBad ? (
              <CustomTooltip content={afterBad}>
                <PiWarningCircleFill className="sm:size-4" />
              </CustomTooltip>
            ) : (
              <PiArrowFatRightFill className="sm:size-4" />
            )}
            <div className="flex flex-row items-center">{after}</div>
          </div>
        )}
      </div>
    </li>
  );
}

function NoChange({
  label,
  text,
  exclude,
}: {
  label: React.ReactNode;
  text: React.ReactNode;
  exclude: boolean;
}) {
  return (
    <li className="flex h-7 w-full flex-row items-center justify-between gap-1 text-sm sm:justify-start lg:gap-2">
      <div className="flex grow flex-row items-center gap-1 sm:min-w-48 sm:grow-0 md:min-w-48 lg:gap-2">
        <div className={clsx("opacity-50", exclude && "line-through")}>
          {label}
        </div>
        <div className="border-neutral grow border-b border-dotted px-1"></div>
      </div>
      <div className="flex flex-row items-center gap-1">
        <div className={clsx("opacity-50", exclude && "line-through")}>
          {text}
        </div>
      </div>
    </li>
  );
}

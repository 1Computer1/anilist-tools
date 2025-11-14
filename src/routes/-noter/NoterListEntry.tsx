import clsx from "clsx";
import { useState, type Dispatch, type Ref } from "react";
import type { Entry } from "../../api/queries/list";
import type { NoterListDraft, NoterListDraftAction } from "../noter";
import { useMediaQuery } from "usehooks-ts";
import type { NoterSettings } from "./noterSettings";
import { getTitle } from "../../util/settings";
import {
  PiClockCounterClockwiseFill,
  PiNotePencilFill,
  PiSwapFill,
} from "react-icons/pi";
import { Button } from "@headlessui/react";
import CodeEditor from "../../components/CodeEditor";
import { escapeHtml } from "../../util/starryNight";
import replaceEval from "../../util/replaceEval";

export default function NoterListEntry({
  entry,
  draft,
  dispatch,
  tab,
  settings,
  ref,
}: {
  entry: Entry;
  draft: NoterListDraft;
  dispatch: Dispatch<NoterListDraftAction>;
  tab: (d: 1 | -1) => void;
  settings: NoterSettings;
  ref: Ref<HTMLElement>;
}) {
  const newEntry = draft.get(entry.id);

  const isChanged = newEntry?.notes != null && newEntry.notes !== entry.notes;
  const [isHovering, setIsHovering] = useState(false);
  const hasReplacement =
    settings.noteFindRegexp.value != null &&
    settings.noteFindRegexpError.value == null;
  const isPreviewing =
    (settings.previewReplaceAll.value || isHovering) && hasReplacement;
  const oldClassName = clsx("bg-error/30 border-error border line-through");
  const newClassName = clsx("border-success bg-success/30 ml-px border");
  const foundClassName = clsx("bg-accent/30 border border-transparent");

  const [isBefore, setIsBefore] = useState(false);

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
        const update = (notes?: string) => {
          dispatch({
            t: "update",
            id: entry.id,
            notes,
          });
        };

        if (e.key === "r" && hasReplacement) {
          dispatch({ t: "replace", id: entry.id });
          if (!e.ctrlKey) {
            tab(1);
          }
        } else if (e.key === ".") {
          update("");
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
      <div className="flex min-w-0 flex-col justify-center self-center justify-self-start p-1 [grid-area:text]">
        <p className="wrap-anywhere">
          {getTitle(entry, settings.titleLanguage.value)}
        </p>
      </div>
      <div className="ml-0.75 flex flex-row items-center gap-1 pr-1 pb-1 [grid-area:data] md:gap-2">
        <Button
          className="btn btn-ghost not-disabled:text-secondary size-fit p-0.5"
          onMouseOver={() => {
            setIsHovering(true);
          }}
          onMouseLeave={() => {
            setIsHovering(false);
          }}
          onTouchStart={() => {
            setIsHovering(false);
          }}
          disabled={!hasReplacement}
          onClick={() => {
            dispatch({ t: "replace", id: entry.id });
          }}
        >
          <PiSwapFill className="size-6 lg:size-7" />
        </Button>
        <Button
          className="btn btn-ghost not-disabled:text-accent size-fit p-0.5"
          onMouseOver={() => {
            setIsBefore(true);
          }}
          onMouseLeave={() => {
            setIsBefore(false);
          }}
          onTouchStart={() => {
            setIsBefore(false);
          }}
          disabled={!isChanged}
          onClick={() => {
            setIsBefore(false);
            dispatch({
              t: "update",
              id: entry.id,
            });
          }}
        >
          {isChanged ? (
            <PiClockCounterClockwiseFill className="size-6 lg:size-7" />
          ) : (
            <PiNotePencilFill className="size-6 lg:size-7" />
          )}
        </Button>
        <CodeEditor
          value={newEntry?.notes ?? entry.notes}
          uneditable={isPreviewing || isBefore}
          className="font-sans"
          format={
            isPreviewing
              ? {
                  dangerouslySetInnerHTML: (src) => {
                    const regexp = settings.noteFindRegexp.value! as RegExp;
                    return src.replace(regexp, (...args) => {
                      const match = args[0];
                      const namedGroups =
                        typeof args.at(-1) === "object"
                          ? (args.at(-1) as Record<string, string>)
                          : undefined;
                      const groups = args.slice(
                        1,
                        namedGroups ? -3 : -2,
                      ) as string[];
                      const rep = settings.noteReplaceJavaScriptMode.value
                        ? replaceEval(
                            entry,
                            match,
                            regexp,
                            settings.noteReplace.value,
                          )
                        : settings.noteReplace.value.replaceAll(
                            /\$(?:(\d+)|<([A-Za-z0-9_]+)>|\&|\$)/g,
                            (sub, num, name) => {
                              if (sub === "$&") {
                                return match;
                              }
                              if (sub === "$$") {
                                return "$";
                              }
                              const i = num && parseInt(num, 10);
                              if (i) {
                                return groups[i - 1] ?? "";
                              }
                              return namedGroups?.[name] ?? "";
                            },
                          );
                      return (
                        `<span class="${oldClassName}">${escapeHtml(match)}</span>` +
                        (rep
                          ? `<span class="${newClassName}">${escapeHtml(rep)}</span>`
                          : "")
                      );
                    });
                  },
                }
              : isBefore
                ? () => entry.notes
                : settings.noteFindRegexp.value != null &&
                    settings.noteFindRegexpError.value == null
                  ? {
                      dangerouslySetInnerHTML: (src) => {
                        const regexp = settings.noteFindRegexp.value! as RegExp;
                        return src.replace(
                          regexp,
                          (match) =>
                            `<span class="${foundClassName}">${escapeHtml(match)}</span>`,
                        );
                      },
                    }
                  : undefined
          }
          onChange={(value) => {
            dispatch({ t: "update", id: entry.id, notes: value });
          }}
        />
      </div>
    </div>
  );
}

import { Input } from "@headlessui/react";
import clsx from "clsx";
import { type Dispatch, type Ref } from "react";
import {
  PiArrowFatLinesDownFill,
  PiArrowFatDownFill,
  PiArrowFatLinesUpFill,
  PiArrowFatUpFill,
  PiEraserFill,
  PiEqualsBold,
} from "react-icons/pi";
import type { ListDraft } from "../../api/mutations/save";
import type { Entry } from "../../api/queries/list";
import type { ListDraftAction } from "../scorer";

export function ListEntry({
  entry,
  draft,
  dispatch,
  tab,
  ref,
}: {
  entry: Entry;
  draft: ListDraft;
  dispatch: Dispatch<ListDraftAction>;
  tab: (d: 1 | -1) => void;
  ref: Ref<HTMLDivElement>;
}) {
  return (
    <div
      className={clsx(
        "bg-base-100 dark:bg-base-300 min-h-12 w-full rounded-lg p-1 shadow-md lg:min-h-16 dark:shadow",
        "grid grid-cols-[3rem_4rem_1rem_1fr] grid-rows-1 gap-2 [grid-template-areas:'img_score_oldscore_text']",
        "lg:grid-cols-[4rem_5rem_2rem_1fr] lg:grid-rows-1 lg:gap-2 lg:[grid-template-areas:'img_score_oldscore_text']",
        "focus:outline-primary focus:outline-2",
      )}
      tabIndex={0}
      ref={ref}
      onFocus={(e) => {
        e.target.querySelector(".scroll-helper")!.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }}
      onKeyDown={(e) => {
        const update = (f: (old: number) => number) =>
          dispatch({
            t: "updateScore",
            id: entry.id,
            score: f(draft.get(entry.id)?.score ?? entry.score),
          });

        const values: Record<string, number | null> = {
          0: 100,
          1: 10,
          2: 20,
          3: 30,
          4: 40,
          5: 50,
          6: 60,
          7: 70,
          8: 80,
          9: 90,
          y: 20,
          u: 40,
          i: 60,
          o: 80,
          p: 100,
          j: 35,
          k: 60,
          l: 85,
          ".": 0,
          "/": null,
        };

        if (e.key in values) {
          update(() => values[e.key] ?? entry.score);
          if (!e.ctrlKey) {
            tab(1);
          }
        } else if (e.key === "ArrowDown") {
          tab(1);
        } else if (e.key === "ArrowUp") {
          tab(-1);
        } else if (e.key === "ArrowLeft" || e.key === "-" || e.key === "_") {
          update((s) => Math.min(s - 1, 100));
        } else if (e.key === "ArrowRight" || e.key === "=" || e.key === "+") {
          update((s) => Math.min(s + 1, 100));
        } else if (
          e.key === "`" ||
          e.key === "Escape" ||
          e.key === "Backspace"
        ) {
          update((_) => entry.score);
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
            className="h-12 w-12 rounded-lg bg-cover bg-center bg-no-repeat lg:h-16 lg:w-16"
            style={{
              backgroundImage: `url(${entry.media.coverImage.medium})`,
            }}
          ></div>
        </a>
      </div>
      <Input
        type="number"
        className="input input-primary m-0 w-12 [appearance:textfield] place-self-center text-center [grid-area:score] lg:w-16 lg:text-lg"
        value={draft.get(entry.id)?.score ?? entry.score}
        min={0}
        max={100}
        step="any"
        tabIndex={-1}
        required
        onKeyDown={(e) => {
          e.stopPropagation();
          if (
            e.key === "e" ||
            e.key === "." ||
            e.key === "+" ||
            e.key === "-"
          ) {
            e.preventDefault();
          }
        }}
        onChange={(e) => {
          dispatch({
            t: "updateScore",
            id: entry.id,
            score: Math.max(0, Math.min(100, e.target.valueAsNumber || 0)),
          });
        }}
      />
      <div className="place-self-center [grid-area:oldscore]">
        {(() => {
          const newScore = draft.get(entry.id)?.score ?? entry.score;
          const d = entry.score - newScore;
          return (
            <>
              <div
                className={clsx(
                  "flex flex-col items-center justify-center text-xs lg:text-sm",
                  d === 0
                    ? "text-neutral"
                    : newScore === 0
                      ? "text-warning"
                      : d > 0
                        ? "text-error"
                        : "text-success",
                )}
              >
                {d == 0 ? (
                  <>
                    <div className="scale-75 lg:scale-100">
                      <PiEqualsBold />
                    </div>
                  </>
                ) : newScore === 0 ? (
                  <>
                    <div className="scale-75 lg:scale-100">
                      <PiEraserFill />
                    </div>
                    <div>{entry.score}</div>
                  </>
                ) : (
                  <>
                    <div>{d > 0 ? entry.score : newScore}</div>
                    <div className="scale-75 lg:scale-100">
                      {d >= 20 ? (
                        <PiArrowFatLinesDownFill />
                      ) : d > 0 ? (
                        <PiArrowFatDownFill />
                      ) : d <= -20 ? (
                        <PiArrowFatLinesUpFill />
                      ) : (
                        <PiArrowFatUpFill />
                      )}
                    </div>
                    <div>{d > 0 ? newScore : entry.score}</div>
                  </>
                )}
              </div>
            </>
          );
        })()}
      </div>
      <div className="flex min-w-0 flex-col justify-center self-center justify-self-start p-1 [grid-area:text] lg:h-16">
        <p className="wrap-anywhere">{entry.media.title.userPreferred}</p>
      </div>
    </div>
  );
}

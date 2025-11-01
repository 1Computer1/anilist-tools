import { Input, Radio, RadioGroup } from "@headlessui/react";
import clsx from "clsx";
import { useState, type Dispatch, type Ref } from "react";
import {
  PiArrowFatDownFill,
  PiArrowFatUpFill,
  PiEraserFill,
  PiEqualsBold,
  PiCaretDoubleDownFill,
  PiCaretDoubleUpFill,
  PiApproximateEqualsBold,
  PiStarFill,
  PiSmileyBold,
  PiSmileySadBold,
  PiSmileyMehBold,
} from "react-icons/pi";
import type { ListDraft } from "../../api/mutations/save";
import type { Entry } from "../../api/queries/list";
import type { ListDraftAction } from "../scorer";
import type { Settings } from "./Settings";
import type { ScoreFormat } from "../../api/queries/viewer";
import CustomTooltip from "../../components/CustomTooltip";

const NUMBER_SHORTCUTS: Record<ScoreFormat, number[]> = {
  POINT_100: [100, 10, 20, 30, 40, 50, 60, 70, 80, 90],
  POINT_10: [100, 10, 20, 30, 40, 50, 60, 70, 80, 90],
  POINT_10_DECIMAL: [100, 10, 20, 30, 40, 50, 60, 70, 80, 90],
  POINT_5: [0, 10, 30, 50, 70, 90],
  POINT_3: [0, 35, 60, 85],
};

export function ListEntry({
  entry,
  draft,
  dispatch,
  tab,
  settings,
  ref,
}: {
  entry: Entry;
  draft: ListDraft;
  dispatch: Dispatch<ListDraftAction>;
  tab: (d: 1 | -1) => void;
  settings: Settings;
  ref: Ref<HTMLDivElement>;
}) {
  const system = SCORE_SYSTEMS[settings.scoreFormat.value];

  return (
    <div
      className={clsx(
        "bg-base-100 rounded-field min-h-10 w-full p-1.25 shadow-md dark:shadow",
        system.type === "int" || system.type === "decimal"
          ? clsx(
              "grid grid-cols-[2.5rem_4rem_1.5rem_1fr] grid-rows-1 gap-1 [grid-template-areas:'img_score_oldscore_text']",
              "lg:grid-cols-[2.5rem_4.5rem_2rem_1fr] lg:grid-rows-1 lg:gap-2 lg:[grid-template-areas:'img_score_oldscore_text']",
            )
          : system.type === "stars"
            ? clsx(
                "grid grid-cols-[2.5rem_6.5rem_1.5rem_1fr] grid-rows-1 gap-1 [grid-template-areas:'img_score_oldscore_text']",
                "lg:grid-cols-[2.5rem_8.5rem_2rem_1fr] lg:grid-rows-1 lg:gap-2 lg:[grid-template-areas:'img_score_oldscore_text']",
              )
            : clsx(
                "grid grid-cols-[2.5rem_5rem_0.75rem_1fr] grid-rows-1 gap-1 [grid-template-areas:'img_score_oldscore_text']",
                "lg:grid-cols-[2.5rem_5rem_1rem_1fr] lg:grid-rows-1 lg:gap-2 lg:[grid-template-areas:'img_score_oldscore_text']",
              ),
        "focus:outline-primary focus:outline-2",
      )}
      tabIndex={0}
      ref={ref}
      onFocus={(e) => {
        e.target.querySelector(".scroll-helper")?.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }}
      onKeyDown={(e) => {
        const update = (f: (oldScoreDisplay: string) => string) => {
          const newScoreDisplay = f(
            draft.get(entry.id)?.scoreDisplay ?? system.fromRaw(entry.score),
          );
          dispatch({
            t: "updateScore",
            id: entry.id,
            score: system.toRaw(newScoreDisplay),
            scoreDisplay: newScoreDisplay,
          });
        };

        const values = NUMBER_SHORTCUTS[settings.scoreFormat.value];
        const n = parseInt(e.key, 10);
        if (values[n]) {
          update(() => system.fromRaw(values[n]!));
          if (!e.ctrlKey) {
            tab(1);
          }
        } else if (e.key === ".") {
          update(() => system.fromRaw(0));
          if (!e.ctrlKey) {
            tab(1);
          }
        } else if (e.key === "/") {
          dispatch({
            t: "updateScore",
            id: entry.id,
          });
          if (!e.ctrlKey) {
            tab(1);
          }
        } else if (e.key === "ArrowDown" || e.key === "Enter") {
          tab(1);
        } else if (e.key === "ArrowUp") {
          tab(-1);
        } else if (e.key === "ArrowLeft" || e.key === "-" || e.key === "_") {
          update((s) => system.step(s, -1));
        } else if (e.key === "ArrowRight" || e.key === "=" || e.key === "+") {
          update((s) => system.step(s, 1));
        } else if (
          e.key === "`" ||
          e.key === "Escape" ||
          e.key === "Backspace"
        ) {
          dispatch({
            t: "updateScore",
            id: entry.id,
          });
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
      {["POINT_100", "POINT_10_DECIMAL", "POINT_10"].includes(
        settings.scoreFormat.value,
      ) ? (
        <ScoreNumberInput
          draft={draft}
          dispatch={dispatch}
          entry={entry}
          system={system as any}
        />
      ) : (
        <ScoreIconsInput
          draft={draft}
          dispatch={dispatch}
          entry={entry}
          system={system as any}
        />
      )}
      <div className="flex min-w-0 flex-col justify-center self-center justify-self-start p-1 [grid-area:text]">
        <p className="wrap-anywhere">
          {
            {
              ENGLISH:
                entry.media.title.english ??
                entry.media.title.romaji ??
                entry.media.title.native,
              ROMAJI: entry.media.title.romaji ?? entry.media.title.native,
              NATIVE: entry.media.title.native,
            }[settings.titleLanguage.value]
          }
        </p>
      </div>
    </div>
  );
}

export function ListDivider({ text }: { text: string }) {
  return (
    <div className="divider my-1 w-full text-sm lg:my-2 lg:text-base">
      {text}
    </div>
  );
}

export type ScoreSystemType = "int" | "decimal" | "stars" | "smiley";

type ScoreProps<T extends ScoreSystemType = ScoreSystemType> = {
  dispatch: Dispatch<ListDraftAction>;
  draft: ListDraft;
  entry: Entry;
  system: ScoreSystem<T>;
};

export type ScoreSystem<T extends ScoreSystemType = ScoreSystemType> = {
  fromRaw: (vRaw: number) => string;
  toRaw: (vDisplay: string) => number;
  step: (vDisplay: string, dir: -1 | 1) => string;
  type: T;
};

const POINT_5_VALUES = [10, 30, 50, 70, 90];
const POINT_3_VALUES = [35, 60, 85];

export const SCORE_SYSTEMS = {
  POINT_100: {
    fromRaw: (x) => x.toString(),
    toRaw: (x) => Number(x),
    step: (x, d) => clamp(Number(x) + d, 0, 100).toString(),
    type: "int",
  } as ScoreSystem<"int">,

  POINT_10_DECIMAL: {
    fromRaw: (x) => (x / 10).toFixed(1),
    toRaw: (x) => Math.round(Number(x) * 10),
    step: (x, d) => clamp(Number(x) + d / 10, 0, 10).toFixed(1),
    type: "decimal",
  } as ScoreSystem<"decimal">,

  POINT_10: {
    fromRaw: (x) => Math.round(x / 10).toString(),
    toRaw: (x) => Number(x) * 10,
    step: (x, d) => clamp(Number(x) + d, 0, 10).toString(),
    type: "int",
  } as ScoreSystem<"int">,

  POINT_5: {
    fromRaw: (x) => nearest(x, POINT_5_VALUES).toString(),
    toRaw: (x) => Number(x),
    step: (x, d) => nearest(Number(x) + d * 20, POINT_5_VALUES).toString(),
    type: "stars",
  } as ScoreSystem<"stars">,

  POINT_3: {
    fromRaw: (x) => nearest(x, POINT_3_VALUES).toString(),
    toRaw: (x) => Number(x),
    step: (x, d) =>
      (
        ({
          0: { 0: 0, 35: 0, 60: 35, 85: 60 },
          2: { 0: 35, 35: 60, 60: 85, 85: 85 },
        }) as any
      )[d + 1][x]!.toString(),
    type: "smiley",
  } as ScoreSystem<"smiley">,
} as const;

function clamp(x: number, min: number, max: number) {
  return Math.min(max, Math.max(min, x));
}

function nearest(x: number, ys: number[]) {
  if (x <= 0) {
    return 0;
  }
  return ys.reduce((r, y) => (Math.abs(y - x) < Math.abs(r - x) ? y : r));
}

function ScoreNumberInput({
  dispatch,
  draft,
  entry,
  system,
}: ScoreProps<"int" | "decimal">) {
  const { fromRaw, toRaw, step, type } = system;
  const maxDisplay = fromRaw(100);
  const stepDisplay = step("0", 1);

  const newScore = draft.get(entry.id)?.score ?? entry.score;
  const newScoreDisplay =
    draft.get(entry.id)?.scoreDisplay ?? fromRaw(entry.score);

  const prevScore = entry.score;
  const prevScoreDisplay = fromRaw(entry.score);

  return (
    <>
      <Input
        type="number"
        className="input input-primary m-0 w-14 [appearance:textfield] place-self-center text-center [grid-area:score] lg:w-16 lg:text-lg"
        value={newScoreDisplay}
        min={0}
        max={maxDisplay}
        step={stepDisplay}
        tabIndex={-1}
        required
        onKeyDown={(e) => {
          e.stopPropagation();
          if (
            (type !== "decimal" && e.key === ".") ||
            e.key === "e" ||
            e.key === "+" ||
            e.key === "-"
          ) {
            e.preventDefault();
          }
        }}
        onChange={(e) => {
          const x = Math.max(0, Math.min(100, toRaw(e.target.value)));
          dispatch({
            t: "updateScore",
            id: entry.id,
            score: x,
            scoreDisplay: fromRaw(x),
          });
        }}
      />
      <OldScore
        newScore={newScore}
        newScoreDisplay={newScoreDisplay}
        prevScore={prevScore}
        prevScoreDisplay={prevScoreDisplay}
        system={system}
      />
    </>
  );
}

function ScoreIconsInput({
  dispatch,
  draft,
  entry,
  system,
}: ScoreProps<"stars" | "smiley">) {
  const { fromRaw, toRaw, type } = system;

  const newScore = draft.get(entry.id)?.score ?? entry.score;
  const newScoreDisplay =
    draft.get(entry.id)?.scoreDisplay ?? fromRaw(entry.score);

  const prevScore = entry.score;
  const prevScoreDisplay = fromRaw(entry.score);

  const [hoveredAt, setHoveredAt] = useState<number | null>(null);

  return (
    <>
      <RadioGroup
        className="flex flex-row items-center justify-center"
        value={newScoreDisplay}
        tabIndex={-1}
        onChange={(value) => {
          const x = Math.max(0, Math.min(100, toRaw(value)));
          dispatch({
            t: "updateScore",
            id: entry.id,
            score: x,
            scoreDisplay: fromRaw(x),
          });
        }}
      >
        {type === "stars"
          ? POINT_5_VALUES.map((n) => (
              <Radio
                key={n}
                value={n.toString()}
                data-filled={newScore >= n}
                onMouseOver={() => {
                  setHoveredAt(n);
                }}
                onMouseLeave={() => {
                  setHoveredAt(null);
                }}
                onTouchStart={() => {
                  setHoveredAt(null);
                }}
                className={clsx(
                  "btn btn-ghost size-fit p-0 hover:border-transparent hover:bg-transparent",
                  hoveredAt == null
                    ? newScore >= n
                      ? "text-yellow-600"
                      : "text-neutral"
                    : hoveredAt >= n
                      ? "text-yellow-600"
                      : "text-neutral",
                )}
              >
                <PiStarFill className="size-4.5 lg:size-6" />
              </Radio>
            ))
          : POINT_3_VALUES.map((n) => (
              <Radio
                key={n}
                value={n.toString()}
                className={clsx(
                  "btn btn-ghost text-neutral size-fit p-0",
                  n === 35
                    ? "data-checked:text-error"
                    : n === 60
                      ? "data-checked:text-warning"
                      : "data-checked:text-success",
                )}
              >
                {n === 35 ? (
                  <PiSmileySadBold className="size-6" />
                ) : n === 60 ? (
                  <PiSmileyMehBold className="size-6" />
                ) : (
                  <PiSmileyBold className="size-6" />
                )}
              </Radio>
            ))}
      </RadioGroup>
      <OldScore
        newScore={newScore}
        newScoreDisplay={newScoreDisplay}
        prevScore={prevScore}
        prevScoreDisplay={prevScoreDisplay}
        system={system}
      />
    </>
  );
}

function OldScore({
  newScore,
  newScoreDisplay,
  prevScore,
  prevScoreDisplay,
  system: { type, toRaw },
}: {
  newScore: number;
  newScoreDisplay: string;
  prevScore: number;
  prevScoreDisplay: string;
  system: ScoreSystem;
}) {
  const d = prevScore - newScore;

  const prevPerceived = toRaw(prevScoreDisplay);
  const newPerceived = toRaw(newScoreDisplay);
  const dPerceived = prevPerceived - newPerceived;
  const threshold = type === "smiley" ? 26 : 30;

  const icon =
    type === "int" || type === "decimal" ? (
      <>{prevScoreDisplay}</>
    ) : type === "stars" ? (
      <>
        {((prevScore - 10) / 20).toFixed(0)} <PiStarFill />
      </>
    ) : (
      <></>
    );

  return (
    <>
      <div
        className={clsx(
          "flex flex-col items-center justify-center text-xs lg:text-sm",
          d === 0
            ? "text-neutral"
            : newScore === 0 || newScoreDisplay == prevScoreDisplay
              ? "text-warning"
              : d > 0
                ? "text-error"
                : d < 0
                  ? "text-success"
                  : "text-neutral",
        )}
      >
        {d == 0 || Number.isNaN(d) ? (
          <PiEqualsBold />
        ) : newScore === 0 ? (
          <CustomTooltip
            content={
              <div className="flex-center w-[20ch] gap-y-2 text-center text-pretty">
                <p>This entry's score will be cleared.</p>
              </div>
            }
          >
            <div className="flex w-full flex-col items-center justify-center">
              <div>
                <PiEraserFill />
              </div>
              <div className="flex w-full flex-row items-center justify-center">
                {icon}
              </div>
            </div>
          </CustomTooltip>
        ) : newScoreDisplay == prevScoreDisplay ? (
          <CustomTooltip content={newScore}>
            <PiApproximateEqualsBold />
          </CustomTooltip>
        ) : (
          <CustomTooltip content={newScore}>
            <div className="flex w-full flex-col items-center justify-center">
              <div>
                {dPerceived >= threshold ? (
                  <PiCaretDoubleDownFill />
                ) : dPerceived >= 0 ? (
                  <PiArrowFatDownFill />
                ) : dPerceived <= -threshold ? (
                  <PiCaretDoubleUpFill />
                ) : (
                  <PiArrowFatUpFill />
                )}
              </div>
              <div className="flex w-full flex-row items-center justify-center">
                {icon}
              </div>
            </div>
          </CustomTooltip>
        )}
      </div>
    </>
  );
}

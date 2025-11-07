export type ScoreSystemType = "int" | "decimal" | "stars" | "smiley";

export type ScoreSystem<T extends ScoreSystemType = ScoreSystemType> = {
  fromRaw: (vRaw: number) => string;
  toRaw: (vDisplay: string) => number;
  step: (vDisplay: string, dir: -1 | 1) => string;
  stepLarge?: (vDisplay: string, dir: -1 | 1) => string;
  type: T;
};

export const POINT_5_VALUES = [10, 30, 50, 70, 90];

export const POINT_3_VALUES = [35, 60, 85];

export const SCORE_SYSTEMS = {
  POINT_100: {
    fromRaw: (x) => x.toString(),
    toRaw: (x) => Number(x),
    step: (x, d) => clamp(Number(x) + d, 0, 100).toString(),
    stepLarge: (x, d) => clamp(Number(x) + d * 5, 0, 100).toString(),
    type: "int",
  } as ScoreSystem<"int">,

  POINT_10_DECIMAL: {
    fromRaw: (x) => {
      const n = x / 10;
      const s = n.toFixed(1);
      return s.replace(/\.0/, "");
    },
    toRaw: (x) => Math.round(Number(x) * 10),
    step: (x, d) => {
      const n = clamp(Number(x) + d / 10, 0, 10);
      const s = n.toFixed(1);
      return s.replace(/\.0/, "");
    },
    stepLarge: (x, d) => {
      const n = clamp(Number(x) + (d * 5) / 10, 0, 10);
      const s = n.toFixed(1);
      return s.replace(/\.0/, "");
    },
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

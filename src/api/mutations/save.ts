import type { DateTime } from "luxon";
import { postQuery, type Context } from "../anilist";
import type { MediaListStatus } from "../queries/list";
import { dateToFuzzyDate } from "../../util/date";
import { withListActivityDisabled } from "../queries/viewer";

export type EntryDraft = Partial<{
  score: number;
  status: MediaListStatus;
  startedAt: DateTime;
  completedAt: DateTime;
  progress: number | null;
  progressVolumes: number | null;
}>;

// S = Things that can be updated
// X = Additional non-updated fields
export type ListDraft<S extends keyof EntryDraft, X extends object = {}> = Map<
  number,
  Pick<EntryDraft, S> & Partial<X>
>;

export type ValueOf<T> = T extends Map<any, infer V> ? V : never;

const makeMutation = (i: number, mutArgs: string[]) => `
  update${i}: SaveMediaListEntry(${mutArgs.join(", ")}) {
    id
  }
`;

const makeQuery = (
  queryVars: string[],
  mutations: string[][],
) => `mutation (${queryVars.join(", ")}) {
  ${mutations.map((mutArgs, i) => makeMutation(i, mutArgs)).join("\n")}
}`;

function makeMutationQuery(
  draft: [number, Pick<EntryDraft, keyof EntryDraft>][],
): {
  query: string;
  vars: Record<string, any>;
} {
  const queryVars: string[] = [];
  const mutations: string[][] = [];
  const vars: Record<string, any> = {};

  for (const [k, v] of draft) {
    const empty = Object.keys(v).length == 0;
    if (!empty) {
      const mutArgs: string[] = [];

      function add<T>(
        k: number,
        v: NonNullable<T>,
        name: string,
        type: string,
      ) {
        vars[`${name}${k}`] = v;
        queryVars.push(`$${name}${k}: ${type}`);
        mutArgs.push(`${name}: $${name}${k}`);
      }

      if (v.score != null && !Number.isNaN(v.score)) {
        add(k, v.score, "scoreRaw", "Int");
      }

      if (v.status != null) {
        add(k, v.status, "status", "MediaListStatus");
      }

      if (v.startedAt != null) {
        add(k, dateToFuzzyDate(v.startedAt), "startedAt", "FuzzyDateInput");
      }

      if (v.completedAt != null) {
        add(k, dateToFuzzyDate(v.completedAt), "completedAt", "FuzzyDateInput");
      }

      if (v.progress != null) {
        add(k, v.progress, "progress", "Int");
      }

      if (v.progressVolumes != null) {
        add(k, v.progressVolumes, "progressVolumes", "Int");
      }

      if (mutArgs.length) {
        vars[`entry${k}`] = k;
        queryVars.push(`$entry${k}: Int`);
        mutArgs.push(`id: $entry${k}`);
        mutations.push(mutArgs);
      }
    }
  }
  return { query: makeQuery(queryVars, mutations), vars };
}

function chunksOf<T>(xs: T[], size: number): T[][] {
  const ys = [];
  for (let i = 0; i < xs.length; i += size) {
    ys.push(xs.slice(i, i + size));
  }
  return ys;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DRY = false;

export const saveMediaListEntries = async (
  ctx: Context,
  draft: ListDraft<keyof EntryDraft>,
) => {
  // Anilist API has a max complexity of 500, which seems to be fine if we chunk
  // the queries to 100 entries updated per (assuming only a few fields are updated each).
  const chunks = chunksOf([...draft], 100);
  await withListActivityDisabled(ctx, async () => {
    for (let i = 0; i < chunks.length; i++) {
      const { query, vars } = makeMutationQuery(chunks[i]);
      if (DRY) {
        console.log(query, vars);
      } else {
        await postQuery(ctx, query, vars);
      }
      // There's a ratelimit of 30 requests per minute and a burst limit,
      // so if we're sending a bunch, wait 2 seconds between each.
      if (chunks.length > 10 && i !== chunks.length - 1) {
        await wait(60_000 / 30);
      }
    }
  });
};

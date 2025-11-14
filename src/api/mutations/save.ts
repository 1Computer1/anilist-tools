import type { DateTime } from "luxon";
import { postQuery, type Context } from "../anilist";
import type { MediaListStatus } from "../queries/list";
import { dateToFuzzyDate } from "../../util/date";
import { withListActivityDisabled } from "../queries/viewer";
import * as _ from "lodash-es";

export type EntryDraft = Partial<{
  score: number;
  status: MediaListStatus;
  startedAt: DateTime;
  completedAt: DateTime;
  progress: number | null;
  progressVolumes: number | null;
  notes: string;
}>;

// S = Things that can be updated
// X = Additional non-updated fields
export type ListDraft<S extends keyof EntryDraft, X extends object = {}> = Map<
  number,
  Pick<EntryDraft, S> & Partial<X>
>;

export type ValueOf<T> = T extends Map<any, infer V> ? V : never;

function makeMutationData(
  id: number,
  d: Pick<EntryDraft, keyof EntryDraft>,
): {
  vars: Record<string, any>;
  queryVars: string[];
  mutArgs: string[];
  hasActivityUpdate: boolean;
} | null {
  const empty = Object.keys(d).length == 0;
  if (empty) {
    return null;
  }

  const vars: Record<string, any> = {};
  const queryVars: string[] = [];
  const mutArgs: string[] = [];
  let hasActivityUpdate = false;

  function add<T>(v: NonNullable<T>, name: string, type: string) {
    vars[`${name}${id}`] = v;
    queryVars.push(`$${name}${id}: ${type}`);
    mutArgs.push(`${name}: $${name}${id}`);
  }

  if (d.score != null && !Number.isNaN(d.score)) {
    add(d.score, "scoreRaw", "Int");
  }

  if (d.status != null) {
    add(d.status, "status", "MediaListStatus");
    hasActivityUpdate = true;
  }

  if (d.startedAt != null) {
    add(dateToFuzzyDate(d.startedAt), "startedAt", "FuzzyDateInput");
  }

  if (d.completedAt != null) {
    add(dateToFuzzyDate(d.completedAt), "completedAt", "FuzzyDateInput");
  }

  if (d.progress != null) {
    add(d.progress, "progress", "Int");
    hasActivityUpdate = true;
  }

  if (d.progressVolumes != null) {
    add(d.progressVolumes, "progressVolumes", "Int");
  }

  if (d.notes != null) {
    add(d.notes, "notes", "String");
  }

  if (!mutArgs.length) {
    return null;
  }

  vars[`entry${id}`] = id;
  queryVars.push(`$entry${id}: Int`);
  mutArgs.push(`id: $entry${id}`);
  return { vars, queryVars, mutArgs, hasActivityUpdate };
}

const DRY = false;

export const saveMediaListEntries = async (
  ctx: Context,
  draft: ListDraft<keyof EntryDraft>,
) => {
  const mutData = [...draft]
    .map(([k, v]) => makeMutationData(k, v))
    .filter((x) => x != null);
  const hasActivityUpdate = mutData.some((x) => x.hasActivityUpdate);

  // Anilist API has a max complexity of 500, which seems to be fine if we chunk
  // the queries to 100 entries updated per (assuming only a few fields are updated each).
  const mutations = _.chunk(mutData, 100).map((chunk) => ({
    query: makeMutation(
      chunk.flatMap((x) => x.queryVars),
      chunk.map((x) => x.mutArgs),
    ),
    vars: _.assign({}, ...chunk.map((x) => x.vars)),
  }));

  const run = async () => {
    for (let i = 0; i < mutations.length; i++) {
      const { query, vars } = mutations[i];
      if (DRY) {
        console.log(query, vars);
      } else {
        await postQuery(ctx, query, vars);
      }
      // There's a ratelimit of 30 requests per minute and a burst limit,
      // so if we're sending a bunch, wait 2 seconds between each.
      if (mutations.length > 10 && i !== mutations.length - 1) {
        await wait(60_000 / 30);
      }
    }
  };
  if (hasActivityUpdate) {
    await withListActivityDisabled(ctx, run);
  } else {
    await run();
  }
};

const makeMutation = (
  queryVars: string[],
  updates: string[][],
) => `mutation (${queryVars.join(", ")}) {
  ${updates.map((mutArgs, i) => makeUpdate(i, mutArgs)).join("\n  ")}
}`;

const makeUpdate = (
  i: number,
  mutArgs: string[],
) => `update${i}: SaveMediaListEntry(${mutArgs.join(", ")}) {
  id
}`;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

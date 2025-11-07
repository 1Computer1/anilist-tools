import { postQuery, type Context } from "../anilist";
import type { MediaListStatus } from "../queries/list";

export type EntryDraft = Partial<{
  score: number;
  scoreDisplay: string;
  status: MediaListStatus;
}>;

export type ListDraft<S extends keyof EntryDraft> = Map<
  number,
  Pick<EntryDraft, S>
>;

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

  function add<T>(
    k: number,
    v: NonNullable<T>,
    name: string,
    type: string,
    mutArgs: string[],
  ) {
    vars[`${name}${k}`] = v;
    queryVars.push(`$${name}${k}: ${type}`);
    mutArgs.push(`${name}: $${name}${k}`);
  }

  for (const [k, v] of draft) {
    const empty = Object.keys(v).length == 0;
    if (!empty) {
      const mutArgs: string[] = [];

      if (v.score != null && !Number.isNaN(v.score)) {
        add(k, v.score, "scoreRaw", "Int", mutArgs);
      }

      if (v.status != null) {
        add(k, v.status, "status", "MediaListStatus", mutArgs);
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

export const saveMediaListEntries = async (
  ctx: Context,
  draft: ListDraft<keyof EntryDraft>,
) => {
  // Anilist API has a max complexity of 500, which seems to be fine if we chunk
  // the queries to 100 entries updated per (assuming only a few fields are updated each).
  const chunks = chunksOf([...draft], 100);
  for (let i = 0; i < chunks.length; i++) {
    const { query, vars } = makeMutationQuery(chunks[i]);
    await postQuery(ctx, query, vars);
    // There's a ratelimit of 30 requests per minute and a burst limit,
    // so if we're sending a bunch, wait 2 seconds between each.
    if (chunks.length > 10 && i !== chunks.length - 1) {
      await wait(60_000 / 30);
    }
  }
};

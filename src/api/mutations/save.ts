import { postQuery, type Context } from "../anilist";

export type EntryDraft = Partial<{ score: number }>;
export type ListDraft = Map<number, EntryDraft>;

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

function makeMutationQuery(draft: ListDraft): {
  query: string;
  vars: Record<string, any>;
} {
  const queryVars: string[] = [];
  const mutations: string[][] = [];
  const vars: Record<string, any> = {};
  for (const [k, v] of draft) {
    const empty = Object.keys(v).length == 0;
    if (!empty) {
      queryVars.push(`$entry${k}: Int`);
      vars[`entry${k}`] = k;

      const mutArgs: string[] = [];
      mutations.push(mutArgs);
      mutArgs.push(`id: $entry${k}`);

      if (v.score != null && !Number.isNaN(v.score)) {
        vars[`scoreRaw${k}`] = v.score;
        queryVars.push(`$scoreRaw${k}: Int`);
        mutArgs.push(`scoreRaw: $scoreRaw${k}`);
      }
    }
  }
  return { query: makeQuery(queryVars, mutations), vars };
}

export const saveMediaListEntries = async (ctx: Context, draft: ListDraft) => {
  const { query, vars } = makeMutationQuery(draft);
  await postQuery(ctx, query, vars);
};

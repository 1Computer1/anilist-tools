export const ANILIST_API_URL = "https://graphql.anilist.co";

export type Context = { token: string; signal?: AbortSignal };

export function query<
  TRet,
  TVar extends Record<string, any> | undefined = undefined,
>(
  query: string,
  select: (ret: any) => TRet,
): TVar extends Record<string, any>
  ? (ctx: Context, variables: TVar) => Promise<TRet>
  : (ctx: Context) => Promise<TRet> {
  // @ts-expect-error
  return async (ctx, variables) => {
    const ret = await postQuery<TRet>(ctx, query, variables);
    return select ? select(ret) : ret;
  };
}

export async function postQuery<T>(
  ctx: Context,
  query: string,
  variables?: Record<string, any>,
): Promise<T> {
  const res = await fetch(ANILIST_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${ctx.token}`,
    },
    body: JSON.stringify({ query, variables }, (_, x) =>
      x != null ? x : undefined,
    ),
    signal: ctx.signal,
  });
  const body = await res.text();
  let json = null;
  try {
    json = await JSON.parse(body);
  } catch {}
  if (!res.ok) {
    if (json && json.errors) {
      throw new Error("Anilist API returned error.", {
        cause: { status: res.status, errors: json.errors },
      });
    }
    throw new Error("Failed to fetch from API.", {
      cause: { status: res.status, text: body },
    });
  }
  return json.data;
}

export type AnilistError = Error & {
  cause: {
    status: number;
    text?: string;
    errors?: { message: string; status: number }[];
  };
};

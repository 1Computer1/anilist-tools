import { type AnilistError, type Context } from "../api/anilist";
import useAccessToken from "./useAccessToken";
import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { isTokenExpired } from "../util/jwt";
import type { getList } from "../api/queries/list";

export type QueryOptions<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends [string, Record<string, unknown>?],
> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  "queryKey" | "queryFn"
>;

export type UseAnilistQueryResult<TData, TError = AnilistError> = {
  data: TData | undefined;
  query: UseQueryResult<TData, TError>;
};

export function useAnilistQuery<
  TQueryKey extends [string, Record<string, unknown>?],
  TQueryFnData,
  TError = AnilistError,
  TData = TQueryFnData,
>(
  queryKey: TQueryKey,
  fetcher: (ctx: Context, signal: AbortSignal) => Promise<TQueryFnData>,
  options?: QueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseAnilistQueryResult<TData, TError> {
  const { token } = useAccessToken();
  const enabled = token !== "" && !isTokenExpired(token);
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => fetcher({ token, signal }, signal),
    retry: 0,
    ...options,
    enabled: (options?.enabled ?? true) && enabled,
  });
  return { data: enabled ? query.data : undefined, query };
}

export function useAnilistMutation<TData, TVars, TError = AnilistError>(
  fetcher: (ctx: Context, vars: TVars) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVars>,
) {
  const { token } = useAccessToken();
  return useMutation<TData, TError, TVars>({
    mutationFn: (vars) => fetcher({ token }, vars),
    ...options,
  });
}

export type UserListOptions = Pick<
  typeof getList extends (ctx: Context, options: infer O) => any ? O : never,
  "type" | "statusIn" | "sort"
>;

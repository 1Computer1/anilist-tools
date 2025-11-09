import type { MediaType, MediaListStatus } from "../../api/queries/list";
import type { TitleLanguage, ScoreFormat } from "../../api/queries/viewer";
import useCell from "../../hooks/useCell";
import { type SortBy, type SortDir, seedgen } from "../../util/settings";

export type ScorerSettings = ReturnType<typeof useScorerSettings>;

export function useScorerSettings() {
  return {
    listType: useCell<MediaType>("ANIME"),
    allowedStatuses: useCell<MediaListStatus[]>(["COMPLETED"]),
    sortBy: useCell<SortBy>("score"),
    sortDir: useCell<SortDir>("desc"),
    randomSeed: useCell<number>(seedgen()),
    titleFilter: useCell<string>(""),
    titleLanguage: useCell<TitleLanguage>("ENGLISH"),
    scoreFormat: useCell<ScoreFormat>("POINT_100"),
    hideScore: useCell<boolean>(false),
  } as const;
}

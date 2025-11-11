import {
  MEDIA_LIST_STATUSES,
  type MediaListStatus,
  type MediaType,
} from "../../api/queries/list";
import type { TitleLanguage } from "../../api/queries/viewer";
import useCell from "../../hooks/useCell";
import { type SortBy, type SortDir, seedgen } from "../../util/settings";

export type FixerSettings = ReturnType<typeof useFixerSettings>;

export function useFixerSettings() {
  return {
    listType: useCell<MediaType>("ANIME"),
    filter: useCell<string>(""),
    titleLanguage: useCell<TitleLanguage>("ENGLISH"),
    allowedStatuses: useCell<MediaListStatus[]>(MEDIA_LIST_STATUSES),
    sortBy: useCell<SortBy>("score"),
    sortDir: useCell<SortDir>("desc"),
    randomSeed: useCell<number>(seedgen()),
    fixes: {
      invalidStatus: useCell<boolean>(true),
      invalidProgress: useCell<boolean>(true),
      invalidStartDate: useCell<boolean>(true),
      invalidEndDate: useCell<boolean>(true),
      missingStartDate: useCell<boolean>(true),
      missingEndDate: useCell<boolean>(true),
      allDates: useCell<boolean>(false),
    },
  } as const;
}

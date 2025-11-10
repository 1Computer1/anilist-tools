import type { MediaType } from "../../api/queries/list";
import type { TitleLanguage } from "../../api/queries/viewer";
import useCell from "../../hooks/useCell";
import { type SortBy, type SortDir, seedgen } from "../../util/settings";

export type DropperSettings = ReturnType<typeof useDropperSettings>;

export function useDropperSettings() {
  return {
    listType: useCell<MediaType>("ANIME"),
    filter: useCell<string>(""),
    titleLanguage: useCell<TitleLanguage>("ENGLISH"),
    sortBy: useCell<SortBy>("lastUpdated"),
    sortDir: useCell<SortDir>("asc"),
    randomSeed: useCell<number>(seedgen()),
  } as const;
}

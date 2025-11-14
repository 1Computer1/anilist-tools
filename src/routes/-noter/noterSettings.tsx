import { useEffect } from "react";
import {
  MEDIA_LIST_STATUSES,
  type MediaListStatus,
  type MediaType,
} from "../../api/queries/list";
import type { TitleLanguage } from "../../api/queries/viewer";
import useCell from "../../hooks/useCell";
import { type SortBy, type SortDir, seedgen } from "../../util/settings";

export type NoterSettings = ReturnType<typeof useNoterSettings>;

export type RegExpFlag = "g" | "m" | "i" | "y" | "u" | "v" | "s";

export const REGEXP_FLAGS: RegExpFlag[] = ["g", "m", "i", "y", "u", "v", "s"];

export function nameOfRegExpFlag(s: RegExpFlag) {
  return {
    g: "Global",
    m: "Multi Line",
    i: "Insensitive",
    y: "Sticky",
    u: "Unicode",
    v: "Unicode+",
    s: "Single Line",
  }[s];
}

export function useNoterSettings() {
  const settings = {
    listType: useCell<MediaType>("ANIME"),
    filter: useCell<string>(""),
    noteFind: useCell<string>(""),
    noteFindFlags: useCell<RegExpFlag[]>(["g", "m"]),
    noteFindRegexp: useCell<RegExp | null>(null),
    noteFindRegexpError: useCell<SyntaxError | null>(null),
    hideUnmatched: useCell<boolean>(true),
    noteReplace: useCell<string>(""),
    noteReplaceJavaScriptMode: useCell<boolean>(false),
    previewReplaceAll: useCell<boolean>(false),
    titleLanguage: useCell<TitleLanguage>("ENGLISH"),
    allowedStatuses: useCell<MediaListStatus[]>(MEDIA_LIST_STATUSES),
    sortBy: useCell<SortBy>("score"),
    sortDir: useCell<SortDir>("desc"),
    randomSeed: useCell<number>(seedgen()),
  } as const;

  useEffect(() => {
    try {
      settings.noteFindRegexp.set(
        settings.noteFind.value
          ? new RegExp(
              settings.noteFind.value,
              settings.noteFindFlags.value.join(""),
            )
          : null,
      );
      settings.noteFindRegexpError.set(null);
    } catch (err) {
      settings.noteFindRegexpError.set(err as SyntaxError);
    }
  }, [settings.noteFind.value]);

  return settings;
}

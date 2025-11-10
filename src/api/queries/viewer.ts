import { postQuery, query, type Context } from "../anilist";
import { MEDIA_LIST_STATUSES, type MediaListStatus } from "./list";

export type ProfileColor =
  | "blue"
  | "purple"
  | "pink"
  | "orange"
  | "red"
  | "green"
  | "gray";

export type TitleLanguage = "ROMAJI" | "ENGLISH" | "NATIVE";

export const TITLE_LANGUAGES: TitleLanguage[] = ["ROMAJI", "ENGLISH", "NATIVE"];

export type ScoreFormat =
  | "POINT_100"
  | "POINT_10_DECIMAL"
  | "POINT_10"
  | "POINT_5"
  | "POINT_3";

export const SCORE_FORMATS: ScoreFormat[] = [
  "POINT_100",
  "POINT_10_DECIMAL",
  "POINT_10",
  "POINT_5",
  "POINT_3",
];

export type Viewer = {
  id: number;
  name: string;
  avatar: {
    large: string;
    medium: string;
  };
  siteUrl: string;
  options: {
    profileColor: ProfileColor;
    titleLanguage: TitleLanguage;
  };
  mediaListOptions: {
    scoreFormat: ScoreFormat;
  };
};

const QUERY_VIEWER = `query {
  Viewer {
    id,
    name
    avatar {
      large
      medium
    }
    siteUrl
    options {
      profileColor
      titleLanguage
      disabledListActivity {
        disabled
        type
      }
    }
    mediaListOptions {
      scoreFormat
    }
  }
}`;

export const getViewer = query<Viewer>(QUERY_VIEWER, (x) => {
  x.Viewer.options.titleLanguage = x.Viewer.options.titleLanguage.split("_")[0];
  return x.Viewer;
});

export type DisabledListActivity = {
  disabled: boolean;
  type: MediaListStatus;
}[];

const QUERY_DISABLED_LIST_ACTIVITY = `query {
  Viewer {
    options {
      disabledListActivity {
        disabled
        type
      }
    }
  }
}`;

export const getDisabledListActivity = query<DisabledListActivity>(
  QUERY_DISABLED_LIST_ACTIVITY,
  (x) => {
    return x.Viewer.options.disabledListActivity;
  },
);

const MUTATE_DISABLED_LIST_ACTIVITY = `mutation UpdateUser($disabledListActivity: [ListActivityOptionInput]) {
  UpdateUser(disabledListActivity: $disabledListActivity) {
    options {
      disabledListActivity {
        disabled
        type
      }
    }
  }
}`;

export async function withListActivityDisabled<T>(
  ctx: Context,
  run: () => Promise<T>,
): Promise<T> {
  const prev = await getDisabledListActivity(ctx);
  await postQuery(ctx, MUTATE_DISABLED_LIST_ACTIVITY, {
    disabledListActivity: MEDIA_LIST_STATUSES.map((s) => ({
      disabled: true,
      type: s,
    })),
  });
  try {
    const res = await run();
    return res;
  } finally {
    await postQuery(ctx, MUTATE_DISABLED_LIST_ACTIVITY, {
      disabledListActivity: prev,
    });
  }
}

import { query } from "../anilist";

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

const Query = `query {
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
    }
    mediaListOptions {
      scoreFormat
    }
  }
}`;

export const getViewer = query<Viewer>(Query, (x) => {
  x.Viewer.options.titleLanguage = x.Viewer.options.titleLanguage.split("_")[0];
  return x.Viewer;
});

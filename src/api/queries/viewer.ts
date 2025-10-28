import { query } from "../anilist";

export type ProfileColor =
  | "blue"
  | "purple"
  | "pink"
  | "orange"
  | "red"
  | "green"
  | "gray";

export type TitleLanguage =
  | "ROMAJI"
  | "ENGLISH"
  | "NATIVE"
  | "ROMAJI_STYLISED"
  | "ENGLISH_STYLISED"
  | "NATIVE_STYLISED";

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
  }
}`;

export const getViewer = query<Viewer>(Query, (x) => x.Viewer);

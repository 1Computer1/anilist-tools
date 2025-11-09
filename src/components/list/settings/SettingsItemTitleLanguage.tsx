import {
  type Viewer,
  type TitleLanguage,
  TITLE_LANGUAGES,
} from "../../../api/queries/viewer";
import type { UseAnilistQueryResult } from "../../../hooks/anilist";
import type { Cell } from "../../../hooks/useCell";
import { nameOfTitleLanguage } from "../../../util/settings";
import CustomListbox from "../../CustomListbox";
import SettingsItem from "./SettingsItem";

export default function SettingsItemTitleLanguage({
  viewer,
  titleLanguage,
}: {
  viewer: UseAnilistQueryResult<Viewer>;
  titleLanguage: Cell<TitleLanguage>;
}) {
  return (
    <SettingsItem label="Title Language">
      <CustomListbox
        className="select w-full"
        disabled={viewer.data == null}
        value={titleLanguage.value}
        onChange={(v) => titleLanguage.set(v)}
        options={TITLE_LANGUAGES}
        buttonContents={nameOfTitleLanguage(titleLanguage.value)}
        optionContents={(value) => nameOfTitleLanguage(value)}
      />
    </SettingsItem>
  );
}

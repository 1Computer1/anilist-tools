import type { Viewer } from "../../../api/queries/viewer";
import type { UseAnilistQueryResult } from "../../../hooks/anilist";
import type { Cell } from "../../../hooks/useCell";
import { nameOfSortBy, type SortBy } from "../../../util/settings";
import CustomListbox from "../../CustomListbox";
import SettingsItem from "./SettingsItem";

export default function SettingsItemSortBy<T extends SortBy>({
  viewer,
  sortBy,
  options,
}: {
  viewer: UseAnilistQueryResult<Viewer>;
  sortBy: Cell<T>;
  options: T[];
}) {
  return (
    <SettingsItem label="Sort By">
      <CustomListbox
        className="select w-full"
        disabled={viewer.data == null}
        value={sortBy.value}
        options={options}
        onChange={(v) => {
          sortBy.set(v);
        }}
        buttonContents={nameOfSortBy(sortBy.value)}
        optionContents={(value) => nameOfSortBy(value)}
      />
    </SettingsItem>
  );
}

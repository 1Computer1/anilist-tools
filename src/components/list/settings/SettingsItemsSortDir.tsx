import { Button } from "@headlessui/react";
import { PiShuffleFill } from "react-icons/pi";
import type { Viewer } from "../../../api/queries/viewer";
import type { UseAnilistQueryResult } from "../../../hooks/anilist";
import type { Cell } from "../../../hooks/useCell";
import {
  SORT_DIRS,
  nameOfSortDir,
  seedgen,
  type SortBy,
  type SortDir,
} from "../../../util/settings";
import CustomListbox from "../../CustomListbox";
import SettingsItem from "./SettingsItem";

export default function SettingsItemSortDir<T extends SortBy>({
  viewer,
  sortBy,
  sortDir,
  randomSeed,
}: {
  viewer: UseAnilistQueryResult<Viewer>;
  sortBy: T;
  sortDir: Cell<SortDir>;
} & (T extends "random"
  ? { randomSeed: Cell<number> }
  : { randomSeed?: undefined })) {
  return randomSeed != null && sortBy == "random" ? (
    <Button
      className="btn btn-outline btn-secondary"
      onClick={() => {
        randomSeed.set(seedgen());
      }}
    >
      <PiShuffleFill /> Reshuffle
    </Button>
  ) : (
    <SettingsItem label="Sort Direction">
      <CustomListbox
        className="select w-full"
        disabled={viewer.data == null}
        value={sortDir.value}
        options={SORT_DIRS}
        onChange={(v) => sortDir.set(v)}
        buttonContents={nameOfSortDir(sortDir.value)}
        optionContents={(value) => nameOfSortDir(value)}
      />
    </SettingsItem>
  );
}

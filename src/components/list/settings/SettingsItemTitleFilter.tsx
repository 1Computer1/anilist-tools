import { Input } from "@headlessui/react";
import type { Viewer } from "../../../api/queries/viewer";
import type { UseAnilistQueryResult } from "../../../hooks/anilist";
import type { Cell } from "../../../hooks/useCell";
import SettingsItem from "./SettingsItem";

export default function SettingsItemTitleFilter({
  viewer,
  titleFilter,
}: {
  viewer: UseAnilistQueryResult<Viewer>;
  titleFilter: Cell<string>;
}) {
  return (
    <SettingsItem label="Title Filter">
      <Input
        className="input w-full"
        disabled={viewer.data == null}
        placeholder="🔍 Search..."
        value={titleFilter.value}
        onChange={(e) => titleFilter.set(e.target.value)}
      />
    </SettingsItem>
  );
}

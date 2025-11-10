import { Input } from "@headlessui/react";
import type { Viewer } from "../../../api/queries/viewer";
import type { UseAnilistQueryResult } from "../../../hooks/anilist";
import type { Cell } from "../../../hooks/useCell";
import SettingsItem from "./SettingsItem";

export default function SettingsItemFilter({
  viewer,
  filter,
}: {
  viewer: UseAnilistQueryResult<Viewer>;
  filter: Cell<string>;
}) {
  return (
    <SettingsItem label="Filter">
      <Input
        className="input w-full"
        disabled={viewer.data == null}
        placeholder="🔍 Search..."
        value={filter.value}
        onChange={(e) => filter.set(e.target.value)}
      />
    </SettingsItem>
  );
}

import { DateTime } from "luxon";
import type { Viewer } from "../../../api/queries/viewer";
import type { UseAnilistQueryResult } from "../../../hooks/anilist";
import type { Cell } from "../../../hooks/useCell";
import SettingsItem from "./SettingsItem";
import CustomDateInput from "../../CustomDateInput";

export default function SettingsItemDate({
  label = "Date",
  viewer,
  date,
}: {
  label?: string;
  viewer: UseAnilistQueryResult<Viewer>;
  date: Cell<DateTime>;
}) {
  return (
    <SettingsItem label={label}>
      <CustomDateInput
        disabled={viewer.data == null}
        value={date.value}
        onChange={date.set}
      />
    </SettingsItem>
  );
}

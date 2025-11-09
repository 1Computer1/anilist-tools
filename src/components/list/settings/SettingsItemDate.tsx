import clsx from "clsx";
import { DateTime } from "luxon";
import type { Viewer } from "../../../api/queries/viewer";
import type { UseAnilistQueryResult } from "../../../hooks/anilist";
import type { Cell } from "../../../hooks/useCell";
import SettingsItem from "./SettingsItem";

export default function SettingsItemDate({
  label = "Date",
  viewer,
  date,
  andDate,
}: {
  label?: string;
  viewer: UseAnilistQueryResult<Viewer>;
  date: Cell<DateTime>;
  andDate: (d: DateTime) => DateTime;
}) {
  return (
    <SettingsItem label={label}>
      <input
        type="date"
        disabled={viewer.data == null}
        value={date.value.toISODate()!}
        onChange={(e) => {
          const value = e.target.valueAsDate
            ? (DateTime.fromISO(e.target.value) ?? DateTime.local())
            : DateTime.local();
          date.set(andDate(value));
        }}
        className={clsx(
          "bg-base-100 rounded-field border-base-content/20 flex h-(--size) flex-col border p-2 text-sm shadow-sm",
          "disabled:bg-base-200 disabled:text-base-content/40 focus:outline-none disabled:cursor-not-allowed disabled:border-none disabled:shadow-none",
        )}
      />
    </SettingsItem>
  );
}

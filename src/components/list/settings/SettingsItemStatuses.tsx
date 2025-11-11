import clsx from "clsx";
import { PiCheckFatFill } from "react-icons/pi";
import type { MediaListStatus, MediaType } from "../../../api/queries/list";
import type { Viewer } from "../../../api/queries/viewer";
import type { UseAnilistQueryResult } from "../../../hooks/anilist";
import type { Cell } from "../../../hooks/useCell";
import { nameOfStatus } from "../../../util/settings";
import CustomListbox from "../../CustomListbox";
import SettingsItem from "./SettingsItem";

export default function SettingsItemStatuses<T extends MediaListStatus>({
  label = "Status",
  viewer,
  listType,
  options,
  statuses,
}: {
  label?: string;
  viewer: UseAnilistQueryResult<Viewer>;
  listType: MediaType;
  options: T[];
  statuses: Cell<T[]>;
}) {
  return (
    <SettingsItem label={label}>
      <CustomListbox<T>
        className="select select-sm w-full text-sm"
        disabled={viewer.data == null}
        multiple
        value={statuses.value}
        options={options}
        onChange={(v) => {
          if (v.length > 0) {
            statuses.set(v);
          }
        }}
        buttonContents={
          <span className="inline-block truncate">
            {[...statuses.value]
              .sort((a, b) => options.indexOf(a) - options.indexOf(b))
              .map((x) => nameOfStatus(listType, x))
              .join(", ")}
          </span>
        }
        optionContents={(value) => (
          <div className="inline-flex flex-row items-center gap-x-2">
            <div
              className={clsx(!statuses.value.includes(value) && "invisible")}
            >
              <PiCheckFatFill />
            </div>
            <span>{nameOfStatus(listType, value)}</span>
          </div>
        )}
      />
    </SettingsItem>
  );
}

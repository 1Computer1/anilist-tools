import clsx from "clsx";
import {
  PiCloudWarningFill,
  PiBugFill,
  PiLockFill,
  PiWrenchFill,
} from "react-icons/pi";
import { alertForSeverity, type Severity } from "../util/severity";

export function Alert({
  type,
  severity = "ERROR",
  children,
}: {
  type: "NETWORK" | "APP" | "AUTH" | "SETTINGS";
  severity?: Severity;
  children: any;
}) {
  return (
    <div
      className={clsx(
        "alert alert-soft alert-vertical text-xl whitespace-pre-wrap",
        alertForSeverity(severity),
      )}
    >
      {
        {
          NETWORK: <PiCloudWarningFill className="size-8" />,
          APP: <PiBugFill className="size-8" />,
          AUTH: <PiLockFill className="size-8" />,
          SETTINGS: <PiWrenchFill className="size-8" />,
        }[type]
      }
      <div>{children}</div>
    </div>
  );
}

import clsx from "clsx";
import {
  PiCloudWarningFill,
  PiBugFill,
  PiLockFill,
  PiWrenchFill,
} from "react-icons/pi";

export type Severity = "NORMAL" | "BAD" | "WARN";

export function Alert({
  type,
  severity = "BAD",
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
        { NORMAL: "alert-info", BAD: "alert-error", WARN: "alert-warning" }[
          severity
        ],
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

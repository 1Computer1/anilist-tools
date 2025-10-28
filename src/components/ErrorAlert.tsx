import { PiCloudWarningFill, PiBugFill, PiLockFill } from "react-icons/pi";

export function ErrorAlert({
  type,
  children,
}: {
  type: "NETWORK" | "APP" | "AUTH";
  children: any;
}) {
  return (
    <div className="alert alert-error alert-soft alert-vertical text-xl whitespace-pre-wrap">
      {
        {
          NETWORK: <PiCloudWarningFill className="size-8" />,
          APP: <PiBugFill className="size-8" />,
          AUTH: <PiLockFill className="size-8" />,
        }[type]
      }
      <div>{children}</div>
    </div>
  );
}

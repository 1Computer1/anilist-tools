import clsx from "clsx";
import Tooltip, { type TooltipProps } from "headless-tooltip";

export type Severity = "NORMAL" | "BAD" | "GOOD";

export default function CustomTooltip({
  severity,
  content,
  children,
  ...props
}: {
  severity: Severity;
  content: React.ReactNode;
  children?: React.ReactNode;
  props?: TooltipProps;
}) {
  return (
    <Tooltip
      arrow
      tabIndex={-1}
      className={clsx(
        "bg-base-100 text-base-content rounded-field border-base-content/20 w-fit border p-2 text-xs text-balance shadow",
      )}
      arrowClassName="bg-base-100 border-base-content/20 border"
      content={content}
      {...props}
    >
      {children}
    </Tooltip>
  );
}

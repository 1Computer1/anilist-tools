import clsx from "clsx";
import Tooltip, { type TooltipProps } from "headless-tooltip";

export default function CustomTooltip({
  content,
  children,
  ...props
}: {
  content: React.ReactNode;
  children?: React.ReactNode;
  props?: TooltipProps;
}) {
  return (
    <Tooltip
      arrow
      className={clsx(
        "bg-base-100 text-base-content rounded-field border-base-content/20 w-fit border p-2 text-xs text-balance shadow",
      )}
      arrowClassName="bg-base-100 border-base-content/20 border"
      content={content}
      {...props}
    >
      <div tabIndex={-1}>{children}</div>
    </Tooltip>
  );
}

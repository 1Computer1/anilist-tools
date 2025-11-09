import type { DialogState } from "../../hooks/useDialog";
import CustomDialog from "./CustomDialog";

export default function LoadingDialog({
  children,
  state,
}: {
  children: React.ReactNode;
  state: DialogState<any>;
}) {
  return (
    <CustomDialog state={state} closeable={false}>
      <div className="flex-center gap-y-2">
        <span>{children}</span>
        <progress className="progress progress-success w-full"></progress>
      </div>
    </CustomDialog>
  );
}

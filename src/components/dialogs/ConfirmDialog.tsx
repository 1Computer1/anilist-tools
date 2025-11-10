import type { DialogState } from "../../hooks/useDialog";
import type { Severity } from "../../util/severity";
import ChoicesDialog from "./ChoicesDialog";

export type ConfirmDialogContext = {
  title: React.ReactNode;
  action: React.ReactNode;
  cancel?: React.ReactNode;
  severity: Severity;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
};

export default function ConfirmDialog({
  state,
}: {
  state: DialogState<ConfirmDialogContext>;
}) {
  return (
    <ChoicesDialog
      state={state}
      title={state.context.title}
      choices={[
        {
          text: state.context.action,
          severity: state.context.severity,
          onClick: () => {
            state.context.onConfirm();
            state.close();
          },
        },
        {
          text: state.context.cancel ?? "Cancel",
          severity: "PRIMARY",
          onClick: () => {
            state.context.onCancel?.();
            state.close();
          },
        },
      ]}
    >
      {state.context.message}
    </ChoicesDialog>
  );
}

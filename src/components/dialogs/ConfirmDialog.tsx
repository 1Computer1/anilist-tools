import type { DialogState } from "../../hooks/useDialog";
import ChoicesDialog, { type Severity } from "./ChoicesDialog";

export type ConfirmDialogContext = {
  title: React.ReactNode;
  action: React.ReactNode;
  severity: Severity;
  message: React.ReactNode;
  onConfirm: () => void;
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
          text: "Cancel",
          severity: "NORMAL",
          onClick: () => {
            state.close();
          },
        },
      ]}
    >
      {state.context.message}
    </ChoicesDialog>
  );
}

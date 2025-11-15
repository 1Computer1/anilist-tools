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

export type ConfirmDialogProps =
  | {
      state: DialogState<ConfirmDialogContext>;
    }
  | ({ state: DialogState } & ConfirmDialogContext);

export default function ConfirmDialog({
  state,
  ...propsContext
}: ConfirmDialogProps) {
  const context = state.context ?? (propsContext as ConfirmDialogContext);

  return (
    <ChoicesDialog
      state={state}
      title={context.title}
      choices={[
        {
          text: context.action,
          severity: context.severity,
          onClick: () => {
            context.onConfirm();
            state.close();
          },
        },
        {
          text: context.cancel ?? "Cancel",
          severity: "PRIMARY",
          onClick: () => {
            context.onCancel?.();
            state.close();
          },
        },
      ]}
    >
      {context.message}
    </ChoicesDialog>
  );
}

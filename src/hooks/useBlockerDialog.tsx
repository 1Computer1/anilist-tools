import { useBlocker } from "@tanstack/react-router";
import type { DialogState } from "./useDialog";
import type { ConfirmDialogContext } from "../components/dialogs/ConfirmDialog";

export default function useBlockerDialog({
  shouldBlock,
  confirmDialog,
}: {
  shouldBlock: () => boolean;
  confirmDialog: DialogState<ConfirmDialogContext>;
}) {
  useBlocker({
    shouldBlockFn: () => {
      const should = shouldBlock();

      if (!should) {
        return false;
      }

      return new Promise((resolve) => {
        confirmDialog.openWith({
          title: "Leave Page",
          action: "Leave",
          cancel: "Stay",
          severity: "ERROR",
          message: (
            <>
              Are you sure you want to leave?
              <br />
              You will lose all unsaved changes.
            </>
          ),
          onCancel: () => resolve(true),
          onConfirm: () => resolve(false),
        });
      });
    },
    enableBeforeUnload: () => shouldBlock(),
  });
}

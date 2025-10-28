import {
  Button,
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import type { DialogState } from "../hooks/useDialog";
import clsx from "clsx";

export type Severity = "NORMAL" | "BAD" | "GOOD";

export default function ChoicesDialog({
  state,
  title,
  children,
  choices,
}: {
  state: DialogState;
  title: string;
  choices: { text: string; severity: Severity; onClick: () => unknown }[];
  children: any;
}) {
  return (
    <Dialog open={state.isOpen} onClose={() => state.close()} className="">
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex h-screen w-screen items-center justify-center">
        <DialogPanel className="bg-base-100 card card-border m-4 max-w-lg min-w-xs">
          <div className="card-body">
            <DialogTitle className="card-title">{title}</DialogTitle>
            <Description className="text-wrap whitespace-pre-wrap">
              {children}
            </Description>
            <div className="card-actions mt-2 flex w-full flex-row justify-end gap-2">
              {choices.map(({ text, severity, onClick }) => (
                <Button
                  className={clsx(
                    "btn btn-outline",
                    {
                      NORMAL: "btn-primary",
                      BAD: "btn-error",
                      GOOD: "btn-success",
                    }[severity],
                  )}
                  onClick={onClick}
                >
                  {text}
                </Button>
              ))}
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

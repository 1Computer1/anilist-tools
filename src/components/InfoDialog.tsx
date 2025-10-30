import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import type { DialogState } from "../hooks/useDialog";
import { PiXCircleFill } from "react-icons/pi";

export type Severity = "NORMAL" | "BAD" | "GOOD";

export default function InfoDialog({
  state,
  title,
  children,
}: {
  state: DialogState;
  title: string;
  children: any;
}) {
  return (
    <Dialog
      open={state.isOpen}
      onClose={() => state.close()}
      transition
      className="transition duration-150 ease-out data-closed:opacity-0"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex h-dvh w-dvw items-center justify-center">
        <DialogPanel className="bg-base-100 card card-border m-4 max-w-lg min-w-xs">
          <div className="card-body">
            <div className="flex flex-row items-center justify-between">
              <DialogTitle className="card-title">{title}</DialogTitle>
              <Button
                className="btn btn-ghost btn-square btn-sm -mt-8 -mr-4 size-6 text-base"
                onClick={() => state.close()}
              >
                <PiXCircleFill />
              </Button>
            </div>
            <div className="text-wrap">{children}</div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
